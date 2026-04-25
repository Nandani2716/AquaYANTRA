// =============================================
// AquaGuard — Dashboard App Logic
// =============================================

// --- Auth Guard ---
// Pages that do NOT require authentication
const PUBLIC_PAGES = ['login.html', 'register.html', 'forgot-password.html'];
(function authGuard() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (PUBLIC_PAGES.includes(page)) return; // no guard needed on public pages
  const user = sessionStorage.getItem('aq_user');
  if (!user) {
    // Not logged in → redirect to login
    window.location.href = 'login.html';
  }
})();

// --- Inject logged-in user info into sidebar ---
function injectUserInfo() {
  const raw = sessionStorage.getItem('aq_user');
  if (!raw) return;
  try {
    const user = JSON.parse(raw);
    const nameEl   = document.querySelector('.user-name');
    const roleEl   = document.querySelector('.user-role');
    const avatarEl = document.querySelector('.user-avatar');

    if (nameEl) nameEl.textContent = user.name || 'User';

    if (roleEl) {
      const roleLabels = {
        user:     '👤 Citizen',
        citizen:  '👤 Citizen',
        officer:  '🛡️ Health Officer',
        hospital: '🏥 Hospital Authority',
      };
      roleEl.textContent = roleLabels[user.role] || '👤 User';
    }

    if (avatarEl) {
      const parts = (user.name || 'U').split(' ');
      avatarEl.textContent = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
      const avatarColors = {
        user:     'linear-gradient(135deg,#3b82f6,#06b6d4)',
        citizen:  'linear-gradient(135deg,#3b82f6,#06b6d4)',
        officer:  'linear-gradient(135deg,#059669,#0ea5e9)',
        hospital: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
      };
      avatarEl.style.background = avatarColors[user.role] || avatarColors.user;
    }
  } catch(e) {}
}
document.addEventListener('DOMContentLoaded', injectUserInfo);

// --- Logout ---
function logout() {
  sessionStorage.removeItem('aq_user');
  window.location.href = 'login.html';
}


