from decimal import Decimal

from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from shop.models import Category, SneakerImage, Sneakers


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': []})
class SneakersAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat_low = Category.objects.create(name='Low', slug='low')
        cls.cat_high = Category.objects.create(name='High', slug='high')

        cls.s1 = Sneakers.objects.create(
            brand='Nike', title='Air Max 90',
            final_price=Decimal('100'), original_price=Decimal('150'),
            category=cls.cat_low, tag='featured-product',
        )
        cls.s2 = Sneakers.objects.create(
            brand='Adidas', title='Stan Smith',
            final_price=Decimal('80'), original_price=Decimal('120'),
            category=cls.cat_low, tag='regular',
        )
        cls.s3 = Sneakers.objects.create(
            brand='Nike', title='Blazer Mid',
            final_price=Decimal('200'), original_price=Decimal('250'),
            category=cls.cat_high, tag='hero-product',
        )
        SneakerImage.objects.create(sneaker=cls.s1, url='/img/1.png', position=0)

    def test_list_sneakers_public(self):
        url = reverse('sneakers-list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 3)

    def test_retrieve_sneaker_returns_images(self):
        url = reverse('sneakers-detail', args=[self.s1.pk])
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['brand'], 'Nike')
        self.assertEqual(len(res.data['images']), 1)
        self.assertEqual(res.data['images'][0]['url'], '/img/1.png')

    def test_filter_by_brand(self):
        res = self.client.get(reverse('sneakers-list') + '?brand=Nike')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)

    def test_filter_by_category_name(self):
        res = self.client.get(reverse('sneakers-list') + '?category=High')
        self.assertEqual(res.data['count'], 1)

    def test_filter_by_max_price(self):
        res = self.client.get(reverse('sneakers-list') + '?max_price=100')
        # Should include s1 (100) and s2 (80), not s3 (200)
        self.assertEqual(res.data['count'], 2)

    def test_search_by_title(self):
        res = self.client.get(reverse('sneakers-list') + '?search=Blazer')
        self.assertEqual(res.data['count'], 1)
        self.assertEqual(res.data['results'][0]['title'], 'Blazer Mid')

    def test_ordering_by_price_asc(self):
        res = self.client.get(reverse('sneakers-list') + '?ordering=final_price')
        prices = [Decimal(item['final_price']) for item in res.data['results']]
        self.assertEqual(prices, sorted(prices))

    def test_anonymous_cannot_create_sneaker(self):
        url = reverse('sneakers-list')
        res = self.client.post(url, {
            'brand': 'X', 'title': 'Y',
            'final_price': '10', 'original_price': '10',
        }, format='json')
        self.assertIn(res.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': []})
class CategoriesAPITests(APITestCase):
    def test_categories_listed_publicly(self):
        Category.objects.create(name='Low', slug='low')
        Category.objects.create(name='High', slug='high')

        res = self.client.get(reverse('categories-list'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)
