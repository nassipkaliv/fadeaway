from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=64, unique=True)
    slug = models.SlugField(max_length=64, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Sneakers(models.Model):
    TAG_CHOICES = [
        ('hero-product', 'Hero'),
        ('featured-product', 'Featured'),
        ('regular', 'Regular'),
    ]

    brand = models.CharField(max_length=64)
    title = models.CharField(max_length=128)
    info = models.CharField(max_length=255, blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sneakers',
    )

    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)

    ratings = models.PositiveIntegerField(default=0)
    rate_count = models.PositiveSmallIntegerField(default=0)

    tag = models.CharField(max_length=32, choices=TAG_CHOICES, default='regular')
    tagline = models.CharField(max_length=128, blank=True)
    hero_image = models.CharField(max_length=255, blank=True)

    stock = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Sneakers'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.brand} {self.title}'


class SneakerImage(models.Model):
    sneaker = models.ForeignKey(
        Sneakers,
        on_delete=models.CASCADE,
        related_name='images',
    )
    url = models.CharField(max_length=255)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f'Image for {self.sneaker} (#{self.position})'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='pending')

    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=32, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.pk} by {self.user}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    sneaker = models.ForeignKey(
        Sneakers,
        on_delete=models.PROTECT,
        related_name='order_items',
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity} × {self.sneaker}'
