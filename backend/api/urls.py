from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import UserRegistrationView, ContactMessageViewSet

router = DefaultRouter()
router.register(r'users', UserRegistrationView)
router.register(r'contact', ContactMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
