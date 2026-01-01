from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthBaseTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_password = "StrongPassword123!"
        self.user = User.objects.create_user(
            email="testuser@example.com",
            password=self.user_password,
            first_name="Test",
            last_name="User",
        )

        self.login_url = reverse("token_obtain_pair")
        self.refresh_url = reverse("token_refresh")
        self.logout_url = reverse("logout")
        self.register_url = reverse("user-register")

class UserRegistrationTests(AuthBaseTestCase):
    def test_register_user_success(self):
        data = {
            "email": "newuser@example.com",
            "password": "NewStrongPassword123!",
            "first_name": "New",
            "last_name": "User",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=data["email"]).exists())
    def test_register_user_existing_email(self):
        data = {
            "email": self.user.email,
            "password": "AnotherPassword123!",
            "first_name": "Another",
            "last_name": "User",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
    
class LoginTests(AuthBaseTestCase):
    def test_login_sets_cookies(self):
        response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": self.user_password},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Cookies exist
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

        # Payload
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["user"]["email"], self.user.email)

    def test_login_invalid_credentials(self):
        response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": "wrongpassword"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
class TokenRefreshTests(AuthBaseTestCase):
    def _login_and_set_cookies(self):
        response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": self.user_password},
            format="json",
        )
        self.client.cookies = response.cookies

    def test_refresh_token_from_cookie(self):
        self._login_and_set_cookies()

        response = self.client.post(self.refresh_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.cookies)
        self.assertTrue(response.data["success"])

    def test_refresh_without_token(self):
        response = self.client.post(self.refresh_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    # def test_refresh_token_from_body(self):
    #     self._login_and_set_cookies()
    #     refresh_token = self.client.cookies.get("refresh_token").value

    #     # Clear cookies to simulate no cookie scenario
    #     self.client.cookies.clear()

    #     response = self.client.post(
    #         self.refresh_url,
    #         {"refresh": refresh_token},
    #         format="json",
    #     )

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertIn("access_token", response.cookies)
    #     self.assertTrue(response.data["success"])

class LogoutTests(AuthBaseTestCase):
    def test_logout_authenticated_user(self):
        # Login first
        response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": self.user_password},
            format="json",
        )
        self.client.cookies = response.cookies

        response = self.client.post(self.logout_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    def test_logout_requires_auth(self):
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
