# DNS Sentinel - Terraform Configuration
# 
# This is a placeholder Terraform configuration for deploying DNS Sentinel
# to Google Cloud Platform. Customize the variables and resource configurations
# according to your specific requirements.

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "us-central1"
}

variable "watcher_regions" {
  description = "Regions for Watcher deployment"
  type        = list(string)
  default     = ["us-central1", "europe-west1", "asia-east1"]
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# -----------------------------------------------------------------------------
# Provider Configuration
# -----------------------------------------------------------------------------

provider "google" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------------------------
# Enable Required APIs
# -----------------------------------------------------------------------------

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudfunctions.googleapis.com",
    "bigquery.googleapis.com",
    "pubsub.googleapis.com",
    "aiplatform.googleapis.com",
    "dns.googleapis.com",
    "cloudscheduler.googleapis.com",
    "secretmanager.googleapis.com",
  ])
  
  service            = each.value
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# BigQuery Dataset for Telemetry
# -----------------------------------------------------------------------------

resource "google_bigquery_dataset" "telemetry" {
  dataset_id  = "dns_sentinel_telemetry"
  description = "DNS Sentinel probe telemetry data"
  location    = var.region

  labels = {
    environment = var.environment
    component   = "watcher"
  }
}

resource "google_bigquery_table" "probes" {
  dataset_id = google_bigquery_dataset.telemetry.dataset_id
  table_id   = "probes"
  
  schema = jsonencode([
    {
      name = "timestamp"
      type = "TIMESTAMP"
      mode = "REQUIRED"
    },
    {
      name = "region"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "target"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "latency_ms"
      type = "INTEGER"
      mode = "REQUIRED"
    },
    {
      name = "status"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "nameserver"
      type = "STRING"
      mode = "NULLABLE"
    },
    {
      name = "response_code"
      type = "STRING"
      mode = "NULLABLE"
    }
  ])
}

# -----------------------------------------------------------------------------
# Pub/Sub Topics for Event Streaming
# -----------------------------------------------------------------------------

resource "google_pubsub_topic" "telemetry" {
  name = "dns-sentinel-telemetry"
  
  labels = {
    environment = var.environment
  }
}

resource "google_pubsub_topic" "decisions" {
  name = "dns-sentinel-decisions"
  
  labels = {
    environment = var.environment
  }
}

resource "google_pubsub_subscription" "brain_subscription" {
  name  = "dns-sentinel-brain-subscription"
  topic = google_pubsub_topic.telemetry.id
  
  ack_deadline_seconds = 60
  
  push_config {
    # Configure push endpoint when Brain service is deployed
    # push_endpoint = google_cloud_run_service.brain.status[0].url
  }
}

# -----------------------------------------------------------------------------
# Secret Manager for API Keys
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "dns-sentinel-gemini-api-key"
  
  replication {
    auto {}
  }
  
  labels = {
    environment = var.environment
  }
}

# -----------------------------------------------------------------------------
# Service Account for Workload Identity
# -----------------------------------------------------------------------------

resource "google_service_account" "watcher" {
  account_id   = "dns-sentinel-watcher"
  display_name = "DNS Sentinel Watcher"
  description  = "Service account for DNS Sentinel Watcher jobs"
}

resource "google_service_account" "brain" {
  account_id   = "dns-sentinel-brain"
  display_name = "DNS Sentinel Brain"
  description  = "Service account for DNS Sentinel Brain service"
}

resource "google_service_account" "hammer" {
  account_id   = "dns-sentinel-hammer"
  display_name = "DNS Sentinel Hammer"
  description  = "Service account for DNS Sentinel Hammer function"
}

# Grant BigQuery permissions to Watcher
resource "google_project_iam_member" "watcher_bigquery" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.watcher.email}"
}

# Grant Vertex AI permissions to Brain
resource "google_project_iam_member" "brain_aiplatform" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.brain.email}"
}

# Grant DNS permissions to Hammer
resource "google_project_iam_member" "hammer_dns" {
  project = var.project_id
  role    = "roles/dns.admin"
  member  = "serviceAccount:${google_service_account.hammer.email}"
}

# -----------------------------------------------------------------------------
# Placeholder for Cloud Run Services
# Uncomment and configure after building container images
# -----------------------------------------------------------------------------

# resource "google_cloud_run_v2_job" "watcher" {
#   for_each = toset(var.watcher_regions)
#   
#   name     = "dns-sentinel-watcher"
#   location = each.value
#   
#   template {
#     template {
#       containers {
#         image = "gcr.io/${var.project_id}/dns-sentinel-watcher:latest"
#         
#         env {
#           name  = "REGION"
#           value = each.value
#         }
#       }
#       
#       service_account = google_service_account.watcher.email
#     }
#   }
# }

# resource "google_cloud_run_v2_service" "brain" {
#   name     = "dns-sentinel-brain"
#   location = var.region
#   
#   template {
#     containers {
#       image = "gcr.io/${var.project_id}/dns-sentinel-brain:latest"
#     }
#     
#     service_account = google_service_account.brain.email
#   }
# }

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "bigquery_dataset" {
  description = "BigQuery dataset ID"
  value       = google_bigquery_dataset.telemetry.dataset_id
}

output "telemetry_topic" {
  description = "Pub/Sub topic for telemetry"
  value       = google_pubsub_topic.telemetry.id
}

output "decisions_topic" {
  description = "Pub/Sub topic for decisions"
  value       = google_pubsub_topic.decisions.id
}

output "service_accounts" {
  description = "Service account emails"
  value = {
    watcher = google_service_account.watcher.email
    brain   = google_service_account.brain.email
    hammer  = google_service_account.hammer.email
  }
}
