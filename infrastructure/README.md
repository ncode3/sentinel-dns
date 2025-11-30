# Infrastructure

This directory contains Infrastructure as Code (IaC) for deploying DNS Sentinel to Google Cloud Platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Google Cloud Platform                          │
│                                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                       │
│  │  us-central1│   │europe-west1 │   │ asia-east1  │                       │
│  │             │   │             │   │             │                       │
│  │ ┌─────────┐ │   │ ┌─────────┐ │   │ ┌─────────┐ │                       │
│  │ │ Watcher │ │   │ │ Watcher │ │   │ │ Watcher │ │   Cloud Run Jobs      │
│  │ └────┬────┘ │   │ └────┬────┘ │   │ └────┬────┘ │                       │
│  └──────┼──────┘   └──────┼──────┘   └──────┼──────┘                       │
│         │                 │                 │                               │
│         └────────────────┬┼─────────────────┘                               │
│                          ││                                                 │
│                    ┌─────▼▼─────┐                                           │
│                    │  BigQuery  │  Telemetry Storage                        │
│                    └─────┬──────┘                                           │
│                          │                                                  │
│                    ┌─────▼──────┐                                           │
│                    │   Pub/Sub  │  Event Streaming                          │
│                    └─────┬──────┘                                           │
│                          │                                                  │
│                    ┌─────▼──────┐                                           │
│                    │   Brain    │  Cloud Run Service (Vertex AI)            │
│                    └─────┬──────┘                                           │
│                          │                                                  │
│                    ┌─────▼──────┐                                           │
│                    │   Hammer   │  Cloud Function (privileged)              │
│                    └─────┬──────┘                                           │
│                          │                                                  │
│                    ┌─────▼──────┐                                           │
│                    │ Cloud DNS  │  Managed DNS                              │
│                    └────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Deployment

### Prerequisites

- Google Cloud SDK installed and configured
- Terraform >= 1.5.0
- A GCP project with billing enabled

### Quick Start

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var="project_id=your-project-id"

# Apply the configuration
terraform apply -var="project_id=your-project-id"
```

### Configuration Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `project_id` | GCP Project ID | (required) |
| `region` | Primary deployment region | `us-central1` |
| `watcher_regions` | Regions for Watcher deployment | `["us-central1", "europe-west1", "asia-east1"]` |
| `gemini_model` | Gemini model to use | `gemini-2.5-flash` |

## Cost Estimate

Approximate monthly costs for a typical deployment:

| Service | Estimated Cost |
|---------|---------------|
| Cloud Run (Watcher x3) | ~$15 |
| Cloud Run (Brain) | ~$10 |
| Cloud Functions (Hammer) | ~$5 |
| BigQuery | ~$10 |
| Vertex AI (Gemini) | ~$50 |
| Cloud DNS | ~$1 |
| **Total** | **~$91/month** |

*Note: Actual costs may vary based on usage.*

## Security

- All services use Workload Identity
- Hammer function has restricted IAM permissions
- All data encrypted at rest and in transit
- Audit logging enabled for all DNS changes