// --- Live Date/Time ---
function updateDateTime() {
  const el = document.getElementById('live-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
updateDateTime();
setInterval(updateDateTime, 60000);

// --- Sidebar Toggle ---
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('open');
}

// --- 14-Day WQI Chart ---
const wqiCtx = document.getElementById('wqiChart');
if (wqiCtx) {
  const labels = (() => {
    const arr = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push(d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    return arr;
  })();

  const wqiData = [68.2, 70.1, 67.5, 72.3, 74.0, 71.8, 69.4, 66.2, 68.9, 72.1, 71.4, 73.5, 72.0, 74.4];
  const phData  = [7.2, 7.1, 7.4, 7.3, 6.9, 7.0, 7.5, 7.8, 7.6, 7.3, 7.1, 7.2, 7.4, 7.3];
  const turbData= [2.1, 2.4, 3.0, 2.7, 4.2, 3.8, 5.1, 6.2, 5.5, 4.1, 3.2, 2.8, 2.5, 2.3];

  let currentDataset = 'wqi';
  const datasets = { wqi: wqiData, ph: phData, turb: turbData };
  const colors = {
    wqi:  { line: '#3b82f6', fill: 'rgba(59,130,246,0.10)' },
    ph:   { line: '#14b8a6', fill: 'rgba(20,184,166,0.10)' },
    turb: { line: '#f97316', fill: 'rgba(249,115,22,0.10)' }
  };

  const wqiChart = new Chart(wqiCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Water Quality Index',
        data: wqiData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.10)',
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#94a3b8',
          bodyColor: '#f1f5f9',
          padding: 12,
          cornerRadius: 10,
          titleFont: { size: 12 },
          bodyFont: { size: 13, weight: '600' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        },
        y: {
          grid: { color: '#f1f5f9', borderDash: [4, 4] },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        }
      }
    }
  });

  window.filterChart = function(type) {
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.chip-btn[onclick="filterChart('${type}')"]`);
    if (btn) btn.classList.add('active');

    const c = colors[type] || colors.wqi;
    wqiChart.data.datasets[0].data = datasets[type] || wqiData;
    wqiChart.data.datasets[0].borderColor = c.line;
    wqiChart.data.datasets[0].backgroundColor = c.fill;
    wqiChart.data.datasets[0].pointBackgroundColor = c.line;
    const labels2 = { wqi: 'Water Quality Index', ph: 'pH Level', turb: 'Turbidity (NTU)' };
    wqiChart.data.datasets[0].label = labels2[type] || 'Index';
    wqiChart.update('active');
  };
}

// --- ML Prediction Chart ---
const mlCtx = document.getElementById('mlChart');
if (mlCtx) {
  const mlLabels = ['Today', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  new Chart(mlCtx, {
    type: 'bar',
    data: {
      labels: mlLabels,
      datasets: [
        {
          label: 'Predicted Cases',
          data: [340, 390, 420, 480, 360, 310, 280],
          backgroundColor: 'rgba(59,130,246,0.75)',
          borderColor: '#3b82f6',
          borderWidth: 1.5,
          borderRadius: 6,
          order: 2
        },
        {
          label: 'Risk Index',
          data: [62, 74, 81, 88, 70, 58, 52],
          type: 'line',
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderWidth: 2,
          yAxisID: 'y2',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#475569',
            font: { size: 12 },
            boxWidth: 14,
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#94a3b8',
          bodyColor: '#f1f5f9',
          padding: 12,
          cornerRadius: 10
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        },
        y: {
          grid: { color: '#f1f5f9', borderDash: [4, 4] },
          ticks: { color: '#94a3b8', font: { size: 11 } },
          title: { display: true, text: 'Predicted Cases', color: '#94a3b8', font: { size: 11 } }
        },
        y2: {
          position: 'right',
          grid: { display: false },
          ticks: { color: '#f97316', font: { size: 11 } },
          title: { display: true, text: 'Risk Index', color: '#f97316', font: { size: 11 } },
          max: 100
        }
      }
    }
  });
}

// --- Animate KPI bars on load ---
document.addEventListener('DOMContentLoaded', () => {
  const fills = document.querySelectorAll('.kpi-fill');
  fills.forEach(f => {
    const w = f.style.width;
    f.style.width = '0';
    setTimeout(() => { f.style.width = w; }, 300);
  });

  const dbBars = document.querySelectorAll('.db-bar');
  dbBars.forEach(b => {
    const w = b.style.width;
    b.style.width = '0';
    setTimeout(() => { b.style.width = w; }, 400);
  });
});

// --- Active nav link from URL ---
(function() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
  if (page === 'index.html' || page === '') {
    const el = document.getElementById('nav-dashboard');
    if (el) el.classList.add('active');
  }
})();

// =============================================
// DATABASE INTEGRATION — Wires CSV data to UI
// Runs after DOM + DataStore are both ready
// =============================================

// Reference to Chart.js instances so we can update them with real data
let _wqiChartRef = null;
let _mlChartRef  = null;

// Override chart creation to capture references
document.addEventListener('DOMContentLoaded', () => {
  _wqiChartRef = Chart.getChart('wqiChart') || null;
  _mlChartRef  = Chart.getChart('mlChart')  || null;
});

// ── Populate KPI cards ─────────────────────────────────────────
function populateKPIs(kpis) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  // WQI card
  const wqiEl = document.querySelector('.kpi-blue .kpi-value');
  if (wqiEl) wqiEl.textContent = kpis.wqi;
  const wqiTrend = document.querySelector('.kpi-blue .kpi-trend');
  if (wqiTrend) {
    const up = kpis.wqiChange >= 0;
    wqiTrend.className = `kpi-trend ${up ? 'up' : 'down'}`;
    wqiTrend.textContent = `${up ? '▲' : '▼'} ${Math.abs(kpis.wqiChange)}%`;
  }
  const wqiFill = document.querySelector('.kpi-blue .kpi-fill');
  if (wqiFill) wqiFill.style.width = Math.min(100, kpis.wqi) + '%';

  // Active Stations card
  const stEl = document.querySelector('.kpi-teal .kpi-value');
  if (stEl) stEl.textContent = kpis.activeStations.toLocaleString('en-IN');
  const stFill = document.querySelector('.kpi-teal .kpi-fill');
  if (stFill) stFill.style.width = Math.min(100, (kpis.activeStations/kpis.totalStations)*100) + '%';

  // Predicted Cases card
  const pcEl = document.querySelector('.kpi-orange .kpi-value');
  if (pcEl) pcEl.textContent = kpis.predictedCases.toLocaleString('en-IN');

  // Community Reports card
  const crEl = document.querySelector('.kpi-purple .kpi-value');
  if (crEl) crEl.textContent = kpis.totalReports.toLocaleString('en-IN');
  const crTrend = document.querySelector('.kpi-purple .kpi-trend');
  if (crTrend) crTrend.textContent = `▲ ${kpis.verifiedReports} verified`;

  // Hero strip
  const zones = DataStore.getZoneSummary();
  const heroItems = document.querySelectorAll('.s-val');
  if (heroItems[0]) heroItems[0].textContent = zones.safe;
  if (heroItems[1]) heroItems[1].textContent = zones.risk;
  if (heroItems[2]) heroItems[2].textContent = zones.critical;
  if (heroItems[3]) heroItems[3].textContent = kpis.activeStations.toLocaleString('en-IN');
}

// ── Update 14-day WQI chart with real data ────────────────────
function updateWQIChart(trend) {
  // Find the chart by canvas id across Chart.js registry
  const charts = Object.values(Chart.instances || {});
  const wqiChart = charts.find(c => c.canvas && c.canvas.id === 'wqiChart');
  if (!wqiChart || !trend.labels.length) return;

  // Store all three datasets for filter switching
  window._dbDatasets = { wqi: trend.wqi, ph: trend.ph, turbidity: trend.turbidity || trend.turb };
  window._dbLabels = trend.labels;

  wqiChart.data.labels = trend.labels;
  wqiChart.data.datasets[0].data = trend.wqi;
  wqiChart.data.datasets[0].label = 'Water Quality Index (Real Data)';
  wqiChart.update();

  // Update filter function to use real datasets
  window.filterChart = function(type) {
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.chip-btn[onclick="filterChart('${type}')"]`);
    if (btn) btn.classList.add('active');
    const colorMap = {
      wqi:  { line:'#2563eb', fill:'rgba(37,99,235,0.08)', label:'Water Quality Index' },
      ph:   { line:'#059669', fill:'rgba(5,150,105,0.08)',  label:'pH Level' },
      turb: { line:'#d97706', fill:'rgba(217,119,6,0.08)',  label:'Turbidity (NTU)' },
    };
    const c = colorMap[type] || colorMap.wqi;
    const data = window._dbDatasets;
    wqiChart.data.labels = window._dbLabels;
    wqiChart.data.datasets[0].data = data[type] || data['wqi'];
    wqiChart.data.datasets[0].borderColor = c.line;
    wqiChart.data.datasets[0].backgroundColor = c.fill;
    wqiChart.data.datasets[0].pointBackgroundColor = c.line;
    wqiChart.data.datasets[0].label = c.label;
    wqiChart.update('active');
  };
}

