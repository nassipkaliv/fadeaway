from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.test import TestCase

from shop.models import Category, Order, OrderItem, SneakerImage, Sneakers

User = get_user_model()


class CategoryModelTests(TestCase):
    def test_category_str(self):
        cat = Category.objects.create(name='Running', slug='running')
        self.assertEqual(str(cat), 'Running')

    def test_category_slug_must_be_unique(self):
        Category.objects.create(name='Running', slug='running')
        with self.assertRaises(IntegrityError):
            Category.objects.create(name='Other', slug='running')


class SneakersModelTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Low', slug='low')

    def test_sneakers_str(self):
        s = Sneakers.objects.create(
            brand='Nike',
            title='Air Max 90',
            final_price=Decimal('199.99'),
            original_price=Decimal('299.99'),
        )
        self.assertEqual(str(s), 'Nike Air Max 90')

    def test_sneakers_default_tag_is_regular(self):
        s = Sneakers.objects.create(
            brand='Adidas', title='Stan Smith',
            final_price=Decimal('100'), original_price=Decimal('150'),
        )
        self.assertEqual(s.tag, 'regular')
        self.assertEqual(s.stock, 0)

    def test_sneakers_belongs_to_category(self):
        s = Sneakers.objects.create(
            brand='Nike', title='Pegasus',
            final_price=Decimal('120'), original_price=Decimal('150'),
            category=self.category,
        )
        # Reverse relation via related_name='sneakers'
        self.assertIn(s, self.category.sneakers.all())

    def test_deleting_category_keeps_sneaker_with_null(self):
        s = Sneakers.objects.create(
            brand='Nike', title='Pegasus',
            final_price=Decimal('120'), original_price=Decimal('150'),
            category=self.category,
        )
        self.category.delete()
        s.refresh_from_db()
        self.assertIsNone(s.category)


class SneakerImageModelTests(TestCase):
    def test_images_cascade_delete_with_sneaker(self):
        s = Sneakers.objects.create(
            brand='Nike', title='AF1',
            final_price=Decimal('100'), original_price=Decimal('150'),
        )
        SneakerImage.objects.create(sneaker=s, url='/img/1.png', position=0)
        SneakerImage.objects.create(sneaker=s, url='/img/2.png', position=1)
        self.assertEqual(SneakerImage.objects.count(), 2)

        s.delete()
        self.assertEqual(SneakerImage.objects.count(), 0)

    def test_images_ordered_by_position(self):
        s = Sneakers.objects.create(
            brand='Nike', title='AF1',
            final_price=Decimal('100'), original_price=Decimal('150'),
        )
        SneakerImage.objects.create(sneaker=s, url='/img/c.png', position=2)
        SneakerImage.objects.create(sneaker=s, url='/img/a.png', position=0)
        SneakerImage.objects.create(sneaker=s, url='/img/b.png', position=1)

        urls = list(s.images.values_list('url', flat=True))
        self.assertEqual(urls, ['/img/a.png', '/img/b.png', '/img/c.png'])


class OrderModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='buyer', password='secret-pw-12345')
        self.sneaker = Sneakers.objects.create(
            brand='Nike', title='Air Max 90',
            final_price=Decimal('100'), original_price=Decimal('150'),
            stock=10,
        )

    def test_order_str_contains_id_and_user(self):
        order = Order.objects.create(user=self.user, total_amount=Decimal('100'))
        self.assertIn(f'#{order.pk}', str(order))
        self.assertIn('buyer', str(order))

    def test_default_status_is_pending(self):
        order = Order.objects.create(user=self.user, total_amount=Decimal('100'))
        self.assertEqual(order.status, 'pending')

    def test_orderitem_cascades_with_order(self):
        order = Order.objects.create(user=self.user, total_amount=Decimal('200'))
        OrderItem.objects.create(
            order=order, sneaker=self.sneaker, quantity=2, unit_price=Decimal('100'),
        )
        self.assertEqual(order.items.count(), 1)

        order.delete()
        self.assertEqual(OrderItem.objects.count(), 0)
