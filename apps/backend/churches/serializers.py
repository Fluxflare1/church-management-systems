# apps/backend/churches/serializers.py
from rest_framework import serializers
from .models import Branch

class BranchSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = [
            'id',
            'name',
            'country',
            'region',
            'city',
            'address',
            'latitude',
            'longitude',
            'phone',
            'email',
            'pastor_name',
            'image_url',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
