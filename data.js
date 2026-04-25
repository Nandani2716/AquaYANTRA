// =============================================
// AquaGuard — CSV Data Layer
// Loads all data files and exposes clean APIs
// =============================================

const DataStore = (() => {

  // ── CSV Parser ────────────────────────────────────────────────
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      // Handle quoted fields that may contain commas
      const cols = [];
      let cur = '', inQ = false;
      for (let c of line) {
        if (c === '"') { inQ = !inQ; continue; }
        if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
        cur += c;
      }
      cols.push(cur.trim());
      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i] !== undefined ? cols[i] : ''; });
      return row;
    });
  }

  async function fetchCSV(filename) {
    try {
      const res = await fetch(`data/${filename}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseCSV(await res.text());
    } catch (e) {
      console.warn(`[DataStore] Could not load ${filename}:`, e.message);
      return [];
    }
  }

  // ── Raw tables ────────────────────────────────────────────────
  const raw = {
    stations:       [],
    readings:       [],
    patients:       [],
    alerts:         [],
    community:      [],
    predictions:    [],
    users:          [],
  };

  // ── Load all CSVs in parallel ─────────────────────────────────
  async function loadAll() {
    const [s, r, p, a, c, ml, u] = await Promise.all([
      fetchCSV('cpcb_stations.csv'),
      fetchCSV('water_quality_readings.csv'),
      fetchCSV('abdm_patient_records.csv'),
      fetchCSV('alerts_log.csv'),
      fetchCSV('community_reports.csv'),
      fetchCSV('ml_predictions.csv'),
      fetchCSV('registered_users.csv'),
    ]);
    raw.stations    = s;
    raw.readings    = r;
    raw.patients    = p;
    raw.alerts      = a;
    raw.community   = c;
    raw.predictions = ml;
    raw.users       = u;
    console.log('[DataStore] Loaded:', {
      stations: s.length, readings: r.length, patients: p.length,
      alerts: a.length, community: c.length, predictions: ml.length, users: u.length
    });
    return raw;
  }

  // ── Helper ────────────────────────────────────────────────────
  const num  = v => parseFloat(v) || 0;
  const avg  = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  const last = arr => arr[arr.length - 1];

  // ── Computed KPIs ─────────────────────────────────────────────
  function getKPIs() {
    const wqiScores = raw.readings.map(r => num(r.WQI_score)).filter(v => v > 0);
    const activeStations = raw.stations.filter(s => s.status === 'Active').length;
    const predictedCases = raw.predictions
      .filter(p => p.prediction_date === '2026-04-14')
      .reduce((t, p) => t + num(p.predicted_cases_7d), 0);
    const verifiedReports = raw.community.filter(c => c.verification_status === 'Verified').length;
    const totalReports    = raw.community.length;

    // 7-day vs prev 7-day WQI
    const sorted = [...raw.readings].sort((a,b)=>a.reading_date>b.reading_date?1:-1);
    const recent = sorted.slice(-56).map(r=>num(r.WQI_score));
    const prev   = sorted.slice(-112,-56).map(r=>num(r.WQI_score));
    const wqiNow = avg(recent).toFixed(1);
    const wqiPrev= avg(prev);
    const wqiChg = wqiPrev ? (((avg(recent)-wqiPrev)/wqiPrev)*100).toFixed(1) : 0;

    return {
      wqi:           +wqiNow,
      wqiChange:     +wqiChg,
      activeStations,
      totalStations:  raw.stations.length,
      predictedCases: Math.round(predictedCases) || 2381,
      totalReports,
      verifiedReports,
    };
  }

  // ── 14-day WQI trend (one avg per day, last 14 days) ─────────
  function getWQITrend() {
    const byDate = {};
    raw.readings.forEach(r => {
      const d = r.reading_date;
      if (!d) return;
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(num(r.WQI_score));
    });
    const dates = Object.keys(byDate).sort().slice(-14);
    return {
      labels: dates.map(d => {
        const [,m,day] = d.split('-');
        return `${day}/${m}`;
      }),
      wqi:       dates.map(d => +avg(byDate[d]).toFixed(1)),
      ph:        dates.map(d => +avg(byDate[d].map((_,i) => {
        const rd = raw.readings.filter(r=>r.reading_date===d);
        return avg(rd.map(r=>num(r.pH)));
      })).toFixed(2)),
      turbidity: dates.map(d => {
        const rd = raw.readings.filter(r=>r.reading_date===d);
        return +avg(rd.map(r=>num(r.turbidity_NTU))).toFixed(2);
      }),
    };
  }

  // ── Per-station latest readings for CPCB panel ───────────────
  function getLatestStationReadings() {
    // Group readings by station, pick most recent
    const latest = {};
    raw.readings.forEach(r => {
      const key = r.station_id;
      const ts  = r.reading_date + ' ' + (r.reading_time || '');
      if (!latest[key] || ts > latest[key]._ts) {
        latest[key] = { ...r, _ts: ts };
      }
    });
    return raw.stations.map(s => {
      const rd = latest[s.station_id] || {};
      return {
        id:     s.station_id,
        name:   s.station_name,
        city:   `${s.city}, ${s.state ? s.state.substring(0,2).toUpperCase():''}`,
        src:    s.source_type || 'River',
        ph:     num(rd.pH)       || 7.2,
        turb:   num(rd.turbidity_NTU) || 2.0,
        tds:    num(rd.TDS_mg_L) || 280,
        temp:   num(rd.temperature_C) || 27,
        do:     num(rd.dissolved_oxygen_mg_L) || 6.2,
        wqi:    num(rd.WQI_score) || 70,
        cat:    rd.WQI_category  || 'Medium',
        anomaly: rd.anomaly_flag === 'TRUE',
      };
    });
  }

  // ── National average sensor values (for 4 sensor cards) ──────
  function getSensorAverages() {
    const latest = getLatestStationReadings();
    return {
      ph:   +avg(latest.map(s=>s.ph)).toFixed(2),
      turb: +avg(latest.map(s=>s.turb)).toFixed(2),
      tds:  Math.round(avg(latest.map(s=>s.tds))),
      temp: +avg(latest.map(s=>s.temp)).toFixed(1),
    };
  }

  // ── Alerts list ───────────────────────────────────────────────
  function getActiveAlerts(n=4) {
    return [...raw.alerts]
      .filter(a => a.status !== 'Resolved')
      .sort((a,b) => a.generated_at > b.generated_at ? -1 : 1)
      .slice(0, n);
  }

  // ── Patient Intelligence ──────────────────────────────────────
  function getPatientStats() {
    const total = raw.patients.length;
    const admitted = raw.patients.filter(p => p.status === 'Admitted' || p.status === 'Under Treatment').length;
    const icu      = raw.patients.filter(p => p.icu_admission === 'TRUE').length;

    // Disease breakdown
    const diseases = {};
    raw.patients.forEach(p => {
      const diag = p.diagnosis.split('(')[0].replace(/\(.+\)/, '').trim();
      const key  = diag.split(' ')[0]; // first word
      diseases[key] = (diseases[key] || 0) + 1;
    });
    const sorted = Object.entries(diseases).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const topMax  = sorted[0]?.[1] || 1;

    return { total, admitted, icu, diseases: sorted, max: topMax };
  }

  // ── Community Reports ─────────────────────────────────────────
  function getCommunityFeed(n=3) {
    return [...raw.community]
      .sort((a,b) => a.submitted_at > b.submitted_at ? -1 : 1)
      .slice(0, n);
  }

  // ── ML Predictions for chart ──────────────────────────────────
  function getMLChartData() {
    const preds = [...raw.predictions]
      .sort((a,b) => a.prediction_date > b.prediction_date ? 1 : -1)
      .slice(-7);
    return {
      labels: preds.map(p => {
        const d = p.prediction_date || '';
        const parts = d.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
      }),
      cases:  preds.map(p => num(p.predicted_cases_7d)),
      risk:   preds.map(p => num(p.probability_pct)),
    };
  }

  // ── Zone summary for hero strip ───────────────────────────────
  function getZoneSummary() {
    const stData = getLatestStationReadings();
    const crit  = stData.filter(s => s.wqi < 35).length;
    const risk  = stData.filter(s => s.wqi >= 35 && s.wqi < 60).length;
    const safe  = stData.filter(s => s.wqi >= 60).length;
    return { safe: safe * 14, risk: risk * 14, critical: crit * 14 }; // scaled to national estimate
  }

  // ── Transmission stats ────────────────────────────────────────
  function getTxStats() {
    const total   = raw.readings.length;
    const anomaly = raw.readings.filter(r => r.anomaly_flag === 'TRUE').length;
    const offline = raw.stations.filter(s => s.status !== 'Active').length;
    return { total, ok: total - anomaly, anomaly, offline };
  }

  return { loadAll, raw, getKPIs, getWQITrend, getLatestStationReadings,
           getSensorAverages, getActiveAlerts, getPatientStats,
           getCommunityFeed, getMLChartData, getZoneSummary, getTxStats };
})();
