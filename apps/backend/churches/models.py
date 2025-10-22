# apps/backend/churches/models.py
from django.db import models

class Branch(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    pastor_name = models.CharField(max_length=120, blank=True, null=True)
    image = models.ImageField(upload_to='branches/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    parent_branch = models.ForeignKey(
        'self',
        related_name='sub_branches',
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['country', 'region', 'city', 'name']

    def __str__(self):
        return self.name
