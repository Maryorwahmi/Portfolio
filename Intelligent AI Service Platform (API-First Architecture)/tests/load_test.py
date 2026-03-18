#!/usr/bin/env python
"""
Load testing script using Locust
"""
from locust import HttpUser, task, between
import random


class AIServiceUser(HttpUser):
    """Simulated user for load testing"""
    
    wait_time = between(1, 3)
    
    @task(3)
    def health_check(self):
        """Check API health - frequent task"""
        self.client.get("/health")
    
    @task(2)
    def get_recommendations(self):
        """Get recommendations - medium frequency"""
        user_id = random.randint(1, 1000)
        self.client.get(f"/recommendations?user_id={user_id}&limit=10")
    
    @task(1)
    def metrics(self):
        """Get metrics - low frequency"""
        self.client.get("/metrics")


# Run with: locust -f tests/load_test.py --host=http://localhost:8000