// ── Update ML chart with real prediction data ─────────────────
function updateMLChart(mlData) {
  const charts = Object.values(Chart.instances || {});
  const mlChart = charts.find(c => c.canvas && c.canvas.id === 'mlChart');
  if (!mlChart || !mlData.labels.length) return;
  mlChart.data.labels = mlData.labels;
  mlChart.data.datasets[0].data = mlData.cases;
  if (mlChart.data.datasets[1]) mlChart.data.datasets[1].data = mlData.risk;
  mlChart.update();
}

// ── Populate Alerts list ──────────────────────────────────────
function populateAlerts(alerts) {
  const list = document.querySelector('.alerts-list');
  if (!list || !alerts.length) return;
  const sevClass = { Critical:'alert-critical', High:'alert-warning', Moderate:'alert-warning', Watch:'alert-info', Resolved:'alert-info' };
  const sevIcon  = { Critical:'🚨', High:'⚠️', Moderate:'⚠️', Watch:'ℹ️', Resolved:'✅' };
  const timeAgo  = t => {
    const diff = (Date.now() - new Date(t).getTime()) / 3600000;
    if (diff < 1) return `${Math.round(diff*60)}m ago`;
    if (diff < 24) return `${Math.round(diff)}h ago`;
    return `${Math.round(diff/24)}d ago`;
  };
  list.innerHTML = alerts.map(a => `
    <div class="alert-item ${sevClass[a.severity] || 'alert-info'}">
      <div class="alert-left">
        <span class="al-icon">${sevIcon[a.severity] || 'ℹ️'}</span>
        <div>
          <div class="al-title">${a.severity} — ${a.station_name || ''}, ${a.city || ''}</div>
          <div class="al-meta">${a.parameter_violated || ''} · ${a.alert_message ? a.alert_message.substring(0,80)+'…' : ''}</div>
        </div>
      </div>
      <div class="al-time">${a.generated_at ? timeAgo(a.generated_at) : '—'}</div>
    </div>`).join('');
}

