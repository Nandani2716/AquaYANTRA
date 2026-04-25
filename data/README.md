# AquaGuard Platform — Dataset Documentation

## Overview
This folder contains all synthetic datasets generated for the AquaGuard Early Waterborne Disease Detection Platform. All data is realistic and follows Indian public health standards, CPCB water quality norms, and ABDM privacy guidelines.

---

## 📁 Dataset Files

### 1. `cpcb_stations.csv`
**30 CPCB Water Monitoring Stations across India**

| Column | Description |
|--------|-------------|
| station_id | Unique station identifier (e.g., CPCB-UP-001) |
| station_name | Name of monitoring point |
| city, district, state | Geographic location |
| latitude, longitude | GPS coordinates |
| river_basin | River basin or water body |
| source_type | River / Canal / Lake / Reservoir / Barrage |
| installation_year | Year of station setup |
| last_calibrated | Date of last sensor calibration |
| status | Active / Inactive |

**States covered:** UP, Bihar, West Bengal, Maharashtra, Tamil Nadu, Karnataka, Gujarat, Rajasthan, Madhya Pradesh, Delhi, Odisha, Assam, Punjab

---

### 2. `water_quality_readings.csv`
**95 Water Quality Readings (14-day period: April 1–14, 2026)**

| Column | Description |
|--------|-------------|
| reading_id | Unique reading ID |
| station_id | Linked CPCB station |
| reading_date, reading_time | Timestamp of reading |
| pH | pH level (normal: 6.5–8.5) |
| turbidity_NTU | Turbidity in NTU (threshold: 5 NTU) |
| dissolved_oxygen_mg_L | DO level (minimum: 6 mg/L) |
| BOD_mg_L | Biochemical Oxygen Demand (max: 3 mg/L) |
| total_coliform_CFU_100mL | Total Coliform count (max: 500 CFU/100mL) |
| fecal_coliform_CFU_100mL | Fecal Coliform (max: 100 CFU/100mL) |
| TDS_mg_L | Total Dissolved Solids (max: 500 mg/L) |
| nitrates_mg_L | Nitrate concentration (max: 45 mg/L) |
| arsenic_ug_L | Arsenic (max: 10 µg/L WHO) |
| lead_ug_L | Lead (max: 10 µg/L WHO) |
| fluoride_mg_L | Fluoride (max: 1.5 mg/L) |
| temperature_C | Water temperature |
| conductivity_uS_cm | Electrical conductivity |
| WQI_score | Calculated Water Quality Index (0–100) |
| WQI_category | Very Poor / Poor / Medium / Good / Excellent |
| anomaly_flag | TRUE if any parameter exceeds threshold |
| alert_triggered | TRUE if ML model or sensor triggered alert |

**WQI Reference:** 
- 0–25: Very Poor | 26–50: Poor | 51–75: Medium | 76–90: Good | 91–100: Excellent

---

### 3. `abdm_patient_records.csv`
**30 Anonymized Patient Records (ABDM-sourced)**

| Column | Description |
|--------|-------------|
| patient_id | Anonymous patient reference |
| abdm_health_id | Masked ABHA Health ID |
| age, sex, blood_group | Demographics |
| city, district, state | Patient location |
| hospital_name, hospital_abdm_id | Treating institution |
| department | Treating department |
| admission_date, discharge_date | Hospital stay |
| status | Admitted / Discharged / Under Treatment |
| diagnosis, icd10_code | Clinical diagnosis with ICD-10 code |
| disease_category | Waterborne - Bacterial / Viral / Parasitic |
| severity | Mild / Moderate / Severe / Critical |
| source_water_type | Type of water source implicated |
| symptoms | Comma-separated symptom list |
| incubation_days | Estimated incubation period |
| treatment_given | Medications and interventions |
| icu_admission | Boolean ICU flag |
| outcome | Recovered / Under Treatment |
| linked_cpcb_station | Nearest CPCB station |
| sample_lab_result | Lab confirmation result |

**Diseases covered:** Cholera (A00), Typhoid/Enteric Fever (A01), Hepatitis A (B15), Shigellosis/Dysentery (A03), Gastroenteritis (A09), Giardiasis (A07), Leptospirosis (A27), Cryptosporidiosis (A07), Rotavirus (A08)

**Privacy:** All ABHA Health IDs are masked. Data is DPDP Act 2023 compliant.

---

### 4. `alerts_log.csv`
**15 Alert Records (AI-generated and sensor-triggered)**

| Column | Description |
|--------|-------------|
| alert_id | Unique alert identifier |
| generated_at | Alert creation timestamp |
| alert_type | ML Model / Sensor / Community / Combined |
| severity | Critical / High / Moderate / Watch / Resolved |
| trigger_source | What triggered the alert |
| parameter_violated | Which water parameter exceeded threshold |
| measured_value | Actual sensor reading |
| threshold_value | Standard threshold |
| ml_confidence_pct | ML model confidence percentage |
| notified_ministry | Ministry of Jal Shakti / MOHFW notified |
| notified_hospital | Hospital notified |
| hospital_notified | Specific hospital name |
| cmo_notified | CMO notification flag |
| status | Active / Acknowledged / Resolved / Watch |
| acknowledged_by | Name of officer who acknowledged |
| resolution_notes | Action taken |

