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

class TestStatusCodes:
    """
    Checks HTTP statuses for success, redirects, and failure states.
    """

    @pytest.fixture(autouse=True)
    def setup_client(self):
        self.config = get_config()
        self.base_url = self.config.get("baseUrl", "http://localhost:8081")

    def test_pantry_unauthenticated_status(self):
        """
        Verify status code returned for basic GET /api/pantry.
        """
        url = f"{self.base_url}/api/pantry"
        try:
            response = requests.get(url, timeout=5)
            assert response.status_code in [200, 401, 403], f"Unexpected status code: {response.status_code}"
        except requests.exceptions.RequestException:
            pytest.skip("Base service unavailable")

    def test_invalid_endpoint_status(self):
        """
        Verify status code for non-existent routes is 404.
        """
        url = f"{self.base_url}/api/invalid-route-xyz-non-existent"
        try:
            response = requests.get(url, timeout=5)
            assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        except requests.exceptions.RequestException:
            pytest.skip("Base service unavailable")
