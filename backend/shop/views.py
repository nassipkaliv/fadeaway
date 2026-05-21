from rest_framework import filters, generics, permissions, viewsets

from .models import Category, Order, Sneakers
from .serializers import (
    CategorySerializer,
    OrderSerializer,
    RegisterSerializer,
    SneakersSerializer,
    UserSerializer,
)


class IsOwnerOrAdmin(permissions.BasePermission):
    """Object-level permission: owner of the order or staff."""

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user_id == request.user.id


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class SneakersViewSet(viewsets.ModelViewSet):
    queryset = Sneakers.objects.select_related('category').prefetch_related('images').all()
    serializer_class = SneakersSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['brand', 'title', 'info']
    ordering_fields = ['final_price', 'created_at', 'rate_count']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        brand = params.get('brand')
        category = params.get('category')
        tag = params.get('tag')
        max_price = params.get('max_price')
        if brand:
            qs = qs.filter(brand__iexact=brand)
        if category:
            qs = qs.filter(category__name__iexact=category)
        if tag:
            qs = qs.filter(tag=tag)
        if max_price:
            qs = qs.filter(final_price__lte=max_price)
        return qs


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items__sneaker')
        if user.is_staff:
            return qs.all()
        return qs.filter(user=user)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'register'


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
