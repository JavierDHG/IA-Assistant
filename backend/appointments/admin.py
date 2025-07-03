from django.contrib import admin
from .models import Appointment, Doctor

# Register your models here.

admin.site.register(Appointment)
admin.site.register(Doctor)
admin.site.site_header = 'Administración de citas'
admin.site.site_title = 'Administración de citas'
admin.site.index_title = 'Administración de citas'