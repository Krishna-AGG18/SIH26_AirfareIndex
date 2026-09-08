from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database_configured"] is True


def test_cpi_dashboard_route():
    response = client.get("/api/v1/dashboard/cpi?schedule=next_month&base_year=2024&state=Arunachal%20Pradesh&sector=rural")
    assert response.status_code == 200
    data = response.json()
    assert "rural_series" in data
    assert "urban_series" in data
    assert "combined_series" in data
    assert "states_summary" in data
    assert "available_states" in data
    assert data["schedule"] == "next_month"
    assert data["is_live_db"] is True
