"""
DNS Sentinel - The Watcher (Sensing Layer)

The Watcher is responsible for continuously monitoring DNS infrastructure
health across multiple geographic regions. It acts as the "eyes" of the
system, providing ground truth telemetry that bypasses local ISP caches.

Architecture:
    - Deployed as Cloud Run Jobs in us-central1, europe-west1, asia-east1
    - Executes DNS queries against authoritative nameservers
    - Measures response latency and detects timeouts
    - Streams telemetry data to BigQuery for analysis

Usage:
    # Run locally in simulation mode
    python -m watcher.main --simulate

    # Run with real DNS queries
    python -m watcher.main --target example.com

    # Run as Cloud Run Job
    gcloud run jobs execute dns-watcher --region us-central1

Components:
    - probe.py: Core DNS probing logic
    - telemetry.py: BigQuery streaming client
    - scheduler.py: Probe scheduling and rate limiting
    - config.py: Configuration management

Telemetry Schema:
    {
        "timestamp": "2024-01-01T00:00:00Z",
        "region": "us-central1",
        "target": "example.com",
        "query_type": "A",
        "latency_ms": 45,
        "status": "HEALTHY",  # HEALTHY | DEGRADED | TIMEOUT
        "nameserver": "ns1.example.com",
        "response_code": "NOERROR"
    }
"""

__version__ = "0.1.0"
__author__ = "DNS Sentinel Team"

# Placeholder for future implementation
# from .probe import DNSProbe
# from .telemetry import TelemetryClient
# from .scheduler import ProbeScheduler