---

### 5. `community_reports.csv`
**30 Citizen-Submitted Field Reports**

| Column | Description |
|--------|-------------|
| report_id | Unique report identifier |
| submitted_at | Submission timestamp |
| reporter_name | Citizen's name (or "Anonymous") |
| reporter_anonymous | Privacy flag |
| city, district, state, pincode | Location |
| locality | Specific area/mohalla |
| gps_lat, gps_lon | GPS coordinates (where provided) |
| issue_type | Category of report |
| urgency | Urgent / High / Normal |
| symptoms_observed | Health symptoms reported |
| water_appearance | Visual description of water |
| water_smell | Smell description |
| affected_households | Number of families affected |
| affected_persons | Total persons affected |
| children_affected | Children count |
| elderly_affected | Elderly count |
| water_source | Type of water source |
| description | Full citizen narrative |
| image_attached | Boolean flag |
| verification_status | Verified / Pending |
| verified_by | Authority that verified |
| action_taken | Response actions |
| linked_alert | Connected alert ID |
| linked_station | Closest CPCB station |
| upvotes | Community upvote count |

---

### 6. `ml_predictions.csv`
**25 ML Model Prediction Records**

| Column | Description |
|--------|-------------|
| prediction_id | Unique prediction ID |
| model_version | ML model version (RF-v2.4 = Random Forest) |
| prediction_date | Date prediction was generated |
| target_zone | Geographic prediction zone |
| disease_predicted | Disease type predicted |
| probability_pct | Outbreak probability (0–100%) |
| risk_level | Critical / High / Moderate / Low |
| predicted_cases_7d | Forecasted cases in 7 days |
| predicted_cases_14d | Forecasted cases in 14 days |
| actual_cases_7d | Actual outcomes (for validation) |
| model_accuracy_on_zone | Per-zone model accuracy |
| lead_time_days | Days of advance warning |
| key_features_triggered | Top features driving prediction |
| wqi_at_prediction | WQI at time of prediction |
| abdm_cases_last_7d | ABDM cases in prior 7 days |
| community_reports_last_7d | Community reports in prior 7 days |
| alert_generated | Linked alert flag |
| outcome_verified | Whether prediction was validated |
| prediction_correct | Boolean correctness of prediction |

**Model Details:**  
- Algorithm: Random Forest Classifier (sklearn)  
- Features: 22 parameters (8 water quality + 6 ABDM clinical + 4 community signals + 4 temporal/seasonal)  
- Training period: Jan 2021 – Dec 2025 (5 years)  
- Accuracy: 94.7% | F1: 0.921 | AUC-ROC: 0.982  
- Prediction window: 7 days forward  
- Retrain frequency: Every 2 hours on new sensor data  

---

### 7. `registered_users.csv`
**20 Platform Users (Hospital Officials + Citizens + NGO Workers)**

| Column | Description |
|--------|-------------|
| user_id | Unique user identifier |
| full_name | Name |
| email | Login email |
| role | hospital / user |
| institution | Hospital/org name |
| abdm_id | ABDM facility ID (hospital users only) |
| department | Department |
| designation | Job title |
| account_status | Active / Suspended |
| verified | Hospital account verified flag |
| reports_submitted | Community reports count |
| alerts_acknowledged | Alerts acknowledged |
| patients_entered | ABDM records entered |
| login_count | Total login sessions |

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| CPCB Stations | 30 |
| Water Quality Readings | 95 |
| Patient Records | 30 |
| Alerts Generated | 15 |
| Community Reports | 30 |
| ML Predictions | 25 |
| Registered Users | 20 |
| States Covered | 13 |
| Diseases Tracked | 9 types |
| Date Range | Apr 1–14, 2026 |

---

## 🔢 Parameter Reference Standards

| Parameter | WHO/BIS Standard | Unit |
|-----------|-----------------|------|
| pH | 6.5 – 8.5 | – |
| Turbidity | < 5 | NTU |
| Dissolved Oxygen | > 6.0 | mg/L |
| BOD | < 3.0 | mg/L |
| Total Coliform | < 500 | CFU/100mL |
| Fecal Coliform | < 100 | CFU/100mL |
| TDS | < 500 | mg/L |
| Nitrates | < 45 (< 10 for infants) | mg/L |
| Arsenic | < 10 | µg/L |
| Lead | < 10 | µg/L |
| Fluoride | < 1.5 | mg/L |
| Ammonia | < 0.5 | mg/L |

---

## ⚠️ Data Notice
All data in these files is **synthetic and generated for research and demonstration purposes only**. Patient IDs are masked. No real patient personally identifiable information (PII) is present. Station coordinates are approximate. This dataset is designed to simulate real-world Indian public health scenarios and should not be used as actual medical or regulatory data.

---

*AquaGuard Platform v1.0 · Built for India's Health Ministry · CPCB + ABDM Integrated · DPDP Act 2023 Compliant*
