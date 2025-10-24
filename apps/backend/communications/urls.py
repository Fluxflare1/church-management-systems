from django.urls import path, include

app_name = 'communications'

urlpatterns = [
    path('api/', include('communications.api.urls')),
]
