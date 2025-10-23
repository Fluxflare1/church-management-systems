from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    # path('api/v1/churches/', include('churches.urls')),
    # path('api/v1/members/', include('members.urls')),
    # path('api/v1/guests/', include('guests.urls')),
    # path('api/v1/cmas/', include('cmas.urls')),
    # path('api/v1/events/', include('events.urls')),
    # path('api/v1/groups/', include('groups.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
