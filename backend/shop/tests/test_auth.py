from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': []})
class RegistrationTests(APITestCase):
    def test_register_creates_user(self):
        url = reverse('register')
        res = self.client.post(url, {
            'username': 'newbie',
            'email': 'newbie@example.com',
            'password': 'StrongPass!123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newbie').exists())

    def test_register_password_is_hashed(self):
        url = reverse('register')
        self.client.post(url, {
            'username': 'newbie', 'email': 'a@a.com', 'password': 'StrongPass!123',
        }, format='json')
        user = User.objects.get(username='newbie')
        # Stored password is a hash, not the plain text
        self.assertNotEqual(user.password, 'StrongPass!123')
        self.assertTrue(user.check_password('StrongPass!123'))

    def test_register_rejects_weak_password(self):
        res = self.client.post(reverse('register'), {
            'username': 'a', 'email': 'a@a.com', 'password': '123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', res.data)

    def test_register_rejects_invalid_email(self):
        res = self.client.post(reverse('register'), {
            'username': 'b', 'email': 'not-an-email', 'password': 'StrongPass!123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': []})
class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='alice', email='a@a.com', password='AlicePass!123',
        )

    def test_login_returns_jwt_tokens(self):
        res = self.client.post(reverse('token_obtain_pair'), {
            'username': 'alice', 'password': 'AlicePass!123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_login_with_wrong_password_fails(self):
        res = self.client.post(reverse('token_obtain_pair'), {
            'username': 'alice', 'password': 'WrongPass',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_endpoint_issues_new_access(self):
        login = self.client.post(reverse('token_obtain_pair'), {
            'username': 'alice', 'password': 'AlicePass!123',
        }, format='json')
        refresh = login.data['refresh']

        res = self.client.post(reverse('token_refresh'), {'refresh': refresh}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': []})
class MeEndpointTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='bob', password='BobPass!123')

    def test_me_requires_authentication(self):
        res = self.client.get(reverse('me'))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(reverse('me'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'bob')
        self.assertIn('orders_count', res.data)
        self.assertEqual(res.data['orders_count'], 0)
