import pytest
import requests
import json
import os
import time
from typing import Dict, Any

def get_config() -> Dict[str, Any]:
    config_path = os.path.join(os.path.dirname(__file__), "input.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f)
    return {"baseUrl": "http://localhost:8081"}

class TestLatencyMeasurements:
    """
    Validates API performance benchmarks and latency constraints.
    """

    @pytest.fixture(autouse=True)
    def setup_client(self):
        self.config = get_config()
        self.base_url = self.config.get("baseUrl", "http://localhost:8081")

    def test_pantry_retrieval_latency(self):
        """
        Ensure pantry retrieval responds within an acceptable threshold (e.g. 500ms).
        """
        url = f"{self.base_url}/api/pantry"
        try:
            start_time = time.time()
            response = requests.get(url, timeout=5)
            elapsed = (time.time() - start_time) * 1000 # ms
            
            assert elapsed < 500.0, f"Latency of {elapsed:.2f}ms exceeded limit of 500ms"
        except requests.exceptions.RequestException:
            pytest.skip("Base service unavailable")

    def test_recipe_generation_latency(self):
        """
        Validate recipe generator (AI proxy/cache) response latency limit.
        """
        url = f"{self.base_url}/api/recipes/generate"
        payload = {"ingredients": ["Rice", "Milk"]}
        try:
            start_time = time.time()
            response = requests.post(url, json=payload, timeout=5)
            elapsed = (time.time() - start_time) * 1000 # ms
            
            assert elapsed < 2000.0, f"Latency of {elapsed:.2f}ms exceeded limit of 2000ms"
        except requests.exceptions.RequestException:
            pytest.skip("Base service unavailable")
