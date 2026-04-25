# 💧 AquaYANTRA — AquaGuard Health Intelligence Platform

> **A national public health intelligence platform for early waterborne disease detection, real-time CPCB water quality monitoring, and ML-driven outbreak prediction — built for India.**

---

## 🌐 Live Demo

> Open `index.html` in your browser to launch the platform locally. No server setup required.

---

## 📌 Overview

**AquaYANTRA (AquaGuard)** is a full-stack, browser-based public health surveillance platform that integrates:

- 🏭 **CPCB** (Central Pollution Control Board) water quality sensor data
- 🏥 **ABDM** (Ayushman Bharat Digital Mission) anonymized patient records
- 🌧️ **IMD** rainfall and environmental signals
- 🤖 **ML-powered** Random Forest outbreak prediction engine
- 👥 **Citizen crowdsourced** field reporting system

The platform provides role-based dashboards for **Citizens**, **Health Officers / CPCB Officials**, and **Hospital Authorities** — enabling early detection, alert dispatch, and coordinated response to waterborne disease outbreaks across India.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 Role-Based Login | Separate dashboards for Citizen, Officer, Hospital |
| 💧 Live CPCB Monitoring | Real-time water quality sensor feed (pH, Turbidity, TDS, DO, Coliform, etc.) |
| 🤖 ML Outbreak Prediction | Random Forest model (94.7% accuracy) with 7-day outbreak forecast |
| 🔔 Alert Dispatch System | Critical/Warning/Advisory alerts sent to Ministry & Hospitals |
| 🗺️ India Risk Heatmap | National district-level risk visualization |
| 🏥 ABDM Patient Feed | Anonymized waterborne disease case intelligence |
| 📝 Citizen Reporting | Crowdsourced water issue reports with field verification |
| 📊 Analytics Dashboard | XAI model insights, WQI trends, disease charts |
| 📈 14-Day Trend Charts | Chart.js visualizations for water quality trends |
| 📱 Responsive Design | Fully mobile and desktop compatible |

---

## 🖥️ Pages & Modules

```
📁 AquaYANTRA/
├── index.html            → Main Role-Based Dashboard (Citizen / Officer / Hospital)
├── login.html            → Secure login page with role selection
├── register.html         → New user registration (Citizen / Hospital)
├── forgot-password.html  → Password recovery flow
├── alerts.html           → Alert center — active, acknowledged, and resolved alerts
├── analytics.html        → ML analytics, XAI explanations, outbreak heatmap
├── community.html        → Citizen field reports & community feed
├── heatmap.html          → National water risk heatmap (India)
├── patients.html         → ABDM patient intelligence module
├── water-quality.html    → CPCB water quality readings & parameter details
├── app.js                → Core JavaScript logic (auth, charts, live data, routing)
├── data.js               → Synthetic dataset loader
├── style.css             → Global design system (CSS variables, components)
└── data/                 → Dataset files (CSV) + documentation
    ├── README.md
    ├── cpcb_stations.csv
    ├── water_quality_readings.csv
    ├── abdm_patient_records.csv
    ├── alerts_log.csv
    ├── community_reports.csv
    ├── ml_predictions.csv
    └── registered_users.csv
```

---

## 🔬 Data & ML Model

### Water Quality Parameters Monitored
| Parameter | WHO/BIS Standard | Unit |
|-----------|-----------------|------|
| pH | 6.5 – 8.5 | – |
| Turbidity | < 5 | NTU |
| Dissolved Oxygen | > 6.0 | mg/L |
| BOD | < 3.0 | mg/L |
| Total Coliform | < 500 | CFU/100mL |
| Fecal Coliform | < 100 | CFU/100mL |
| TDS | < 500 | mg/L |
| Nitrates | < 45 | mg/L |
| Arsenic | < 10 | µg/L |
| Lead | < 10 | µg/L |
| Fluoride | < 1.5 | mg/L |

