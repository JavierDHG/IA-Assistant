import google.generativeai as genai
from django.conf import settings
from .models import Doctor
import json
from datetime import date, timedelta

genai.configure(api_key=settings.GOOGLE_API_KEY)

def generar_respuesta_natural(instruccion: str, datos_de_contexto: dict) -> str:
    """
    Usa la IA para generar una respuesta de texto creativa y natural.
    Utiliza un sistema de marcadores de posición para los datos.
    """
    prompt = f"""
    ### ROL ###
    Eres un generador de texto. Tu única tarea es crear una respuesta conversacional corta y amigable basada en una instrucción.

    ### INSTRUCCIÓN CLAVE Y REGLA DE ORO ###
    Si en la instrucción se menciona un marcador de posición como `__DATOS_A_INCLUIR__`, DEBES incluir esa cadena de texto exacta en tu respuesta. NO intentes adivinar, generar o reemplazar el contenido del marcador. Mi código se encargará de reemplazarlo después con los datos correctos. Céntrate únicamente en generar el texto de la conversación alrededor del marcador.

    ### INSTRUCCIÓN PARA ESTA RESPUESTA ###
    {instruccion}

    ### DATOS DE CONTEXTO (Para darte una idea del tema, no para que los copies) ###
    {json.dumps(datos_de_contexto, indent=2, ensure_ascii=False)}

    Genera ahora la respuesta para el usuario.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Configuraciones para reducir la "creatividad" no deseada
        generation_config = genai.types.GenerationConfig(
            temperature=0.2, # Un valor más bajo hace que la IA sea más predecible y obediente
        )
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    except Exception as e:
        print(f"Error al generar respuesta natural: {e}")
        return "Lo siento, tuve un problema al procesar mi respuesta. ¿Podrías intentarlo de nuevo?"


def procesar_peticion_con_contexto(texto_usuario: str, contexto: dict) -> dict:
    """
    Procesa la petición del usuario DENTRO de un contexto de conversación,
    haciendo una llamada real a la API de Gemini.
    """
    doctores = Doctor.objects.all()
    lista_doctores_str = ", ".join(
        [f"ID: {d.id}, Nombre: {d.name}" for d in doctores])

    # Construimos una historia de la conversación para la IA
    historia = f"El objetivo actual del usuario es '{contexto.get('intent', 'ninguno')}'. "
    historia += f"Ya hemos recolectado estos datos: {contexto.get('collected_data', {})}. "
    historia += f"La última pregunta que le hicimos fue sobre '{contexto.get('last_question_asked', 'ninguna')}'. "

    # Obtenemos la fecha actual para que la IA pueda interpretar "mañana", "lunes", etc.
    today = date.today()
    tomorrow = today + timedelta(days=1)

    prompt = f"""
    ### ROL Y OBJETIVO ###
    Eres un asistente de IA experto en **interpretación de lenguaje natural** para una clínica dental. Tu tarea principal es entender frases coloquiales, pronombres y referencias basándote en el historial completo de la conversación para cumplir un objetivo. Debes ser eficiente y preciso.

    ### CONTEXTO QUE TIENES PARA TOMAR DECISIONES ###
    1.  **La Fecha de Hoy es:** {today.strftime('%Y-%m-%d')}.
    2.  **Lista de Doctores Disponibles:** {lista_doctores_str}.
    3.  **Historial de la Conversación Actual:**
    4.  **Si el usuario usa formato de 12 horas (ej: '3 pm', '4 de la tarde'), conviértelo siempre al formato de 24 horas (HH:MM) en        
        tu respuesta JSON. '3 pm' se convierte en '15:00'.**
        - Objetivo General (Intent): '{contexto.get('intent', 'ninguno')}'
        - Datos ya Recolectados: {contexto.get('collected_data', {})}
        - Tu Última Pregunta al Usuario: '{contexto.get('last_question_asked', 'ninguna')}'
        - Tu Última Respuesta Completa al Usuario: '{contexto.get('last_bot_response', 'ninguna')}'

    ### NUEVA FRASE DEL USUARIO A INTERPRETAR ###
    "{texto_usuario}"

    ### INSTRUCCIONES Y POSIBLES INTENCIONES ###
    1.  Tu misión más importante es resolver pronombres ("él") y referencias ("el primero", "a esa hora") usando la "Última Respuesta Completa" y la "Lista de Doctores".
    2.  Determina la **intención (`intent`)** del usuario. Las opciones son: `agendar_cita`, `consultar_mis_citas`, `listar_doctores`, `saludar`, `finalizar_chat`, `paso_atras`, `confirmacion_positiva`, `confirmacion_negativa`, `consultar_disponibilidad`, `cancelar_cita`, `cancelar_todas_las_citas`.
    3.  Extrae **datos (`extracted_data`)** relevantes: `doctor_name`, `date` (en formato AAAA-MM-DD), `time` (en formato HH:MM). Interpreta fechas relativas como "mañana".
    4.  Responde SIEMPRE con un único objeto JSON válido con las claves `intent` y `extracted_data`.

    ### EJEMPLOS DE CASOS DE USO ###

    # Caso: Inicio de conversación
    - Historia: {{'intent': 'ninguno'}}
    - Frase de Usuario: "hola, para una cita"
    - Tu Respuesta JSON: {{"intent": "agendar_cita", "extracted_data": {{}}}}

    # Caso: Interpretación de referencia ("el primero")
    - Historia: {{..., 'last_bot_response': 'Nuestros doctores disponibles son: Dr. David, Dra. Ana.'}}
    - Frase de Usuario: "con el primero estaría bien"
    - Tu Respuesta JSON: {{"intent": "agendar_cita", "extracted_data": {{"doctor_name": "David"}}}}

    # Caso: Interpretación de fecha y hora relativas
    - Historia: {{..., 'last_bot_response': 'Perfecto. Ahora elige un día... - Lunes 23: 09:00, 10:00'}}
    - Frase de Usuario: "a las diez de la mañana de ese día"
    - Tu Respuesta JSON: {{"intent": "agendar_cita", "extracted_data": {{"date": "2025-06-23", "time": "10:00"}}}}

    # Caso: Volver un paso atrás
    - Historia: {{'intent': 'agendar_cita', 'last_question_asked': 'ask_for_day'}}
    - Frase de Usuario: "espera, quiero cambiar el doctor"
    - Tu Respuesta JSON: {{"intent": "paso_atras", "extracted_data": {{}}}}

    # Caso: Finalizar la conversación
    - Historia: {{'intent': 'agendar_cita', 'last_question_asked': 'ask_for_doctor'}}
    - Frase de Usuario: "mejor lo dejamos así, gracias"
    - Tu Respuesta JSON: {{"intent": "finalizar_chat", "extracted_data": {{}}}}

    # Caso: Confirmación de la cita
    - Historia: {{..., 'status': 'awaiting_confirmation'}}
    - Frase de Usuario: "Sí, todo correcto"
    - Tu Respuesta JSON: {{"intent": "confirmacion_positiva", "extracted_data": {{}}}}

    # Caso: Interpretación de formato de 12 horas
    - Historia: {{'intent': 'agendar_cita', 'last_question_asked': 'ask_for_time'}}
    - Frase de Usuario: "a las 2 y media de la tarde"
    - Tu Respuesta JSON: {{"intent": "agendar_cita", "extracted_data": {{"time": "14:30"}}}}

    # Caso: Cancelar una cita específica
    - Historia: {{'intent': 'ninguno'}}
    - Frase de Usuario: "Hola, quiero cancelar la cita que tengo para el 23 de este mes"
    - Tu Respuesta JSON: {{"intent": "cancelar_cita", "extracted_data": {{"date": "2025-06-23"}}}}

    # Caso: Cancelación Múltiple (¡VERSIÓN CORREGIDA CON LLAVES DOBLES!)
    - Historia: {{'intent': 'ninguno'}}
    - Frase de Usuario: "Hola, por favor cancela mi cita del viernes 20 a las 9:30 y también la del lunes 23 a las 10am"
    - Tu Respuesta JSON: {{{{
        "intent": "cancelar_cita",
        "extracted_data": {{
          "citas_a_cancelar": [
            {{"date": "2025-06-20", "time": "09:30"}},
            {{"date": "2025-06-23", "time": "10:00"}}
          ]
        }}
      }}}}

    #  Caso: Cancelar todas las citas a la vez
    - Historia: {{'intent': 'ninguno'}}
    - Frase de Usuario: "Hola, quiero cancelar todas las citas"
    - Tu Respuesta JSON: {{"intent": "cancelar_todas_las_citas", "extracted_data": {{"all_citas": "true"}}}}
    """

    try:
        # ### ESTA ES LA PARTE REAL QUE REEMPLAZA LA SIMULACIÓN ###
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)

        # Limpiar la respuesta para asegurar que sea un JSON válido
        respuesta_limpia = response.text.strip().replace(
            '```json', '').replace('```', '').strip()

        # Cargar la respuesta JSON en un diccionario de Python
        return json.loads(respuesta_limpia)

    except Exception as e:
        print(f"Error al procesar con Gemini o al parsear JSON: {e}")
        # En caso de error, devolvemos una estructura vacía y segura
        return {"intent": contexto.get('intent', 'accion_desconocida'), "extracted_data": {}}
