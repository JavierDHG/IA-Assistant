from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, AppointmentViewSet, AsistenteCitasView, RegisterView

router = DefaultRouter()

router.register('doctors', DoctorViewSet)
router.register('appointments', AppointmentViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('api/v1/asistente-citas/', AsistenteCitasView.as_view(), name='asistente-citas'),
    path('api/v1/register/', RegisterView.as_view(), name='user-register'),
]