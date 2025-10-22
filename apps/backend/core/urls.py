# apps/backend/core/urls.py  (or project's main urls.py)
from django.urls import path, include

urlpatterns = [
    path('api/churches/', include('churches.urls')),
]
