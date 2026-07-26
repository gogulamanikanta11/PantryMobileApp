import json
import os
from typing import Dict, List, Any

class EndpointCatalog:
    """
    Discovers, stores, and catalogs API endpoints from OpenAPI specifications or route files.
    """
    def __init__(self, routes_dir: str = None, openapi_url: str = None):
        self.endpoints: List[Dict[str, Any]] = []
        self.routes_dir = routes_dir
        self.openapi_url = openapi_url

    def load_from_openapi(self, spec_data: Dict[str, Any]) -> None:
        """
        Parses an OpenAPI specification dictionary and catalogs its paths.
        """
        if not spec_data or "paths" not in spec_data:
            return

        paths = spec_data.get("paths", {})
        for path, methods in paths.items():
            for method, details in methods.items():
                if method.lower() not in ["get", "post", "put", "delete", "patch", "head", "options"]:
                    continue
                
                # Check for responses/success schemas
                responses = details.get("responses", {})
                success_schema = None
                for status_code, resp_details in responses.items():
                    if status_code.startswith("2"):
                        content = resp_details.get("content", {})
                        json_content = content.get("application/json", {})
                        success_schema = json_content.get("schema", {})
                        break

                self.endpoints.append({
                    "path": path,
                    "method": method.upper(),
                    "summary": details.get("summary", ""),
                    "parameters": details.get("parameters", []),
                    "expected_status": 200 if method.lower() == "get" else 201,
                    "response_schema": success_schema
                })

    def load_defaults(self) -> None:
        """
        Loads mock/detected application endpoints based on code inspections.
        """
        # Add basic client-facing and API endpoint representations
        self.endpoints = [
            {"path": "/api/pantry", "method": "GET", "expected_status": 200, "response_schema": {"type": "array"}},
            {"path": "/api/pantry", "method": "POST", "expected_status": 201, "response_schema": {"type": "object"}},
            {"path": "/api/recipes/generate", "method": "POST", "expected_status": 200, "response_schema": {"type": "object"}},
            {"path": "/api/auth/login", "method": "POST", "expected_status": 200, "response_schema": {"type": "object"}},
            {"path": "/api/auth/register", "method": "POST", "expected_status": 200, "response_schema": {"type": "object"}}
        ]

    def get_endpoints(self) -> List[Dict[str, Any]]:
        return self.endpoints

if __name__ == "__main__":
    catalog = EndpointCatalog()
    catalog.load_defaults()
    print(f"Cataloged {len(catalog.get_endpoints())} endpoints:")
    for ep in catalog.get_endpoints():
        print(f" - {ep['method']} {ep['path']} (Expected: {ep['expected_status']})")
