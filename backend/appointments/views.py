from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Appointment, Doctor
from .serializer import AppointmentSerializer, DoctorEmailSerializer, UserRegisterSerializer
from .ai_utils import procesar_peticion_con_contexto, generar_respuesta_natural
from .google_calendar_utils import crear_evento_gcal, eliminar_evento_gcal
from datetime import datetime, date, time, timedelta
from rest_framework.permissions import IsAuthenticated
from django.utils.translation import gettext as _
from django.utils import timezone
from django.contrib.auth.models import User

# --- ViewSets Estándar (Sin cambios) ---
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(paciente=self.request.user).order_by('date', 'time')

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorEmailSerializer

class RegisterView(generics.CreateAPIView):
    """
    Crea un nuevo usuario en el sistema.
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

# --- Funciones de Ayuda (Sin cambios) ---
def obtener_horarios_disponibles(doctor: Doctor, fecha: date) -> list:
    """
    Función helper que devuelve una LISTA DE OBJETOS 'time' de Python 
    con los horarios disponibles.
    """
    slots_disponibles = []
    horario_inicio = time(9, 0)
    horario_fin = time(17, 0)
    intervalo = timedelta(hours=0.5) 
    ahora = timezone.now()
    
    bloqueo_inicio = time(12, 30)
    bloqueo_fin = time(14, 0)

    citas_agendadas = Appointment.objects.filter(doctor=doctor, date=fecha)
    horas_ocupadas = {cita.time for cita in citas_agendadas}

    slot_actual = datetime.combine(fecha, horario_inicio)
    while slot_actual.time() < horario_fin:
        slot_actual_tz = timezone.make_aware(slot_actual, timezone.get_current_timezone())
        es_hora_de_descanso = bloqueo_inicio <= slot_actual.time() < bloqueo_fin
        
        if slot_actual.time() not in horas_ocupadas and slot_actual_tz > ahora and not es_hora_de_descanso:
            # ### CAMBIO CLAVE: Añadimos el objeto 'time', no el texto ###
            slots_disponibles.append(slot_actual.time())
            
        slot_actual += intervalo

    return slots_disponibles

def guardar_y_responder(respuesta_texto, contexto, request):
    """Guarda la respuesta del bot en el contexto y luego lo guarda en la sesión."""
    contexto['last_bot_response'] = respuesta_texto
    request.session['conversation_context'] = contexto
    return Response({"respuesta": respuesta_texto})


# ### CLASE ASISTENTE CITAS - VERSIÓN FINAL Y COMPLETA ###
class AsistenteCitasView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 1. Cargar contexto y mensaje
        contexto = request.session.get('conversation_context', {})
        contexto.setdefault('last_bot_response', 'Inicio de la conversación.')
        mensaje_usuario = request.data.get('mensaje')
        if not mensaje_usuario:
            return Response({"error": "El campo 'mensaje' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        # ### NUEVO BLOQUE DE REINICIO ###
        # Si el frontend envía este mensaje especial, borramos la sesión y terminamos.
        if mensaje_usuario == "__RESET_CONVERSATION__":
            request.session.pop('conversation_context', None)
            return Response({"status": "session_reset"})

        # 2. Interpretar la intención del usuario
        respuesta_ia = procesar_peticion_con_contexto(mensaje_usuario, contexto)
        accion_detectada = respuesta_ia.get('intent')

        # 3. Actualizar contexto (manejando acciones globales)
        if accion_detectada not in ['paso_atras', 'finalizar_chat']:
            contexto['intent'] = accion_detectada or contexto.get('intent')
            contexto.setdefault('collected_data', {}).update(respuesta_ia.get('extracted_data', {}))
        
        # Lógica especial para 'paso_atras'
        if accion_detectada == 'paso_atras' and 'intent' in contexto:
            if contexto.get('status') == 'awaiting_confirmation':
                 contexto['collected_data'].pop('time', None); contexto['status'] = None; contexto['last_question_asked'] = 'ask_for_time'
            elif contexto.get('last_question_asked') == 'ask_for_time':
                contexto['collected_data'].pop('date', None); contexto['last_question_asked'] = 'ask_for_day'
            elif contexto.get('last_question_asked') == 'ask_for_day':
                contexto.get('collected_data', {}).pop('doctor', None); contexto.get('collected_data', {}).pop('doctor_name', None); contexto['last_question_asked'] = 'ask_for_doctor'
            contexto['intent'] = 'agendar_cita'
        
        # Variables locales para un acceso más limpio
        accion = contexto.get('intent')
        datos = contexto.get('collected_data', {})
        usuario_actual = request.user
        
        # 4. LÓGICA DE ESTADO PRINCIPAL (UNA SOLA CADENA IF/ELIF/ELSE)
        
        # --- ACCIÓN GLOBAL: Finalizar Chat ---
        if accion_detectada == 'finalizar_chat':
            request.session.pop('conversation_context', None)
            instruccion = "El usuario quiere terminar la conversación. Despídete amablemente y confirma que cualquier proceso ha sido cancelado. No muestre '__DATOS_A_INCLUIR__' en la respuesta"
            return Response({"respuesta": generar_respuesta_natural(instruccion, {})})

        # --- ESTADO ESPECIAL: Esperando Confirmación ---
        elif contexto.get('status') == 'awaiting_confirmation':
            if accion_detectada == 'confirmacion_positiva':
                try:
                    if Appointment.objects.filter(doctor_id=datos['doctor'], date=datos['date'], time=datos['time']).exists():
                        request.session.pop('conversation_context', None)
                        instruccion = "Informa al usuario que, lamentablemente, el horario que eligió acaba de ser ocupado. Pídele disculpas y anímale a iniciar el proceso de nuevo. No muestre el horario que el usuario eligió. Ademas digale que tiene que empezar nuevamente desde el principio. No muestre '__DATOS_A_INCLUIR__' en la respuesta"
                        return Response({"respuesta": generar_respuesta_natural(instruccion, {})})
                except Exception: pass
                
                datos['paciente'] = usuario_actual.id
                serializer = AppointmentSerializer(data=datos)
                if serializer.is_valid():
                    cita_guardada = serializer.save()
                    event_id_gcal = crear_evento_gcal(cita_guardada)
                    if event_id_gcal:
                        cita_guardada.google_calendar_event_id = event_id_gcal; cita_guardada.save()
                    
                    datos_para_respuesta = {"doctor_name": cita_guardada.doctor.name, "date": cita_guardada.date.strftime('%d de %B de %Y'), "time": cita_guardada.time.strftime('%I:%M %p')}
                    instruccion = "La cita ha sido agendada con éxito. Genera un mensaje de confirmación final muy positivo, usando los detalles que te proporciono. No muestres '__DATOS_A_INCLUIR__' en la respuesta, pero muestre en español el mes y el día de la cita."
                    respuesta_generada = generar_respuesta_natural(instruccion, datos_para_respuesta)
                    request.session.pop('conversation_context', None)
                    return Response({"respuesta": respuesta_generada, "cita": serializer.data}, status=status.HTTP_201_CREATED)
                else:
                    request.session.pop('conversation_context', None)
                    return Response({"respuesta": "Hubo un error con los datos finales. Empecemos de nuevo.", "errores": serializer.errors})
            else: 
                request.session.pop('conversation_context', None)
                instruccion = "El usuario ha decidido no confirmar la cita. Informa amablemente que el proceso se ha cancelado."
                return Response({"respuesta": generar_respuesta_natural(instruccion, {})})

         # --- INTENT: AGENDAR CITA (Lógica de pasos con datos estructurados para el Frontend) ---
        elif accion == 'agendar_cita' or (contexto.get('intent') == 'agendar_cita' and accion_detectada == 'consultar_disponibilidad'):
            dias_en_espanol = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
            
            # --- PASO A: Lógica para obtener el DOCTOR ---
            if 'doctor' not in datos:
                # Si el usuario ya mencionó un nombre, intentamos encontrarlo
                if 'doctor_name' in datos:
                    try:
                        doctor = Doctor.objects.get(name__iexact=datos['doctor_name'])
                        contexto['collected_data']['doctor'] = doctor.id
                        # NO hacemos 'return'. Dejamos que el código continúe al siguiente paso lógico.
                        datos = contexto['collected_data'] # Actualizamos la variable local
                    except Doctor.DoesNotExist:
                        contexto['last_question_asked'] = 'ask_for_doctor'
                        doctores = [d.name for d in Doctor.objects.all()]
                        # Preparamos una respuesta estructurada para el frontend
                        datos_para_frontend = {
                            "tipo": "seleccion_simple",
                            "titulo": f"Lo siento, no encontré al Dr. {datos['doctor_name']}. Nuestros doctores disponibles son:",
                            "opciones": doctores
                        }
                        return guardar_y_responder(datos_para_frontend, contexto, request)
                else: 
                    # Si no ha mencionado ningún doctor, lo pedimos.
                    contexto['last_question_asked'] = 'ask_for_doctor'
                    doctores = [d.name for d in Doctor.objects.all()]
                    datos_para_frontend = {
                        "tipo": "seleccion_simple",
                        "titulo": "¡Claro! Para empezar, ¿con qué doctor te gustaría tu cita?",
                        "opciones": doctores
                    }
                    return guardar_y_responder(datos_para_frontend, contexto, request)
            
            # --- PASO B: Lógica para obtener la FECHA ---
            if 'date' not in datos or accion_detectada == 'consultar_disponibilidad':
                doctor = Doctor.objects.get(id=datos['doctor'])
                horarios_por_dia = []
                horarios_obj_validos = []
                dias_encontrados = 0; fecha_actual = date.today()
                while dias_encontrados < 5 and (fecha_actual - date.today()).days < 15:
                    if fecha_actual.weekday() < 5:
                        horarios_del_dia = obtener_horarios_disponibles(doctor, fecha_actual)
                        if horarios_del_dia:
                            horarios_obj_validos.extend(horarios_del_dia)
                            horarios_por_dia.append({
                                "dia_semana": dias_en_espanol[fecha_actual.weekday()],
                                "dia_numero": fecha_actual.day,
                                "fecha_completa": fecha_actual.strftime('%Y-%m-%d'),
                                "horarios": [t.strftime('%I:%M %p') for t in horarios_del_dia]
                            })
                        dias_encontrados += 1
                    fecha_actual += timedelta(days=1)
                
                if not horarios_por_dia:
                    instruccion = "Informa que el doctor no tiene horarios disponibles. Sugiérele intentar con otro doctor."
                    respuesta_generada = generar_respuesta_natural(instruccion, {"nombre_doctor": doctor.name})
                    return guardar_y_responder(respuesta_generada, contexto, request)

                contexto['available_slots'] = [t.strftime('%H:%M') for t in horarios_obj_validos]
                contexto['last_question_asked'] = 'ask_for_day'
                
                datos_para_frontend = {
                    "tipo": "lista_horarios",
                    "titulo": f"¡Perfecto! Estos son los próximos horarios disponibles para el Dr. **{doctor.name}**:",
                    "dias": horarios_por_dia
                }
                return guardar_y_responder(datos_para_frontend, contexto, request)

            # --- PASO C: Lógica para obtener la HORA ---
            if 'time' not in datos:
                contexto['last_question_asked'] = 'ask_for_time'
                instruccion = "El usuario ya eligió doctor y día. Ahora pídele que especifique una hora de las disponibles."
                # Enviamos una respuesta de texto simple, que BotMessage sabe renderizar
                return guardar_y_responder({"text": generar_respuesta_natural(instruccion, {})}, contexto, request)

            # --- PASO D y FINAL: Validar la Hora y Pedir Confirmación ---
            # Este bloque 'else' implícito solo se ejecuta si ya tenemos doctor, fecha y hora.
            slots_validos_str = contexto.get('available_slots', [])
            hora_ingresada_str = datos.get('time')
            hora_estandarizada_24h = None
            if hora_ingresada_str:
                for fmt in ('%H:%M', '%I:%M %p', '%I %p'):
                    try:
                        hora_estandarizada_24h = datetime.strptime(hora_ingresada_str.upper().replace(" ",""), fmt).strftime('%H:%M'); break
                    except ValueError: continue
            
            if not hora_estandarizada_24h or hora_estandarizada_24h not in slots_validos_str:
                datos.pop('time', None)
                instruccion = "Informa al usuario que la hora que eligió no es válida o no está en la lista de opciones. Pídele amablemente que elija una de las horas que se le mostraron."
                return guardar_y_responder({"text": generar_respuesta_natural(instruccion, {})}, contexto, request)

            contexto['collected_data']['time'] = hora_estandarizada_24h
            contexto['status'] = 'awaiting_confirmation'
            doctor = Doctor.objects.get(id=datos['doctor']); fecha_obj = datetime.strptime(datos['date'], '%Y-%m-%d').date(); hora_obj = datetime.strptime(datos['time'], '%H:%M').time()
            nombre_dia = dias_en_espanol[fecha_obj.weekday()]; fecha_texto = f"{nombre_dia} {fecha_obj.day} de {_(fecha_obj.strftime('%B'))}"; hora_texto = hora_obj.strftime('%I:%M %p')
            
            datos_para_frontend = {
                "tipo": "confirmacion_cita",
                "titulo": "¡Perfecto! Solo para confirmar, ¿son correctos los datos de tu cita?",
                "detalles": {"Doctor": doctor.name, "Día": fecha_texto, "Hora": hora_texto}
            }
            return guardar_y_responder(datos_para_frontend, contexto, request)
            
            contexto['collected_data']['time'] = hora_estandarizada_24h
            contexto['status'] = 'awaiting_confirmation'
            doctor = Doctor.objects.get(id=datos['doctor']); fecha_obj = datetime.strptime(datos['date'], '%Y-%m-%d').date(); hora_obj = datetime.strptime(datos['time'], '%H:%M').time()
            nombre_dia = dias_en_espanol[fecha_obj.weekday()]; fecha_texto = f"{nombre_dia} {fecha_obj.day} de {_(fecha_obj.strftime('%B'))}"; hora_texto = hora_obj.strftime('%I:%M %p')
            resumen_cita_texto = f"\n- **Doctor:** {doctor.name}\n- **Día:** {fecha_texto}\n- **Hora:** {hora_texto}\n"
            instruccion = "Presenta un resumen de la cita usando el marcador __DATOS_A_INCLUIR__ y pregunta si son correctos para confirmar."
            datos_para_contexto = {"nombre_doctor": doctor.name, "dia_cita": fecha_texto, "hora_cita": hora_texto}
            respuesta_generada = generar_respuesta_natural(instruccion, datos_para_contexto)
            respuesta_final = respuesta_generada.replace("__DATOS_A_INCLUIR__", resumen_cita_texto)
            return guardar_y_responder(respuesta_final, contexto, request)
        
        # --- OTROS INTENTS ---
        elif accion == 'saludar':
            request.session.pop('conversation_context', None)
            instruccion = "El usuario acaba de iniciar la conversación. Tu única tarea es saludarlo cordialmente, presentarte como el asistente virtual y preguntarle en qué puede ayudarle. NO inicies ningún proceso de agendamiento."
            return Response({"respuesta": generar_respuesta_natural(instruccion, {})})

        elif accion == 'listar_doctores':
            doctores = [d.name for d in Doctor.objects.all()]
            instruccion = "Presenta al usuario la lista de doctores disponibles usando el marcador __DATOS_A_INCLUIR__."
            respuesta_generada = generar_respuesta_natural(instruccion, {}).replace("__DATOS_A_INCLUIR__", f"**{', '.join(doctores)}**")
            return guardar_y_responder(respuesta_generada, contexto, request)
            
        elif accion == 'consultar_mis_citas':
            citas_usuario = Appointment.objects.filter(paciente=usuario_actual, date__gte=date.today()).order_by('date', 'time')
            
            if not citas_usuario.exists():
                instruccion = "Informa al usuario que has revisado su agenda y no tiene ninguna cita próxima programada."
                return guardar_y_responder({'text': generar_respuesta_natural(instruccion, {})}, contexto, request)

            # Preparamos los datos para el frontend
            serializer = AppointmentSerializer(citas_usuario, many=True)
            
            # Creamos el objeto estructurado
            datos_para_frontend = {
                "tipo": "lista_citas",
                "titulo": "Claro, aquí están tus próximas citas:",
                "citas": serializer.data
            }
            return guardar_y_responder(datos_para_frontend, contexto, request)
        
        # --- ACCIÓN DE CANCELAR CITA (VERSIÓN MULTI-CITA) ---
        elif accion == 'cancelar_cita':
            citas_a_cancelar_data = datos.get('citas_a_cancelar', [])
            
            # Si la IA extrajo una sola fecha/hora, la convertimos en una lista
            if not citas_a_cancelar_data and ('date' in datos or 'time' in datos):
                citas_a_cancelar_data.append(datos)

            # Si no tenemos información, buscamos la próxima cita
            if not citas_a_cancelar_data:
                prox_cita = Appointment.objects.filter(paciente=usuario_actual, date__gte=date.today()).order_by('date', 'time').first()
                if prox_cita:
                    citas_a_cancelar_data.append({'date': prox_cita.date.strftime('%Y-%m-%d'), 'time': prox_cita.time.strftime('%H:%M')})

            if not citas_a_cancelar_data:
                instruccion = "Informa al usuario que has revisado su agenda y no se encontró ninguna cita próxima para cancelar."
                return guardar_y_responder(generar_respuesta_natural(instruccion, {}), contexto, request)

            # --- 1. Procesamos la lista de citas a cancelar ---
            citas_canceladas_ok = []
            citas_no_encontradas = []

            for cita_info in citas_a_cancelar_data:
                try:
                    fecha_obj = datetime.strptime(cita_info.get('date'), '%Y-%m-%d').date()
                    hora_obj = datetime.strptime(cita_info.get('time'), '%H:%M').time()
                    
                    cita_obj = Appointment.objects.get(paciente=usuario_actual, date=fecha_obj, time=hora_obj)

                    eliminar_evento_gcal(cita_obj.google_calendar_event_id)
                    
                    detalles = f"la cita del **{fecha_obj.strftime('%d de %B')} a las {hora_obj.strftime('%I:%M %p')}** con el Dr. {cita_obj.doctor.name}"
                    citas_canceladas_ok.append(detalles)
                    
                    cita_obj.delete()

                except (Appointment.DoesNotExist, KeyError, ValueError, TypeError):
                    fecha_str = cita_info.get('date', 'fecha no especificada')
                    hora_str = cita_info.get('time', 'hora no especificada')
                    citas_no_encontradas.append(f"la cita del {fecha_str} a las {hora_str}")

            # --- 2. PYTHON construye el texto del resumen final ---
            texto_resumen = ""
            if citas_canceladas_ok:
                # Usamos un formato de lista para el resumen
                lista_html = "\n- ".join(citas_canceladas_ok)
                texto_resumen += f"He cancelado con éxito las siguientes citas:\n- {lista_html}"
            
            if citas_no_encontradas:
                lista_html_fallidas = "\n- ".join(citas_no_encontradas)
                texto_resumen += f"\n\nNo pude encontrar las siguientes citas para cancelar:\n- {lista_html_fallidas}"

            # --- 3. La IA genera el texto "envoltorio" y unimos todo ---
            instruccion = "El proceso de cancelación ha terminado. Genera un texto amigable para informarle al usuario del resultado, que se insertará en el marcador __DATOS_A_INCLUIR__. Pero muestre en español el mes y el día de la cita y no muestre el formato __DATOS_A_INCLUIR__."
            
            # Pasamos los datos a la IA solo para que tenga contexto
            datos_para_contexto = { "resumen_cancelacion": texto_resumen }
            respuesta_generada = generar_respuesta_natural(instruccion, datos_para_contexto)
            
            # Reemplazamos el marcador con nuestro texto preciso
            respuesta_final = respuesta_generada.replace("__DATOS_A_INCLUIR__", texto_resumen)
            
            request.session.pop('conversation_context', None) # Reiniciamos la conversación
            return Response({"respuesta": respuesta_final})
        
        # --- ACCIÓN DE CANCELAR TODAS LAS CITAS (VERSIÓN ALL) ---
        elif accion == 'cancelar_todas_las_citas':
            # Buscamos TODAS las citas futuras del usuario
            citas_a_cancelar = Appointment.objects.filter(paciente=usuario_actual, date__gte=date.today()).order_by('date', 'time')
            
            if not citas_a_cancelar.exists():
                instruccion = "Informa al usuario que ha pedido cancelar todas sus citas, pero que has revisado su agenda y no tiene ninguna cita próxima programada."
                respuesta_generada = generar_respuesta_natural(instruccion, {})
                # Red de seguridad por si la IA añade el marcador
                respuesta_limpia = respuesta_generada.replace("__DATOS_A_INCLUIR__", "")
                return guardar_y_responder(respuesta_limpia, contexto, request)

            # --- 1. PYTHON PREPARA LOS DATOS ---
            # Guardamos los detalles para el resumen ANTES de borrar
            detalles_citas_canceladas_lista = []
            for cita in citas_a_cancelar:
                detalles_citas_canceladas_lista.append(
                    f"la del **{cita.date.strftime('%d de %B')} a las {cita.time.strftime('%I:%M %p')}** con el Dr. {cita.doctor.name}"
                )
                # Eliminamos cada evento del calendario
                eliminar_evento_gcal(cita.google_calendar_event_id)
            
            # --- 2. PYTHON CONSTRUYE EL TEXTO DEL RESUMEN ---
            # Convertimos la lista de detalles en un solo string formateado como una lista
            resumen_texto = "\n- ".join(detalles_citas_canceladas_lista)
            
            # --- 3. LÓGICA DE NEGOCIO ---
            # Borramos todas las citas de la base de datos de una vez
            citas_a_cancelar.delete()
            request.session.pop('conversation_context', None) # Reiniciamos la conversación

            # --- 4. LA IA GENERA EL ENVOLTORIO ---
            instruccion = "Informa al usuario que TODAS sus citas han sido canceladas con éxito. Usa el marcador __DATOS_A_INCLUIR__ donde mi código insertará la lista de citas que se eliminaron, pero muestre en español el mes y el dia de la cita."
            
            datos_para_contexto = {"lista_citas_canceladas": detalles_citas_canceladas_lista} # Para que la IA tenga contexto
            respuesta_generada = generar_respuesta_natural(instruccion, datos_para_contexto)

            # --- 5. PYTHON COMBINA Y FINALIZA ---
            # Usamos .replace() para insertar nuestro resumen preciso en la respuesta de la IA
            respuesta_final = respuesta_generada.replace("__DATOS_A_INCLUIR__", f"\n- {resumen_texto}")
            
            return Response({"respuesta": respuesta_final})

        # --- ACCIÓN POR DEFECTO ---
        else:
            instruccion = "Informa al usuario que no has entendido su petición. Recuérdale amablemente tus funciones principales."
            return guardar_y_responder(generar_respuesta_natural(instruccion, {}), contexto, request)
        

# Tomorrow i will continue with the test from the ia assistant