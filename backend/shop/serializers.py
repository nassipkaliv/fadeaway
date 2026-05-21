from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from .models import Category, Order, OrderItem, SneakerImage, Sneakers

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class SneakerImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SneakerImage
        fields = ('id', 'url', 'position')


class SneakersSerializer(serializers.ModelSerializer):
    images = SneakerImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Sneakers
        fields = (
            'id', 'brand', 'title', 'info',
            'category', 'category_name',
            'final_price', 'original_price',
            'ratings', 'rate_count',
            'tag', 'tagline', 'hero_image',
            'stock', 'images',
            'created_at', 'updated_at',
        )


class OrderItemSerializer(serializers.ModelSerializer):
    sneaker_title = serializers.CharField(source='sneaker.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'sneaker', 'sneaker_title', 'quantity', 'unit_price')
        read_only_fields = ('unit_price',)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'total_amount', 'status', 'address', 'phone', 'created_at', 'items')
        read_only_fields = ('user', 'total_amount', 'status', 'created_at')

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Cart cannot be empty.')
        for item in items:
            sneaker = item['sneaker']
            quantity = item['quantity']
            if quantity <= 0:
                raise serializers.ValidationError(f'Quantity for {sneaker.title} must be positive.')
            if sneaker.stock < quantity:
                raise serializers.ValidationError(
                    f'{sneaker.title}: only {sneaker.stock} left in stock.'
                )
        return items

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context['request']

        order = Order.objects.create(
            user=request.user,
            total_amount=0,
            **validated_data,
        )

        total = 0
        for item in items_data:
            sneaker = item['sneaker']
            quantity = item['quantity']
            unit_price = sneaker.final_price

            OrderItem.objects.create(
                order=order,
                sneaker=sneaker,
                quantity=quantity,
                unit_price=unit_price,
            )

            sneaker.stock = max(sneaker.stock - quantity, 0)
            sneaker.save(update_fields=['stock'])

            total += unit_price * quantity

        order.total_amount = total
        order.save(update_fields=['total_amount'])
        return order


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )


class UserSerializer(serializers.ModelSerializer):
    orders_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'orders_count')

    def get_orders_count(self, obj):
        return obj.orders.count()
