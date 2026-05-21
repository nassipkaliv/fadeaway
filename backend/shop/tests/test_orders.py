from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from shop.models import Order, Sneakers

User = get_user_model()


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': []})
class OrderCreationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='buyer', password='BuyerPass!123')

        self.sneaker_a = Sneakers.objects.create(
            brand='Nike', title='Air Max',
            final_price=Decimal('100'), original_price=Decimal('150'),
            stock=5,
        )
        self.sneaker_b = Sneakers.objects.create(
            brand='Adidas', title='Stan Smith',
            final_price=Decimal('50'), original_price=Decimal('80'),
            stock=2,
        )

    def test_anonymous_cannot_create_order(self):
        res = self.client.post(reverse('orders-list'), {
            'items': [{'sneaker': self.sneaker_a.pk, 'quantity': 1}],
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_creates_order_successfully(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(reverse('orders-list'), {
            'items': [
                {'sneaker': self.sneaker_a.pk, 'quantity': 2},
                {'sneaker': self.sneaker_b.pk, 'quantity': 1},
            ],
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Expected total: 100 * 2 + 50 * 1 = 250
        self.assertEqual(Decimal(res.data['total_amount']), Decimal('250.00'))
        self.assertEqual(len(res.data['items']), 2)
        self.assertEqual(res.data['status'], 'pending')

    def test_order_decrements_stock(self):
        self.client.force_authenticate(user=self.user)
        self.client.post(reverse('orders-list'), {
            'items': [{'sneaker': self.sneaker_a.pk, 'quantity': 3}],
        }, format='json')

        self.sneaker_a.refresh_from_db()
        self.assertEqual(self.sneaker_a.stock, 2)  # was 5, ordered 3

    def test_order_rejected_when_stock_insufficient(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(reverse('orders-list'), {
            'items': [{'sneaker': self.sneaker_b.pk, 'quantity': 999}],
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Stock must NOT be modified on validation failure
        self.sneaker_b.refresh_from_db()
        self.assertEqual(self.sneaker_b.stock, 2)
        # No order should be created
        self.assertEqual(Order.objects.count(), 0)

    def test_order_rejected_when_items_empty(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(reverse('orders-list'), {'items': []}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unit_price_snapshot_at_order_time(self):
        """unit_price is captured from current product price, not editable by client."""
        self.client.force_authenticate(user=self.user)
        # Client tries to set their own (cheaper) unit_price — should be ignored
        res = self.client.post(reverse('orders-list'), {
            'items': [
                {'sneaker': self.sneaker_a.pk, 'quantity': 1, 'unit_price': '1.00'},
            ],
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # Server used the real price (100), not the spoofed 1.00
        self.assertEqual(Decimal(res.data['items'][0]['unit_price']), Decimal('100.00'))


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': []})
class OrderListingTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(username='alice', password='AlicePass!123')
        self.bob = User.objects.create_user(username='bob', password='BobPass!123')

        self.sneaker = Sneakers.objects.create(
            brand='Nike', title='Pegasus',
            final_price=Decimal('120'), original_price=Decimal('150'),
            stock=10,
        )

        Order.objects.create(user=self.alice, total_amount=Decimal('120'))
        Order.objects.create(user=self.alice, total_amount=Decimal('240'))
        Order.objects.create(user=self.bob, total_amount=Decimal('120'))

    def test_user_sees_only_own_orders(self):
        self.client.force_authenticate(user=self.alice)
        res = self.client.get(reverse('orders-list'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)

    def test_other_user_orders_isolated(self):
        self.client.force_authenticate(user=self.bob)
        res = self.client.get(reverse('orders-list'))
        self.assertEqual(res.data['count'], 1)

    def test_staff_sees_all_orders(self):
        staff = User.objects.create_user(username='admin', password='AdminPass!123', is_staff=True)
        self.client.force_authenticate(user=staff)
        res = self.client.get(reverse('orders-list'))
        self.assertEqual(res.data['count'], 3)