// ── Populate Patient Intelligence ─────────────────────────────
function populatePatients(stats) {
  // Stat numbers
  const vals = document.querySelectorAll('.pt-num');
  if (vals[0]) vals[0].textContent = stats.total;
  if (vals[1]) { vals[1].textContent = stats.admitted; vals[1].className = 'pt-num pt-orange'; }
  if (vals[2]) { vals[2].textContent = stats.icu; vals[2].className = 'pt-num pt-red'; }

  // Disease breakdown bars
  const dbWrap = document.querySelector('.disease-breakdown');
  if (!dbWrap || !stats.diseases.length) return;
  const colMap = ['db-red','db-orange','db-yellow','db-blue'];
  const breakHtml = stats.diseases.map(([name, count], i) => {
    const pct = Math.round((count / stats.max) * 100);
    return `<div class="db-item">
      <span class="db-name">${name}</span>
      <div class="db-bar-wrap"><div class="db-bar ${colMap[i]||'db-blue'}" style="width:${pct}%"></div></div>
      <span class="db-pct">${count}</span>
    </div>`;
  }).join('');
  dbWrap.innerHTML = `<div class="db-title">Cases by Disease</div>${breakHtml}`;
}

// ── Populate Community Feed ───────────────────────────────────
function populateCommunity(reports) {
  const feed = document.querySelector('.community-feed');
  if (!feed || !reports.length) return;
  const avColors = ['cf-av1','cf-av2','cf-av3'];
  const timeAgo = t => {
    const diff = (Date.now() - new Date(t).getTime()) / 3600000;
    if (diff < 1) return `${Math.round(diff*60)}m ago`;
    if (diff < 24) return `${Math.round(diff)}h ago`;
    return `${Math.round(diff/24)}d ago`;
  };
  feed.innerHTML = reports.map((r, i) => {
    const name    = r.reporter_anonymous === 'TRUE' ? 'Anonymous' : r.reporter_name || 'Citizen';
    const initials= name.split(' ').map(w=>w[0]||'').slice(0,2).join('').toUpperCase() || 'C';
    const verified= r.verification_status === 'Verified';
    const urgent  = r.urgency === 'Urgent';
    const tag     = verified
      ? '<span class="cf-tag tag-verified">✓ Verified</span>'
      : (urgent ? '<span class="cf-tag tag-urgent">🔴 Urgent</span>' : '');
    return `<div class="cf-item">
      <div class="cf-avatar ${avColors[i%3]}">${initials}</div>
      <div class="cf-body">
        <div class="cf-author">${name} ${tag}</div>
        <div class="cf-text">"${(r.description||'').substring(0,100)}…"</div>
        <div class="cf-footer">
          <span class="cf-loc">📍 ${r.city||''}, ${r.state||''}</span>
          <span class="cf-time">${r.submitted_at ? timeAgo(r.submitted_at) : ''}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Populate CPCB Panel with real station data ────────────────
function populateCPCBFromDB(stations) {
  // National averages → sensor cards
  const avg = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : 0;
  const set = (id, val, anomaly=false) => {
    const el = document.getElementById('val-'+id);
    if (!el) return;
    el.textContent = val;
    el.className = 'cscard-value' + (anomaly ? ' anomaly' : '');
  };
  set('ph',   avg(stations.map(s=>s.ph)),   avg(stations.map(s=>s.ph)) > 8.5 || avg(stations.map(s=>s.ph)) < 6.5);
  set('turb', avg(stations.map(s=>s.turb)), avg(stations.map(s=>s.turb)) > 5);
  set('tds',  Math.round(avg(stations.map(s=>s.tds))), avg(stations.map(s=>s.tds)) > 500);
  set('temp', avg(stations.map(s=>s.temp)), false);

  // Transmission stats
  const tx = DataStore.getTxStats();
  const setTx = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  setTx('tx-total',   tx.total);
  setTx('tx-ok',      tx.ok);
  setTx('tx-anomaly', tx.anomaly);
  setTx('tx-offline', tx.offline);

  // Station table
  const body = document.getElementById('csf-body');
  if (!body) return;

  const statusBadge = s => {
    if (s.wqi < 35)  return '<span class="csf-badge badge-critical">🚨 Unsafe</span>';
    if (s.wqi < 60)  return '<span class="csf-badge badge-warn">⚠ Caution</span>';
    return '<span class="csf-badge badge-ok">✅ Safe</span>';
  };
  const phBad   = s => s.ph < 6.5 || s.ph > 8.5;
  const turbBad = s => s.turb > 5;
  const tdsBad  = s => s.tds > 500;
  const wqiStyle = s => s.wqi < 35 ? 'color:#dc2626;font-weight:700;' : s.wqi < 60 ? 'color:#d97706;font-weight:700;' : 'color:#16a34a;font-weight:700;';

  body.innerHTML = stations.map(s => `<div class="csf-row">
    <span class="csf-station">📡 ${s.name}<br><small style="font-weight:400;color:#9ca3af;font-size:10px;">${s.id} · ${s.src} · ${s.city}</small></span>
    <span style="${phBad(s)?'color:#dc2626;font-weight:700;':''}">${s.ph}</span>
    <span style="${turbBad(s)?'color:#dc2626;font-weight:700;':s.turb>1?'color:#d97706;':''}">${s.turb} NTU</span>
    <span style="${tdsBad(s)?'color:#dc2626;font-weight:700;':''}">${s.tds}</span>
    <span>${s.temp}°C</span>
    <span style="${wqiStyle(s)}">${s.wqi}</span>
    <span>${statusBadge(s)}</span>
    <span style="color:#9ca3af;font-size:11px;">Live · auto</span>
  </div>`).join('');

  // Update last sync text
  const syncEl = document.getElementById('cpcb-last-sync');
  if (syncEl) {
    const now = new Date();
    syncEl.textContent = `Last sync: ${now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} · from CSV data`;
  }
}

// ── Master init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const isDashboard = !!document.getElementById('cpcb-status-section');

  if (isDashboard) {
    // Show a subtle loading indicator on sensor cards
    ['ph','turb','tds','temp'].forEach(id => {
      const el = document.getElementById('val-'+id);
      if (el) { el.textContent = '…'; el.style.opacity = '0.4'; }
    });

    try {
      await DataStore.loadAll();

      // 1. KPI cards
      populateKPIs(DataStore.getKPIs());

      // 2. 14-day WQI chart (slight delay so Chart.js has rendered)
      setTimeout(() => {
        updateWQIChart(DataStore.getWQITrend());
        updateMLChart(DataStore.getMLChartData());
      }, 200);

      // 3. Alerts
      populateAlerts(DataStore.getActiveAlerts(4));

      // 4. Patient Intelligence
      populatePatients(DataStore.getPatientStats());

      // 5. Community Feed
      populateCommunity(DataStore.getCommunityFeed(3));

      // 6. CPCB panel with real station readings
      const stData = DataStore.getLatestStationReadings();
      populateCPCBFromDB(stData);

      // Restore opacity on sensor cards
      ['ph','turb','tds','temp'].forEach(id => {
        const el = document.getElementById('val-'+id);
        if (el) el.style.opacity = '1';
      });

      console.log('[AquaGuard] ✅ Database integrated successfully');

    } catch(err) {
      console.error('[AquaGuard] DB integration error:', err);
      // Graceful fallback — simulated panel still runs
      renderCPCBPanel();
    }

    // Force Sync button now re-pulls from DataStore
    window.refreshCPCBStatus = async function() {
      const btn = document.getElementById('btn-cpcb-refresh');
      if (btn) { btn.textContent = 'Syncing…'; btn.classList.add('spinning'); }
      await DataStore.loadAll();
      populateCPCBFromDB(DataStore.getLatestStationReadings());
      populateAlerts(DataStore.getActiveAlerts(4));
      if (btn) { btn.textContent = '↻ Force Sync'; btn.classList.remove('spinning'); }
    };
  }
});

// Sensor data from tankers, WTPs & distribution
// BIS 10500 / WHO Drinking Water Standards
// =============================================

// Source type icons
const SRC_ICON = {
  'WTP':          '🏭',  // Water Treatment Plant
  'Tanker':       '🚛',  // Mobile tanker dispatch
  'Distribution': '🪣',  // Distribution point / public tap
  'Borewell':     '⛽',  // Treated borewell supply
  'Overhead Tank':'🏗️', // Municipal overhead tank
};

// BIS 10500 Drinking Water Limits
const DW_LIMITS = {
  ph_min: 6.5, ph_max: 8.5,
  turb: 1,      // NTU — BIS 10500 (1 NTU desirable, 5 permissible)
  tds: 500,     // mg/L desirable (2000 permissible)
  temp: 45,     // °C max acceptable
};

const CPCB_STATIONS = [
  // station_id, name, city, supply source, ph, turb(NTU), tds(mg/L), temp(°C), wqi, status
  { id:'DW-UP-001', name:'Varanasi WTP Outlet',      city:'Varanasi, UP',     src:'WTP',           ph:8.4, turb:2.8,  tds:420, temp:27.4, wqi:38.2, status:'critical' },
  { id:'DW-UP-002', name:'Kanpur Tanker Depot',       city:'Kanpur, UP',       src:'Tanker',         ph:8.2, turb:3.1,  tds:398, temp:29.1, wqi:42.6, status:'warning'  },
  { id:'DW-UP-003', name:'Lucknow Gomti WTP',         city:'Lucknow, UP',      src:'WTP',            ph:7.2, turb:0.8,  tds:284, temp:26.8, wqi:76.4, status:'ok'       },
  { id:'DW-BR-001', name:'Patna Tanker Dispatch Hub', city:'Patna, BR',        src:'Tanker',         ph:7.9, turb:2.4,  tds:348, temp:26.2, wqi:52.8, status:'warning'  },
  { id:'DW-BR-002', name:'Muzaffarpur Dist. Point',   city:'Muzaffarpur, BR',  src:'Distribution',   ph:8.1, turb:3.8,  tds:372, temp:26.6, wqi:44.2, status:'warning'  },
  { id:'DW-WB-001', name:'Kolkata Palta WTP',         city:'Kolkata, WB',      src:'WTP',            ph:7.1, turb:0.7,  tds:248, temp:28.2, wqi:79.8, status:'ok'       },
  { id:'DW-MH-001', name:'Mumbai Bhandup WTP',        city:'Mumbai, MH',       src:'WTP',            ph:7.0, turb:0.4,  tds:188, temp:27.1, wqi:88.4, status:'ok'       },
  { id:'DW-MH-002', name:'Dharavi Tanker Point',      city:'Mumbai, MH',       src:'Tanker',         ph:7.4, turb:1.6,  tds:246, temp:28.4, wqi:71.2, status:'ok'       },
  { id:'DW-TN-001', name:'Chennai Chembarambakkam WTP',city:'Chennai, TN',     src:'WTP',            ph:7.1, turb:0.5,  tds:218, temp:29.8, wqi:86.2, status:'ok'       },
  { id:'DW-KA-001', name:'Bengaluru BWSSB Overhead',  city:'Bengaluru, KA',    src:'Overhead Tank',  ph:7.3, turb:0.9,  tds:252, temp:24.4, wqi:80.6, status:'ok'       },
  { id:'DW-GJ-001', name:'Surat Rander WTP',          city:'Surat, GJ',        src:'WTP',            ph:7.5, turb:1.2,  tds:312, temp:30.4, wqi:68.8, status:'ok'       },
  { id:'DW-GJ-002', name:'Ahmedabad Tanker Depot',    city:'Ahmedabad, GJ',    src:'Tanker',         ph:7.6, turb:2.2,  tds:362, temp:31.2, wqi:62.4, status:'warning'  },
  { id:'DW-DL-001', name:'Delhi Sonia Vihar WTP',     city:'Delhi, DL',        src:'WTP',            ph:7.4, turb:0.6,  tds:298, temp:28.8, wqi:78.4, status:'ok'       },
  { id:'DW-DL-002', name:'East Delhi Tanker Hub',     city:'Delhi, DL',        src:'Tanker',         ph:7.6, turb:1.8,  tds:342, temp:29.4, wqi:69.4, status:'ok'       },
  { id:'DW-MP-001', name:'Bhopal Kerwa WTP',          city:'Bhopal, MP',       src:'WTP',            ph:7.2, turb:0.9,  tds:278, temp:27.4, wqi:76.8, status:'ok'       },
  { id:'DW-RJ-001', name:'Jaipur Bisalpur WTP',       city:'Jaipur, RJ',       src:'WTP',            ph:7.5, turb:0.7,  tds:264, temp:31.8, wqi:81.4, status:'ok'       },
  { id:'DW-OR-001', name:'Bhubaneswar Bhuasuni WTP',  city:'Bhubaneswar, OR',  src:'WTP',            ph:7.1, turb:0.8,  tds:244, temp:29.6, wqi:82.2, status:'ok'       },
  { id:'DW-AS-001', name:'Guwahati Panbazar Tank',    city:'Guwahati, AS',     src:'Overhead Tank',  ph:6.9, turb:1.4,  tds:286, temp:26.8, wqi:72.4, status:'ok'       },
  { id:'DW-PB-001', name:'Amritsar Tanker Dispatch',  city:'Amritsar, PB',     src:'Tanker',         ph:7.3, turb:1.1,  tds:296, temp:23.4, wqi:74.8, status:'ok'       },
  { id:'DW-UP-004', name:'Varanasi Slum Borewell',    city:'Varanasi, UP',     src:'Borewell',       ph:8.8, turb:5.2,  tds:524, temp:28.2, wqi:29.4, status:'critical' },
];

// Small fluctuation helper — simulates live readings
function jitter(base, pct) {
  return +(base + (Math.random() - 0.5) * base * (pct / 100)).toFixed(2);
}

// Determine if a DRINKING WATER reading is within BIS 10500 safe limits
function paramStatus(station) {
  // pH outside range → critical
  if (station.ph < DW_LIMITS.ph_min || station.ph > DW_LIMITS.ph_max) return 'critical';
  // Turbidity > 5 NTU = critical (BIS permissible 5, desirable 1)
  if (station.turb > 5) return 'critical';
  if (station.turb > DW_LIMITS.turb) return 'warning';   // > 1 NTU desirable limit
  // TDS > 500 mg/L desirable limit
  if (station.tds > DW_LIMITS.tds) return 'warning';
  // WQI-based overall quality
  if (station.wqi < 30) return 'critical';
  if (station.wqi < 55) return 'warning';
  return 'ok';
}

// Build one table row — drinking water supply context
function buildRow(s) {
  const statusMap = {
    ok:       '<span class="csf-badge badge-ok">✅ Safe</span>',
    warning:  '<span class="csf-badge badge-warn">⚠ Caution</span>',
    critical: '<span class="csf-badge badge-critical">🚨 Unsafe</span>',
    offline:  '<span class="csf-badge badge-offline">— Offline</span>',
  };
  const wqiColor = s.wqi < 30 ? 'color:#dc2626;font-weight:700;'
                 : s.wqi < 55 ? 'color:#d97706;font-weight:700;'
                 : 'color:#16a34a;font-weight:700;';
  const now = new Date();
  const mins = Math.floor(Math.random() * 8);
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()-mins<0?now.getMinutes():now.getMinutes()-mins).padStart(2,'0')}`;
  const srcIcon = SRC_ICON[s.src] || '📡';
  // Colour-code each parameter vs BIS 10500 drinking water limits
  const phBad  = s.ph < DW_LIMITS.ph_min || s.ph > DW_LIMITS.ph_max;
  const turbOk = s.turb <= DW_LIMITS.turb;
  const turbWarn = !turbOk && s.turb <= 5;
  const tdsBad = s.tds > DW_LIMITS.tds;
  const phStyle   = phBad ? 'color:#dc2626;font-weight:700;' : '';
  const turbStyle = !turbOk ? (turbWarn ? 'color:#d97706;font-weight:700;' : 'color:#dc2626;font-weight:700;') : 'color:#16a34a;';
  const tdsStyle  = tdsBad ? 'color:#dc2626;font-weight:700;' : '';

  return `<div class="csf-row">
    <span class="csf-station">${srcIcon} ${s.name}<br><small style="font-weight:400;color:#94a3b8;font-size:10px;">${s.id} · ${s.src} · ${s.city}</small></span>
    <span style="${phStyle}">${s.ph}</span>
    <span style="${turbStyle}">${s.turb} NTU</span>
    <span style="${tdsStyle}">${s.tds}</span>
    <span>${s.temp}°C</span>
    <span style="${wqiColor}">${s.wqi}</span>
    <span>${statusMap[s.status] || statusMap.ok}</span>
    <span style="color:#94a3b8;font-size:11px;">${timeStr} · auto</span>
  </div>`;
}

// Compute national averages from station array
function computeAverages(stations) {
  const avg = arr => +(arr.reduce((a,b) => a+b, 0) / arr.length).toFixed(2);
  return {
    ph:   avg(stations.map(s => s.ph)),
    turb: avg(stations.map(s => s.turb)),
    tds:  Math.round(stations.map(s => s.tds).reduce((a,b)=>a+b,0)/stations.length),
    temp: avg(stations.map(s => s.temp)),
  };
}

// Main render function — updates all elements in panel
function renderCPCBPanel() {
  // Jitter station data
  CPCB_STATIONS.forEach(s => {
    s.ph   = jitter(s.ph, 1.5);
    s.turb = jitter(s.turb, 3);
    s.tds  = Math.round(jitter(s.tds, 1));
    s.temp = jitter(s.temp, 0.5);
    s.wqi  = jitter(s.wqi, 2);
    s.status = paramStatus(s);
  });

  // National averages → sensor cards
  const avg = computeAverages(CPCB_STATIONS);
  function updateSensorCard(id, val, anomaly) {
    const el = document.getElementById('val-' + id);
    if (!el) return;
    el.textContent = val;
    el.className = 'cscard-value' + (anomaly ? ' anomaly' : '');
  }
  updateSensorCard('ph',   avg.ph,   avg.ph < 6.5 || avg.ph > 8.5);
  updateSensorCard('turb', avg.turb, avg.turb > 5);
  updateSensorCard('tds',  avg.tds,  avg.tds > 500);
  updateSensorCard('temp', avg.temp, false);

  // Transmission counters
  const total  = CPCB_STATIONS.length * 4 + Math.floor(Math.random() * 80 + 20);
  const anomal = CPCB_STATIONS.filter(s => s.status !== 'ok').length * 4;
  const ok     = total - anomal;
  const offline = Math.floor(Math.random() * 3);
  const setTx = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTx('tx-total',   total);
  setTx('tx-ok',      ok);
  setTx('tx-anomaly', anomal);
  setTx('tx-offline', offline);

  // Station feed table
  const body = document.getElementById('csf-body');
  if (body) body.innerHTML = CPCB_STATIONS.map(buildRow).join('');

  // Last sync timestamp
  const syncEl = document.getElementById('cpcb-last-sync');
  if (syncEl) {
    const now = new Date();
    syncEl.textContent = `Last sync: ${now.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', second:'2-digit'})} · Next in 8s`;
  }
}

// Force Sync button — spinner + re-render
window.refreshCPCBStatus = function() {
  const btn = document.getElementById('btn-cpcb-refresh');
  if (!btn) return;
  btn.classList.add('spinning');
  btn.textContent = 'Syncing…';
  setTimeout(() => {
    renderCPCBPanel();
    btn.classList.remove('spinning');
    btn.textContent = '↻ Force Sync';
  }, 1200);
};

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Only run on dashboard page
  if (!document.getElementById('cpcb-status-section')) return;
  renderCPCBPanel();
  // Auto-refresh every 8 seconds
  setInterval(renderCPCBPanel, 8000);
});

