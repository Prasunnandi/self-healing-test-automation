<div align="center">

# AutoHeal QA — Autonomous Self-Healing E2E Test Suite & Visual Regression Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright)](https://playwright.dev/)
[![AST Semantic Match](https://img.shields.io/badge/Healing-AST_DOM_Cosine-10b981)](https://github.com/Prasunnandi/self-healing-test-automation)
[![Pixelmatch](https://img.shields.io/badge/Visual_Regression-Pixelmatch-blueviolet)](https://github.com/mapbox/pixelmatch)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)

**Enterprise-grade test automation platform with AST DOM semantic element recovery, pixel-level anti-aliased visual regression diffing, flakiness quarantine, and automated Git pull-request patch generation.**

[Architecture](#system-architecture) • [Live Dashboard](#live-dashboard-preview) • [Benchmark Data](#benchmark-dataset) • [API Reference](#rest-api-documentation) • [Quickstart](#quickstart-guide)

</div>

---

## Live Dashboard Preview

<div align="center">
  <img src="docs/screenshots/dashboard.png" alt="AutoHeal QA Self-Healing Dashboard" width="100%" />
</div>

---

## Core Capabilities

- **Autonomous Locator Self-Healing:** When front-end classes or DOM trees mutate, the engine analyzes surrounding DOM landmarks, ARIA attributes, text content, and hierarchy using cosine similarity to recover broken selectors at runtime.
- **Automated Pull-Request Fix Proposals:** When a broken locator is successfully healed, the system generates a unified Git patch that can be automatically committed back to the test codebase via CI.
- **Pixelmatch Anti-Aliased Visual Regression:** Detects subtle pixel-level regressions (threshold &lt; 0.05%) while ignoring anti-aliasing noise and masking dynamic timestamps, avatars, or transaction IDs.
- **Flakiness Quarantine & Analytics:** Identifies historically unstable tests and isolates them into quarantine runs before they break production deployment pipelines.

---

## System Architecture

```mermaid
flowchart TD
    subgraph CI ["CI/CD Pipeline (GitHub Actions / Playwright)"]
        TestRun["Execute Playwright E2E Test Case"]
        LocatorFail{"Locator Element Found?"}
    end

    subgraph HealingEngine ["AutoHeal Semantic Recovery Engine"]
        DOMSnapshot["Capture Live DOM Tree & Computed Styles"]
        CosineMatcher["Calculate AST Semantic Cosine Similarity"]
        ResilientSynthesizer["Synthesize Resilient data-testid Selector"]
        PassExecution["Resume Test Execution & Mark HEALED"]
        GitPatch["Generate Unified Git Diff Patch"]
    end

    subgraph VisualRegression ["Visual Quality Gate"]
        ViewportSnap["Capture Viewport Screenshot"]
        MaskEngine["Apply Dynamic Region Masks"]
        Pixelmatch["Pixelmatch Anti-Aliased Comparator"]
        DiffReport["Pass / Fail Visual Baseline Report"]
    end

    TestRun --> LocatorFail
    LocatorFail -- Yes --> ViewportSnap
    LocatorFail -- No --> DOMSnapshot
    DOMSnapshot --> CosineMatcher
    CosineMatcher --> ResilientSynthesizer
    ResilientSynthesizer --> PassExecution
    PassExecution --> GitPatch
    PassExecution --> ViewportSnap
    ViewportSnap --> MaskEngine
    MaskEngine --> Pixelmatch
    Pixelmatch --> DiffReport
```

---

## Benchmark Dataset

Standard E2E self-healing test automation benchmarks in [`data/kaggle_test_automation_healing_benchmark.csv`](data/kaggle_test_automation_healing_benchmark.csv):

| Test ID | Suite | Target Element | Broken Reason | Healed Selector | Similarity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-E2E-101` | Auth_Checkout_Flow | Checkout Button | CSS Dynamic Hash | `button[data-testid='complete-purchase-btn']` | 96.2% | `HEALED` |
| `TC-E2E-102` | Subscription_Billing | Address Input | DOM Hierarchy Change | `input[name='billingAddress1']` | 93.8% | `HEALED` |
| `TC-E2E-103` | Catalog_Search | Category Filter Pill | Styled-Component Hash | `div[role='combobox'][aria-label='Filter category']` | 91.5% | `HEALED` |
| `TC-E2E-104` | User_Profile_Settings | MFA Toggle Switch | Attribute Deprecated | `button[aria-checked='true'][data-feature='mfa']` | 94.9% | `HEALED` |

---

## REST API Documentation

### 1. Trigger Self-Healing Simulation
```http
POST /api/v1/tests/trigger-healing
Content-Type: application/json

{
  "testCaseName": "Submit Billing Invoice",
  "brokenSelector": "button#btn-invoice-submit-v1",
  "targetElement": "Primary Invoice Button"
}
```
**Response:**
```json
{
  "testId": "TC-E2E-412",
  "suite": "Dynamic_Live_Regression",
  "status": "HEALED",
  "originalSelector": "button#btn-invoice-submit-v1",
  "healedSelector": "button[data-testid='confirm-action-btn']",
  "similarityScore": 0.952,
  "gitPatch": "--- a/tests/modal.spec.ts\n+++ b/tests/modal.spec.ts\n- await page.click('button#btn-invoice-submit-v1');\n+ await page.click(\"button[data-testid='confirm-action-btn']\");"
}
```

### 2. Apply Git Patch to PR Branch
```http
POST /api/v1/tests/:id/apply-patch
```

---

## Quickstart Guide

### Prerequisites
- Node.js 18+ or Docker & Docker Compose
- Git

### Running Locally

```bash
# Clone repository
git clone https://github.com/Prasunnandi/self-healing-test-automation.git
cd self-healing-test-automation

# Start Backend API
cd backend
npm install
npm start &

# Start Frontend Dashboard
cd ../frontend
npm install
npm run dev
```

### Running with Docker Compose

```bash
docker-compose up --build
```
Navigate to `http://localhost:3000` to interact with the self-healing test automation suite.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
