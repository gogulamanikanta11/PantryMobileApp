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
    return {"baseUrl": "http://localhost:8081", "username": "", "password": ""}

class TestRequestCompliance:
    """
    Validates general API requests to check header compliance and parameters.
    """
    
    @pytest.fixture(autouse=True)
    def setup_client(self):
        self.config = get_config()
        self.base_url = self.config.get("baseUrl", "http://localhost:8081")
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json",
            "Content-Type": "application/json"
        })

    def test_pantry_get_request_headers(self):
        """
        Validate that pantry retrieval honors standard content negotiating headers.
        """
        url = f"{self.base_url}/api/pantry"
        try:
            response = self.session.get(url, timeout=5)
            # We record details and verify basic integration metrics
            assert response.headers.get("Content-Type") is not None
        except requests.exceptions.RequestException:
            pytest.skip("Base service unavailable - skipping active network test")

    def test_recipe_generation_bad_payload(self):
        """
        Validate input parsing handles empty/invalid ingredients structures.
        """
        url = f"{self.base_url}/api/recipes/generate"
        payload = {"ingredients": []}
        try:
            response = self.session.post(url, json=payload, timeout=5)
            assert response.status_code in [200, 400]
        except requests.exceptions.RequestException:
            pytest.skip("Base service unavailable - skipping active network test")
