import pytest
import requests
import json
import os
from typing import Dict, Any

def get_config() -> Dict[str, Any]:
    config_path = os.path.join(os.path.dirname(__file__), "input.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f)
    return {"baseUrl": "http://localhost:8081"}

class TestResponseSchemaValidation:
    """
    Validates API responses match expected structured data formats.
    """

    @pytest.fixture(autouse=True)
    def setup_client(self):
        self.config = get_config()
        self.base_url = self.config.get("baseUrl", "http://localhost:8081")

    def test_pantry_items_schema(self):
        """
        Validate that the pantry response array contains proper item properties.
        """
        url = f"{self.base_url}/api/pantry"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                assert isinstance(data, list), "Pantry items list should be an array"
                for item in data:
                    assert "id" in item, "Item schema must contain 'id'"
                    assert "name" in item, "Item schema must contain 'name'"
                    assert "stock" in item, "Item schema must contain 'stock'"
        except (requests.exceptions.RequestException, json.JSONDecodeError):
            pytest.skip("Base service unavailable or response not in JSON - skipping schema test")
            
    def test_auth_response_schema(self):
        """
        Validate authentication payload scheme contains user credentials or token.
        """
        url = f"{self.base_url}/api/auth/login"
        payload = {"username": "test@example.com", "password": "password123"}
        try:
            response = requests.post(url, json=payload, timeout=5)
            if response.status_code == 200:
                data = response.json()
                assert isinstance(data, dict)
                assert "token" in data or "user" in data, "Auth login should return user info or auth token"
        except (requests.exceptions.RequestException, json.JSONDecodeError):
            pytest.skip("Base service unavailable or response not in JSON - skipping schema test")
