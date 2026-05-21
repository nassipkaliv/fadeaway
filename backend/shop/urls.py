from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    CategoryViewSet,
    MeView,
    OrderViewSet,
    RegisterView,
    SneakersViewSet,
)


class ThrottledTokenView(TokenObtainPairView):
    throttle_scope = 'auth'


router = DefaultRouter()
router.register('sneakers', SneakersViewSet, basename='sneakers')
router.register('categories', CategoryViewSet, basename='categories')
router.register('orders', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', ThrottledTokenView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
]