### ML Model Specifications
| Property | Value |
|----------|-------|
| Algorithm | Random Forest Classifier (sklearn) |
| Features | 22 parameters (water quality + ABDM + community + temporal) |
| Training Period | Jan 2021 – Dec 2025 (5 years) |
| Accuracy | **94.7%** |
| F1 Score | **0.921** |
| AUC-ROC | **0.982** |
| Prediction Window | 7 days forward |
| Retrain Frequency | Every 2 hours |

### Diseases Tracked
Cholera (A00) · Typhoid / Enteric Fever (A01) · Hepatitis A (B15) · Shigellosis / Dysentery (A03) · Gastroenteritis (A09) · Giardiasis (A07) · Leptospirosis (A27) · Cryptosporidiosis (A07) · Rotavirus (A08)

---

## 👥 Role-Based Dashboard Access

### 👤 Citizen
- View local water quality parameters (pH, TDS, Turbidity, Temperature)
- Check active alerts in their area
- Submit water issue reports
- Browse community field reports
- Access water safety tips

### 🛡️ Health Officer / CPCB Officer
- Live CPCB drinking water monitoring panel (national)
- ML outbreak prediction dashboard
- 14-day WQI trend charts
- Dispatch critical/warning alerts to Ministry & Hospitals
- View district-wise risk zones

### 🏥 Hospital Authority
- ABDM patient feed (waterborne cases)
- ICU / admission KPIs
- Bed capacity management
- Outbreak zone tracking
- Waterborne disease case intelligence

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No installation, build tools, or backend server required

### Run Locally
```bash
# Clone the repository
git clone https://github.com/Nandani2716/AquaYANTRA.git

# Navigate to the project directory
cd AquaYANTRA

# Open in browser
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

> Or simply double-click `index.html` to open it in your default browser.

### Demo Login
| Role | Email | Password |
|------|-------|----------|
| Health Officer | officer@cpcb.gov.in | any password |
| Hospital | admin@aiims.edu | any password |
| Citizen | citizen@test.com | any password |

> *(Authentication is simulated — any password will work for demo purposes)*

---

## 🛡️ Privacy & Compliance

- All patient data is **synthetic** and generated for demonstration purposes only
- ABHA Health IDs are **masked** — no real PII is present
- Compliant with **DPDP Act 2023** (India's Digital Personal Data Protection Act)
- Follows **ABDM** privacy and data handling guidelines
- Station coordinates are approximate

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (Semantic) |
| Styling | Vanilla CSS (Custom Design System) |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | Chart.js |
| Fonts | Google Fonts — Inter, Outfit |
| Data | CSV (synthetic datasets) |
| Maps | SVG-based India heatmap |

> **No frameworks, no build tools, no dependencies to install.** Pure HTML/CSS/JS.

---

## 📊 Dataset Summary

| Dataset | Records |
|---------|---------|
| CPCB Monitoring Stations | 30 stations (13 states) |
| Water Quality Readings | 95 readings (Apr 1–14, 2026) |
| ABDM Patient Records | 30 anonymized patients |
| Alerts Log | 15 AI + sensor-triggered alerts |
| Community Reports | 30 citizen field reports |
| ML Predictions | 25 outbreak predictions |
| Registered Users | 20 platform users |

---

## 🗺️ States & Coverage

Uttar Pradesh · Bihar · West Bengal · Maharashtra · Tamil Nadu · Karnataka · Gujarat · Rajasthan · Madhya Pradesh · Delhi · Odisha · Assam · Punjab

---

## 📁 Data Pipeline

```
🚛 Tanker / WTP Sensors
        ↓
🔄 CPCB Ingestion API  (Real-time polling)
        ↓
📋 BIS 10500 Quality Check  (Parameter classification)
        ↓
🧠 ML Risk Model  (Random Forest outbreak prediction)
        ↓
🔔 Alert Dispatch  (Ministry · Hospitals · CMO · NDMA)
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👩‍💻 Author

**Nandani Shukla**
- GitHub: [@Nandani2716](https://github.com/Nandani2716)
- Repository: [AquaYANTRA](https://github.com/Nandani2716/AquaYANTRA)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*AquaGuard Platform v1.0 · Built for India's Health Ministry · CPCB + ABDM Integrated · DPDP Act 2023 Compliant*
