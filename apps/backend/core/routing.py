from django.urls import re_path, include

websocket_urlpatterns = [
    re_path(r'ws/communications/', include('communications.routing')),
    # ... other websocket routes
]
