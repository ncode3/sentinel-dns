# Agent Architecture

This directory contains the Python-based agent components for DNS Sentinel.

## Overview

The agent operates on a **Sense-Think-Act** loop:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   WATCHER   │ ──▶ │    BRAIN    │ ──▶ │   HAMMER    │
│  (Sensing)  │     │ (Reasoning) │     │  (Action)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       └───────── Feedback Loop ◀──────────────┘
```

## Components

### `/watcher` - The Sensing Layer
Distributed DNS probes that collect telemetry from multiple geographic regions.

**Responsibilities:**
- Execute DNS queries against authoritative nameservers
- Measure response latency and detect timeouts
- Stream telemetry data to BigQuery
- Run as Cloud Run Jobs in multiple regions

### `/brain` - The Reasoning Layer
AI-powered decision engine using Vertex AI (Gemini).

**Responsibilities:**
- Ingest telemetry from BigQuery
- Apply RAG using outage playbooks
- Analyze patterns and detect anomalies
- Generate remediation recommendations

### `/hammer` - The Action Layer
Privileged Cloud Function that executes remediation.

**Responsibilities:**
- Update DNS records via provider APIs
- Execute failover to backup routes
- Flush TTL caches
- Log all actions for audit trail

## Getting Started

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run watcher locally (simulation mode)
python -m watcher.main --simulate

# Run brain analysis
python -m brain.main --analyze

# Test hammer (dry run)
python -m hammer.main --dry-run
```

## Configuration

Set the following environment variables:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GEMINI_API_KEY="your-api-key"
export DNS_PROVIDER_API_KEY="your-dns-provider-key"
```

## Deployment

Each component is designed to run as a separate Cloud Run service:

1. **Watcher**: Scheduled Cloud Run Jobs (every 30 seconds)
2. **Brain**: Cloud Run Service triggered by Pub/Sub
3. **Hammer**: Cloud Function with IAM-restricted invocation

See `/infrastructure/terraform` for deployment configuration.
