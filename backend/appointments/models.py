from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Doctor(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"Médico: {self.name}"
    
    class Meta:
        verbose_name = 'Médico'
        verbose_name_plural = 'Médicos'

class Appointment(models.Model):
    paciente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    google_calendar_event_id = models.CharField(max_length=255, null=True, blank=True)
    # ya no necesitamos 'name' y 'email' aquí, porque los tomaremos del modelo User
    date = models.DateField()
    time = models.TimeField()

    def __str__(self):
        return f"Cita del paciente: {self.name} - {self.date} {self.time} con el médico {self.doctor}"
    
    class Meta:
        verbose_name = 'Cita'
        verbose_name_plural = 'Citas'


# Tomorrow i continue with the frontend, in special the chat area for the patient and the IA