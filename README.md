# 🛡️ Project Sentinel: Autonomous DNS Defense Agent

> **Kaggle Agents Intensive 2025 Capstone Project**
> *An AI Agent that detects internet outages and repairs infrastructure without human intervention.*

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Live_Demo-green)]()

## 📺 Demo & Presentation
* **Live Demo:** [Link to your Cloud Run URL]
* **Video Walkthrough:** [Link to your YouTube Video]
* **Slide Deck:** [(https://docs.google.com/presentation/d/1Sgn9P_J6Y_C9a-OFYzzjhzyFTRYH9QluSJLvw-bwwv8/edit?usp=sharing)]

---

## 🧐 The Problem
When a major DNS provider (like Route53 or Cloudflare) fails, the "Human Lag"—the time between the alert firing and an engineer waking up to fix it, costs millions. 

**Project Sentinel** eliminates this lag. It is an **Autonomous Site Reliability Engineer (SRE)** that lives outside the blast radius, monitoring the internet's "ground truth" and executing repairs automatically.

## 🏗️ Architecture

![Architecture Diagram](./docs/architecture.png)


The system operates on a **Sense-Think-Act** loop:

1.  **The Watcher (Sensing):** A distributed fleet of Python probes running in `us-central1`, `europe-west1`, and `asia-east1`. They act as the "eyes," bypassing local ISP caches to measure authoritative DNS health.
2.  **The Brain (Reasoning):** A **Vertex AI (Gemini 1.5 Pro)** agent. It ingests a sliding window of telemetry from BigQuery and uses **RAG (Retrieval Augmented Generation)** to consult "Outage Playbooks" before making a decision.
3.  **The Hammer (Action):** A privileged Cloud Function that executes the "DNS Surgery" updating the authoritative nameservers via API to reroute global traffic.

---

## 🚀 Quick Start (Simulation Mode)

We have included a generic simulation mode so you can test the Agent's logic without needing a Google Cloud account.

### Prerequisites
* Node.js 18+ (for the Dashboard)
* Python 3.10+ (for the Agent)

### 1. Clone the Repository
```bash
git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/project-sentinel.git
cd project-sentinel
