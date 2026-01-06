# Project Vision & Business Context (Hannovate POC)

## 1. Executive Summary
**Origin:** Startup initiative "Hannovate" (Leibniz Uni Hannover).
**Goal:** Develop a Proof of Concept (POC) for an intelligent insurance aggregation platform that connects Insurance Companies with E-Commerce Merchants.
**Core Mission:** Increase the attachment rate of insurance policies for electronic devices purchased online by solving the trust and information gap using AI and data transparency.

## 2. The Product Vision (User Journey)
The product functions as an embedded service within third-party e-commerce stores (Brokers) by also providing a clear structured design that doesnt hold back people from purchasing their product..

### A. The "Intelligent" Placement
Instead of a static add-on, the platform analyzes the specific device the customer is viewing or buying (e.g., specific smartphone model, drone, laptop) to live-generate the single best insurance recommendation.

**Touchpoints:**
1.  **Product Page:** Primary interaction point.
2.  **Checkout Page:** Reminder for users who missed it on the product page.
3.  **Post-Purchase Screen:** A final prominent offer after the sale is secured.

### B. The "Modal Strategy" (User Interface)
The interface must solve the problem that users rarely read full policies but fear hidden clauses.
*   **The Hook:** A simple checkbox: *"Add insurance for [Price]/month [?]"*.
*   **The Education:** Clicking the "Help/?" icon opens a comprehensive **Information Modal** (Overlay) instead of redirecting the user. This keeps the user in the shopping funnel.
*   **The Features:**
    *   **AI Chatbot:** Users can ask specific questions (e.g., "Is water damage covered?") and receive instant answers based on the specific policy documents.
    *   **Comparison:** The system suggests the best-fit insurance but allows users to view alternative suggestions if desired.

### C. The "Persuasive Data" Engine
To convince rational buyers, the UI displays dynamic, data-driven value propositions based on the specific device type.
*   *Example Logic:* "Smartphones like this require glass replacement after 18 months on average. You save X€ by being covered."
*   This shifts the purchase decision from an emotional guess to a rational financial decision.

## 3. Stakeholder Roles & Business Model

### The Platform (Us)
*   **Role:** Aggregator and Orchestrator. We manage the matching logic and the user interface.
*   **Revenue:** Commission per policy sold + Monthly listing/SaaS fees from Insurers.

### The Insurers
*   **Role:** Product Providers. They upload policy documents and provide the capability to create contracts and clients via their systems.
*   **Benefit:** Access to digital Point-of-Sale distribution without building their own plugins.

### The Merchants (Brokers)
*   **Role:** Distribution Channel. They integrate our solution into their shops.
*   **Benefit:** Receive a commission (provision) for every insurance added to a cart, with zero inventory risk.

## 4. Strategic Roadmap
1.  **Phase 1 (POC):** Focus strictly on a **Shopify Integration**. This is the initial market entry point to validate the technology and UX.
2.  **Phase 2:** Expand to other platforms (e.g., WooCommerce) and develop a standalone API/SDK to allow integration into any custom webshop.