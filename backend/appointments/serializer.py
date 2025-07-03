from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Appointment, Doctor

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    paciente_username = serializers.CharField(source='paciente.username', read_only=True)
    class Meta:
        model = Appointment
        fields = ('id', 'paciente', 'doctor', 'paciente_username', 'doctor_name', 'date', 'time', 'google_calendar_event_id')
        read_only_fields = ('id',)
        extra_kwargs = {
            'paciente': {'write_only': True},
            'doctor': {'write_only': True}
        }

class DoctorEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('id', 'name', 'email')
        read_only_fields = ('id',)

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}} # Para que no devuelva el hash del password

    def create(self, validated_data):
        # Usamos create_user para hashear la contraseña correctamente
        user = User.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        # No actualizamos la contraseña aquí, se debe hacer por otro endpoint
        instance.save()
        return instance