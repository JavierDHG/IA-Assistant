import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from django.conf import settings

# --- Configuración ---
# Coloca la ruta a tu archivo JSON en un lugar seguro y referéncialo
# Lo ideal es que esta ruta esté en tus settings.py
SERVICE_ACCOUNT_FILE = settings.GOOGLE_CREDENTIALS_FILE
# El ID de tu calendario. Lo encuentras en la configuración del calendario.
# Usualmente es el email asociado a ese calendario.
CALENDAR_ID = settings.GOOGLE_CALENDAR_ID
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    """Crea y devuelve el objeto de servicio para interactuar con la API."""
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('calendar', 'v3', credentials=creds)
    return service

def crear_evento_gcal(cita):
    """Crea un evento en Google Calendar a partir de un objeto de cita de Django."""
    service = get_calendar_service()
    
    start_time = datetime.combine(cita.date, cita.time)
    # Asumimos que las citas duran 1 hora
    end_time = start_time + timedelta(hours=1)
    
    # El formato debe ser RFC3339, que es lo que Google Calendar espera
    start_time_iso = start_time.isoformat()
    end_time_iso = end_time.isoformat()

    event_body = {
        'summary': f'Cita Odontológica: {cita.paciente.get_full_name() or cita.paciente.username}',
        'description': f'Cita programada para {cita.paciente.get_full_name()} con el Dr. {cita.doctor.name}.',
        'start': {
            'dateTime': start_time_iso,
            'timeZone': settings.TIME_ZONE, # Usa la zona horaria de tus settings.py
        },
        'end': {
            'dateTime': end_time_iso,
            'timeZone': settings.TIME_ZONE,
        },
        #'attendees': [
        #    {'email': cita.doctor.email},
        #    {'email': cita.paciente.email},
        #],
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60}, # Recordatorio por email 1 día antes
                {'method': 'popup', 'minutes': 60},     # Recordatorio en el calendario 1 hora antes
            ],
        },
    }

    try:
        event = service.events().insert(calendarId=CALENDAR_ID, body=event_body, sendNotifications=True).execute()
        print(f"Evento creado: {event.get('htmlLink')}")
        return event.get('id')
    except Exception as e:
        print(f"Error al crear evento en Google Calendar: {e}")
        return None

def eliminar_evento_gcal(event_id):
    """Elimina un evento de Google Calendar usando su ID."""
    if not event_id:
        return False
    try:
        service = get_calendar_service()
        service.events().delete(calendarId=CALENDAR_ID, eventId=event_id, sendNotifications=True).execute()
        print(f"Evento {event_id} eliminado.")
        return True
    except Exception as e:
        print(f"Error al eliminar evento {event_id}: {e}")
        return False