# apps/backend/churches/views.py
from rest_framework import generics, filters
from .models import Branch
from .serializers import BranchSerializer

class BranchListView(generics.ListAPIView):
    serializer_class = BranchSerializer
    queryset = Branch.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'country', 'region', 'city', 'pastor_name']
