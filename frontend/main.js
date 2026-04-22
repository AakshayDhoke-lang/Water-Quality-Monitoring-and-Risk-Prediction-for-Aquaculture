const BACKEND_URL = 'http://localhost:8001';

// --- Navigation ---
const tabs = {
  home: { nav: document.getElementById('nav-home'), sec: document.getElementById('section-home') },
  dashboard: { nav: document.getElementById('nav-dashboard'), sec: document.getElementById('section-dashboard') },
  disease: { nav: document.getElementById('nav-disease'), sec: document.getElementById('section-disease') },
  species: { nav: document.getElementById('nav-species'), sec: document.getElementById('section-species') },
  simulation: { nav: document.getElementById('nav-simulation'), sec: document.getElementById('section-simulation') },
  'ai-doctor': { nav: document.getElementById('nav-ai-doctor'), sec: document.getElementById('section-ai-doctor') },
  challenge: { nav: document.getElementById('nav-challenge'), sec: document.getElementById('section-challenge') },
  about: { nav: document.getElementById('nav-about'), sec: document.getElementById('section-about') }
};

function switchTab(targetTab) {
  Object.values(tabs).forEach(t => {
    t.nav.classList.remove('active');
    t.sec.classList.add('hidden');
  });
  tabs[targetTab].nav.classList.add('active');
  tabs[targetTab].sec.classList.remove('hidden');
  
  if(targetTab === 'dashboard') {
    if(!chart) initChart();
    loadRootCauseAnalysis();
    loadTimeline();
  }
}

document.getElementById('nav-home').addEventListener('click', () => switchTab('home'));
document.getElementById('nav-dashboard').addEventListener('click', () => switchTab('dashboard'));
document.getElementById('nav-disease').addEventListener('click', () => switchTab('disease'));
document.getElementById('nav-species').addEventListener('click', () => switchTab('species'));
document.getElementById('nav-simulation').addEventListener('click', () => switchTab('simulation'));
document.getElementById('nav-ai-doctor').addEventListener('click', () => switchTab('ai-doctor'));
document.getElementById('nav-challenge').addEventListener('click', () => { switchTab('challenge'); loadChallenges(); });
document.getElementById('nav-about').addEventListener('click', () => switchTab('about'));
document.getElementById('logo-home').addEventListener('click', () => switchTab('home'));
document.getElementById('btn-start').addEventListener('click', () => switchTab('dashboard'));
document.getElementById('btn-login').addEventListener('click', () => switchTab('disease'));
document.getElementById('btn-goto-dashboard').addEventListener('click', () => switchTab('dashboard'));

// --- Chart Initialization ---
let chart;
const maxDataPoints = 40;

function initChart() {
  const ctx = document.getElementById('mainChart').getContext('2d');
  
  // Custom Gradients
  const gradpH = ctx.createLinearGradient(0, 0, 0, 350);
  gradpH.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
  gradpH.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
  
  const gradO2 = ctx.createLinearGradient(0, 0, 0, 350);
  gradO2.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
  gradO2.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(maxDataPoints).fill(''),
      datasets: [
        {
          label: 'pH Level',
          borderColor: '#06b6d4',
          backgroundColor: gradpH,
          data: Array(maxDataPoints).fill(7),
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Dissolved O2',
          borderColor: '#10b981',
          backgroundColor: gradO2,
          data: Array(maxDataPoints).fill(6),
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      color: '#94a3b8',
      scales: {
        y: { 
          grid: { color: 'rgba(255,255,255,0.05)' },
          min: 2, max: 12
        },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: '#f8fafc', usePointStyle: true } },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });
}

// --- Live Polling Simulation ---
let liveMode = true;

document.getElementById('btn-toggle-live').addEventListener('click', (e) => {
  liveMode = !liveMode;
  if(liveMode) {
    e.target.innerHTML = `<i class="fas fa-circle" style="font-size: 10px; margin-right: 5px;"></i> Active Polling`;
    e.target.style.color = 'var(--safe)';
    e.target.style.borderColor = 'var(--safe)';
  } else {
    e.target.innerHTML = `<i class="fas fa-pause-circle" style="margin-right: 5px;"></i> Paused`;
    e.target.style.color = 'var(--muted-foreground)';
    e.target.style.borderColor = 'var(--muted-foreground)';
  }
});

async function pollData() {
  if(!liveMode) return;
  try {
    const res = await fetch(`${BACKEND_URL}/live-data`);
    const data = await res.json();
    
    // Update UI numbers
    document.getElementById('ui-val-ph').innerText = data.pH.toFixed(1);
    document.getElementById('ui-val-oxy').innerHTML = `${data.oxygen.toFixed(1)} <span class="text-muted text-sm">mg/L</span>`;
    document.getElementById('ui-val-temp').innerHTML = `${data.temperature.toFixed(1)} <span class="text-muted text-sm">°C</span>`;
    
    // Update Chart
    if(chart) {
      chart.data.datasets[0].data.push(data.pH);
      chart.data.datasets[0].data.shift();
      chart.data.datasets[1].data.push(data.oxygen);
      chart.data.datasets[1].data.shift();
      chart.update();
    }
    
    // Handle Alerts
    let inDanger = false;
    if(data.pH < 5.5 || data.oxygen <= 4.0 || data.pH > 9.0) {
      inDanger = true;
      triggerMasterWarning(`CRITICAL: pH=${data.pH}, O2=${data.oxygen}`);
      document.getElementById('ui-card-ph').style.borderColor = 'var(--danger)';
      document.getElementById('ui-risk-val').innerText = '95%';
      document.getElementById('ui-risk-val').style.color = 'var(--danger)';
      document.getElementById('ui-risk-ring').style.background = 'conic-gradient(var(--danger) 95%, rgba(255,255,255,0.1) 0)';
    } else {
      document.getElementById('ui-card-ph').style.borderColor = 'var(--card-border)';
      document.getElementById('ui-risk-val').innerText = '12%';
      document.getElementById('ui-risk-val').style.color = 'var(--safe)';
      document.getElementById('ui-risk-ring').style.background = 'conic-gradient(var(--safe) 12%, rgba(255,255,255,0.1) 0)';
    }
    
  } catch(e) {}
}

setInterval(pollData, 1500);

// --- Alert System API ---
function triggerMasterWarning(msg) {
  const toast = document.getElementById('global-toast');
  document.getElementById('toast-message').innerText = msg;
  toast.classList.add('show');
  
  // Synthesizer Audio
  if('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance("Warning. Warning. Critical aquatic parameters detected.");
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
  
  // Siren UI FX
  document.body.classList.add('critical-siren');
  setTimeout(() => {
    toast.classList.remove('show');
    document.body.classList.remove('critical-siren');
  }, 6000);
}

// Fetch Alerts Log
async function updateAlertsLog() {
  try {
    const res = await fetch(`${BACKEND_URL}/alerts`);
    const data = await res.json();
    const c = document.getElementById('alerts-container');
    c.innerHTML = '';
    
    if(data.length === 0) {
      c.innerHTML = `<div class="text-muted text-sm" style="padding: 1rem;">System operating normally.</div>`;
      return;
    }
    
    data.forEach(a => {
      let crit = a.severity === 'Critical' ? 'critical' : 'safe';
      c.innerHTML += `
        <div class="alert-item ${crit}">
          <div style="flex:1;">
            <div style="font-size: 0.75rem; color: #94a3b8;">${a.timestamp}</div>
            <div style="font-size: 0.9rem; font-weight: 500;">${a.message}</div>
          </div>
        </div>
      `;
    });
  } catch(e) {}
}
setInterval(updateAlertsLog, 3000);
updateAlertsLog();

// --- Manual Prediction API ---
document.getElementById('btn-predict-risk').addEventListener('click', async (e) => {
  e.target.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Calculating...`;
  
  const payload = {
    pH: parseFloat(document.getElementById('in-ph').value),
    temperature: 25.0, // Defaults for demo
    turbidity: parseFloat(document.getElementById('in-turb').value),
    oxygen: 6.0
  };
  
  try {
    const res = await fetch(`${BACKEND_URL}/predict-water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    document.getElementById('ai-result').classList.remove('hidden');
    document.getElementById('ai-status').innerText = data.status;
    document.getElementById('ai-action').innerText = data.recommendation;
    
    if(data.status === 'Dangerous') {
      document.getElementById('ai-result').style.borderColor = 'var(--danger)';
      document.getElementById('ai-status').style.color = 'var(--danger)';
    } else if (data.status === 'Moderate') {
      document.getElementById('ai-result').style.borderColor = 'var(--warn)';
      document.getElementById('ai-status').style.color = 'var(--warn)';
    } else {
      document.getElementById('ai-result').style.borderColor = 'var(--safe)';
      document.getElementById('ai-status').style.color = 'var(--safe)';
    }
    
  } catch(e) {}
  e.target.innerHTML = `<i class="fas fa-bolt"></i> Calculate 48h Risk`;
});

// --- Disease Scanner API ---
const fileInput = document.getElementById('file-input');
let currentFile = null;

document.getElementById('drop-zone').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if(e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if(!file.type.startsWith('image/')) return;
  currentFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('drop-zone').classList.add('hidden');
    document.getElementById('disease-preview').classList.remove('hidden');
    document.getElementById('img-preview').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('btn-scan').addEventListener('click', async (e) => {
  if(!currentFile) return;
  
  e.target.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Neural Scan in Progress...`;
  e.target.disabled = true;
  
  const fd = new FormData();
  fd.append('file', currentFile);
  
  try {
    const res = await fetch(`${BACKEND_URL}/predict-disease`, { method: 'POST', body: fd });
    const data = await res.json();
    
    document.getElementById('disease-preview').classList.add('hidden');
    document.getElementById('disease-result').classList.remove('hidden');
    
    document.getElementById('ui-pathology').innerText = data.disease_name;
    document.getElementById('ui-confidence').innerText = `${data.confidence}%`;
    document.getElementById('ui-treatment').innerText = data.suggested_treatment;
  } catch(e) {}
  
  e.target.disabled = false;
  e.target.innerHTML = `<i class="fas fa-microscope"></i> Initiate Neural Scan`;
});

document.getElementById('btn-reset-scan').addEventListener('click', () => {
  document.getElementById('disease-result').classList.add('hidden');
  document.getElementById('drop-zone').classList.remove('hidden');
  fileInput.value = '';
  currentFile = null;
});

// Initial tab
switchTab('home');

// ==================== NEW FEATURE MODULES ====================

// === DIGITAL TWIN SIMULATION ===
document.getElementById('btn-run-sim').addEventListener('click', async (e) => {
  e.target.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Simulating...`;
  e.target.disabled = true;

  const payload = {
    pH: parseFloat(document.getElementById('sim-ph').value),
    temperature: parseFloat(document.getElementById('sim-temp').value),
    turbidity: parseFloat(document.getElementById('sim-turb').value),
    oxygen: parseFloat(document.getElementById('sim-oxy').value),
    ammonia: parseFloat(document.getElementById('sim-amm').value)
  };

  try {
    const res = await fetch(`${BACKEND_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    // Before card
    const beforeEl = document.getElementById('sim-before-score');
    beforeEl.innerText = data.before.risk_score + '%';
    beforeEl.style.color = getConditionColor(data.before.condition);
    document.getElementById('sim-before-condition').innerText = data.before.condition;

    // After card
    const afterEl = document.getElementById('sim-after-score');
    afterEl.innerText = data.after.risk_score + '%';
    afterEl.style.color = getConditionColor(data.after.condition);
    document.getElementById('sim-after-condition').innerText = data.after.condition;

    // Risk delta
    const delta = data.risk_change;
    const deltaEl = document.getElementById('sim-risk-delta');
    deltaEl.innerText = (delta > 0 ? '+' : '') + delta + '%';
    deltaEl.style.color = delta > 0 ? 'var(--danger)' : delta < 0 ? 'var(--safe)' : 'var(--primary)';

    // Parameters detail
    const paramsEl = document.getElementById('sim-params-detail');
    paramsEl.innerHTML = '';
    for (const [key, val] of Object.entries(data.parameters)) {
      paramsEl.innerHTML += `<span style="background: ${val.status === 'safe' ? 'oklch(0.78 0.16 165 / 0.15)' : 'oklch(0.68 0.24 25 / 0.15)'}; border: 1px solid ${val.status === 'safe' ? 'var(--safe)' : 'var(--danger)'}; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-family: var(--font-mono);">${key}: ${val.value}</span>`;
    }
  } catch(err) {
    console.error('Simulation error:', err);
  }

  e.target.disabled = false;
  e.target.innerHTML = `<i class="fas fa-play"></i> Run Simulation`;
});

function getConditionColor(condition) {
  switch(condition) {
    case 'Safe': return 'var(--safe)';
    case 'Moderate': return 'var(--warn)';
    case 'Warning': return 'var(--warn)';
    case 'Critical': return 'var(--danger)';
    default: return 'var(--primary)';
  }
}

// === AI FISH DOCTOR ===
window.sendDoctorMessage = function(msg) {
  if (!msg) return;
  const input = document.getElementById('chat-input');
  input.value = '';

  const messagesEl = document.getElementById('chat-messages');

  // Add user bubble
  messagesEl.innerHTML += `<div class="chat-bubble-user"><div class="chat-bubble-content"><p>${escapeHtml(msg)}</p></div></div>`;
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Add typing indicator
  const typingId = 'typing-' + Date.now();
  messagesEl.innerHTML += `<div class="chat-bubble-ai" id="${typingId}"><div class="chat-bubble-content"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>`;
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Call API
  fetch(`${BACKEND_URL}/ai-doctor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  })
  .then(res => res.json())
  .then(data => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    let html = `<p style="font-weight: 600; color: var(--primary); margin-bottom: 6px;">${data.response}</p>`;
    html += `<p style="margin-top: 8px;"><strong style="color: var(--warn);">Root Cause:</strong> ${data.root_cause}</p>`;
    html += `<p style="margin-top: 8px;"><strong style="color: var(--safe);">Solution Steps:</strong></p><ol style="margin-left: 1.25rem; margin-top: 4px;">`;
    data.solution_steps.forEach(s => html += `<li style="margin-bottom: 3px;">${s}</li>`);
    html += `</ol>`;
    html += `<p style="margin-top: 8px; font-style: italic; color: var(--muted-foreground);"><i class="fas fa-shield-alt" style="color: var(--primary);"></i> ${data.preventive_advice}</p>`;

    messagesEl.innerHTML += `<div class="chat-bubble-ai"><div class="chat-bubble-content">${html}</div></div>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  })
  .catch(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    messagesEl.innerHTML += `<div class="chat-bubble-ai"><div class="chat-bubble-content"><p style="color: var(--danger);">Connection error. Please check if the backend is running.</p></div></div>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
};

document.getElementById('btn-chat-send').addEventListener('click', () => {
  const msg = document.getElementById('chat-input').value.trim();
  if (msg) sendDoctorMessage(msg);
});

document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const msg = e.target.value.trim();
    if (msg) sendDoctorMessage(msg);
  }
});

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// === ROOT CAUSE ANALYSIS ===
async function loadRootCauseAnalysis() {
  try {
    const res = await fetch(`${BACKEND_URL}/explain`);
    const data = await res.json();
    const container = document.getElementById('rca-chart-container');
    container.innerHTML = '';
    document.getElementById('rca-summary').innerText = data.summary;

    data.features.forEach((f, i) => {
      const pct = Math.round(f.importance * 100);
      container.innerHTML += `
        <div class="rca-bar-row">
          <div class="rca-bar-label">${f.name}</div>
          <div class="rca-bar-track">
            <div class="rca-bar-fill" style="width: 0%;" data-width="${pct}%">${pct}%</div>
          </div>
        </div>
        <div class="rca-bar-tooltip">${f.tooltip}</div>
      `;
    });

    // Animate bars after a short delay
    setTimeout(() => {
      container.querySelectorAll('.rca-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 100);
  } catch(e) {}
}

// === EARLY WARNING TIMELINE ===
async function loadTimeline() {
  try {
    const res = await fetch(`${BACKEND_URL}/timeline-predict`);
    const data = await res.json();
    const container = document.getElementById('timeline-container');

    let html = '<div class="timeline-track">';
    data.events.forEach(ev => {
      html += `
        <div class="timeline-item" title="${ev.label}">
          <div class="timeline-time">${ev.time}</div>
          <div class="timeline-dot ${ev.status}"></div>
          <div class="timeline-label">${ev.label}</div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch(e) {}
}

// Re-bind navigation to ensure all links work
Object.keys(tabs).forEach(key => {
  if (tabs[key].nav) {
    tabs[key].nav.onclick = () => {
      if (key === 'challenge') { switchTab(key); loadChallenges(); }
      else switchTab(key);
    };
  }
});
document.getElementById('logo-home').onclick = () => switchTab('home');
document.getElementById('btn-start').onclick = () => switchTab('dashboard');
document.getElementById('btn-login').onclick = () => switchTab('disease');
document.getElementById('btn-goto-dashboard').onclick = () => switchTab('dashboard');

// === AI REPORT GENERATOR ===
document.getElementById('btn-generate-report').addEventListener('click', async (e) => {
  e.target.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generating...`;
  e.target.disabled = true;

  try {
    const res = await fetch(`${BACKEND_URL}/generate-report`);
    const data = await res.json();
    window._lastReport = data;

    let html = `<div class="report-section">
      <h3><i class="fas fa-info-circle"></i> Summary</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="padding: 12px; background: oklch(0.16 0.03 220 / 0.5); border-radius: 8px; border: 1px solid var(--border);">
          <div class="text-xs text-muted uppercase">Status</div>
          <div class="font-mono font-bold" style="color: var(--warn);">${data.summary.overall_status}</div>
        </div>
        <div style="padding: 12px; background: oklch(0.16 0.03 220 / 0.5); border-radius: 8px; border: 1px solid var(--border);">
          <div class="text-xs text-muted uppercase">Risk Score</div>
          <div class="font-mono font-bold" style="color: var(--primary);">${data.summary.risk_score}/100</div>
        </div>
        <div style="padding: 12px; background: oklch(0.16 0.03 220 / 0.5); border-radius: 8px; border: 1px solid var(--border);">
          <div class="text-xs text-muted uppercase">Total Alerts</div>
          <div class="font-mono font-bold">${data.summary.total_alerts}</div>
        </div>
        <div style="padding: 12px; background: oklch(0.16 0.03 220 / 0.5); border-radius: 8px; border: 1px solid var(--border);">
          <div class="text-xs text-muted uppercase">Critical Events</div>
          <div class="font-mono font-bold" style="color: var(--danger);">${data.summary.critical_events}</div>
        </div>
      </div>
    </div>`;

    html += `<div class="report-section">
      <h3><i class="fas fa-tint"></i> Water Quality</h3>
      <table class="report-table">
        <thead><tr><th>Parameter</th><th>Average</th><th>Status</th></tr></thead>
        <tbody>${data.water_quality.map(w => `<tr><td>${w.parameter}</td><td class="font-mono">${w.avg}</td><td style="color: var(--safe);">${w.status}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;

    html += `<div class="report-section">
      <h3><i class="fas fa-lightbulb"></i> Recommendations</h3>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
        ${data.recommendations.map(r => `<li style="padding: 8px 12px; background: oklch(0.78 0.18 195 / 0.05); border-left: 3px solid var(--primary); border-radius: 4px; font-size: 0.85rem;">${r}</li>`).join('')}
      </ul>
    </div>`;

    html += `<div class="text-xs text-muted" style="text-align: center;">Generated: ${data.generated_at}</div>`;

    document.getElementById('report-content').innerHTML = html;
    document.getElementById('report-modal').classList.remove('hidden');
  } catch(err) {
    console.error('Report error:', err);
  }

  e.target.disabled = false;
  e.target.innerHTML = `<i class="fas fa-file-alt"></i> Generate Report`;
});

document.getElementById('btn-close-report').addEventListener('click', () => {
  document.getElementById('report-modal').classList.add('hidden');
});

// PDF Download (simple text-based)
document.getElementById('btn-download-report').addEventListener('click', () => {
  const data = window._lastReport;
  if (!data) return;

  let text = `${data.title}\n${'='.repeat(40)}\nGenerated: ${data.generated_at}\n\n`;
  text += `SUMMARY\n${'-'.repeat(20)}\nOverall Status: ${data.summary.overall_status}\nRisk Score: ${data.summary.risk_score}/100\nTotal Alerts: ${data.summary.total_alerts}\nCritical Events: ${data.summary.critical_events}\n\n`;
  text += `WATER QUALITY\n${'-'.repeat(20)}\n`;
  data.water_quality.forEach(w => text += `${w.parameter}: ${w.avg} (${w.status})\n`);
  text += `\nRECOMMENDATIONS\n${'-'.repeat(20)}\n`;
  data.recommendations.forEach((r, i) => text += `${i+1}. ${r}\n`);

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `AquaPulse_Report_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
});

// === SCENARIO CHALLENGE MODE ===
let challengeData = [];
let challengeIndex = 0;
let challengeTotalScore = 0;
let challengeAnswered = false;

async function loadChallenges() {
  try {
    const res = await fetch(`${BACKEND_URL}/challenges`);
    const data = await res.json();
    challengeData = data.challenges;
    challengeIndex = 0;
    challengeTotalScore = 0;
    challengeAnswered = false;
    document.getElementById('challenge-score').innerText = '0';
    renderChallenge();
  } catch(e) {
    console.error('Challenge load error:', e);
  }
}

function renderChallenge() {
  if (challengeIndex >= challengeData.length) {
    document.getElementById('challenge-card').innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <i class="fas fa-trophy" style="font-size: 4rem; color: var(--warn); margin-bottom: 1rem;"></i>
        <h3 class="font-display font-bold" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Challenge Complete!</h3>
        <p class="text-muted text-lg">Your final score: <span class="font-mono font-bold" style="color: var(--primary);">${challengeTotalScore}</span> / ${challengeData.length * 100}</p>
        <button class="btn-launch" style="margin-top: 1.5rem;" onclick="loadChallenges()"><i class="fas fa-redo"></i> Try Again</button>
      </div>
    `;
    return;
  }

  const q = challengeData[challengeIndex];
  challengeAnswered = false;
  document.getElementById('challenge-current').innerText = challengeIndex + 1;
  document.getElementById('challenge-total').innerText = challengeData.length;
  document.getElementById('challenge-difficulty').innerText = q.difficulty;
  document.getElementById('challenge-question').innerText = q.question;
  document.getElementById('challenge-result').classList.add('hidden');
  document.getElementById('btn-next-challenge').classList.add('hidden');

  const optionsEl = document.getElementById('challenge-options');
  optionsEl.innerHTML = '';
  for (const [key, value] of Object.entries(q.options)) {
    const btn = document.createElement('button');
    btn.className = 'challenge-option';
    btn.innerHTML = `<span class="challenge-option-key">${key}</span><span>${value}</span>`;
    btn.addEventListener('click', () => submitChallengeAnswer(q.id, key, btn));
    optionsEl.appendChild(btn);
  }
}

async function submitChallengeAnswer(qId, answer, btnEl) {
  if (challengeAnswered) return;
  challengeAnswered = true;

  try {
    const res = await fetch(`${BACKEND_URL}/challenge-evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: qId, answer: answer })
    });
    const data = await res.json();

    // Highlight options
    document.querySelectorAll('.challenge-option').forEach(opt => {
      opt.style.pointerEvents = 'none';
      const key = opt.querySelector('.challenge-option-key').innerText;
      if (key === data.correct_answer) opt.classList.add('correct');
      else if (key === answer && !data.correct) opt.classList.add('wrong');
    });

    // Show result
    const resultEl = document.getElementById('challenge-result');
    resultEl.classList.remove('hidden');
    resultEl.style.background = data.correct ? 'oklch(0.78 0.16 165 / 0.08)' : 'oklch(0.68 0.24 25 / 0.08)';
    resultEl.style.border = `1px solid ${data.correct ? 'var(--safe)' : 'var(--danger)'}`;
    resultEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <i class="fas ${data.correct ? 'fa-check-circle' : 'fa-times-circle'}" style="color: ${data.correct ? 'var(--safe)' : 'var(--danger)'}; font-size: 1.25rem;"></i>
        <span class="font-display font-semibold" style="color: ${data.correct ? 'var(--safe)' : 'var(--danger)'}">${data.correct ? 'Correct!' : 'Incorrect'}</span>
      </div>
      <p class="text-sm" style="color: var(--muted-foreground);">${data.explanation}</p>
    `;

    if (data.correct) challengeTotalScore += 100;
    document.getElementById('challenge-score').innerText = challengeTotalScore;

    document.getElementById('btn-next-challenge').classList.remove('hidden');
  } catch(e) {
    console.error('Challenge eval error:', e);
  }
}

document.getElementById('btn-next-challenge').addEventListener('click', () => {
  challengeIndex++;
  renderChallenge();
});

// === VOICE ASSISTANT ===
let voiceRecognition = null;

document.getElementById('btn-voice-assistant').addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice recognition is not supported in this browser.');
    return;
  }

  document.getElementById('voice-overlay').classList.remove('hidden');
  document.getElementById('voice-transcript').innerText = 'Say a command like "Show risk" or "Open simulation"';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = 'en-US';
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = true;

  voiceRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    document.getElementById('voice-transcript').innerText = `"${transcript}"`;

    if (event.results[0].isFinal) {
      setTimeout(() => {
        document.getElementById('voice-overlay').classList.add('hidden');
        processVoiceCommand(transcript);
      }, 500);
    }
  };

  voiceRecognition.onerror = () => {
    document.getElementById('voice-transcript').innerText = 'Could not understand. Try again.';
    setTimeout(() => document.getElementById('voice-overlay').classList.add('hidden'), 1500);
  };

  voiceRecognition.onend = () => {
    // auto-close after recognition ends
  };

  voiceRecognition.start();
});

document.getElementById('btn-close-voice').addEventListener('click', () => {
  if (voiceRecognition) voiceRecognition.stop();
  document.getElementById('voice-overlay').classList.add('hidden');
});

function processVoiceCommand(cmd) {
  if (cmd.includes('risk') || cmd.includes('dashboard')) {
    switchTab('dashboard');
  } else if (cmd.includes('simulation') || cmd.includes('simulate') || cmd.includes('twin')) {
    switchTab('simulation');
  } else if (cmd.includes('doctor') || cmd.includes('diagnos') || cmd.includes('health')) {
    switchTab('ai-doctor');
  } else if (cmd.includes('report') || cmd.includes('generate')) {
    switchTab('dashboard');
    setTimeout(() => document.getElementById('btn-generate-report').click(), 500);
  } else if (cmd.includes('challenge') || cmd.includes('quiz') || cmd.includes('test')) {
    switchTab('challenge');
    loadChallenges();
  } else if (cmd.includes('scan') || cmd.includes('disease') || cmd.includes('upload')) {
    switchTab('disease');
  } else if (cmd.includes('species') || cmd.includes('reference')) {
    switchTab('species');
  } else if (cmd.includes('home')) {
    switchTab('home');
  }
}

// Chat mic button (uses same speech API for AI Doctor)
document.getElementById('btn-chat-mic').addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice recognition not supported.');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  rec.continuous = false;

  const micBtn = document.getElementById('btn-chat-mic');
  micBtn.style.background = 'oklch(0.78 0.18 195 / 0.3)';
  micBtn.style.boxShadow = 'var(--shadow-glow-sm)';

  rec.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById('chat-input').value = text;
    sendDoctorMessage(text);
  };
  rec.onend = () => {
    micBtn.style.background = 'var(--secondary)';
    micBtn.style.boxShadow = 'none';
  };
  rec.start();
});

// === ENHANCED ALERT SYSTEM (OVERLAY) ===
let alertOverlayShown = false;

function triggerAlertOverlay(msg) {
  if (alertOverlayShown) return;
  alertOverlayShown = true;

  document.getElementById('alert-overlay-message').innerText = msg;
  document.getElementById('alert-overlay-details').innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: oklch(0.68 0.24 25 / 0.1); border-radius: 8px; border: 1px solid oklch(0.68 0.24 25 / 0.3);">
        <span class="text-sm">Severity</span><span class="font-mono font-bold" style="color: var(--danger);">CRITICAL</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: oklch(0.16 0.03 220 / 0.5); border-radius: 8px; border: 1px solid var(--border);">
        <span class="text-sm">Time</span><span class="font-mono text-sm">${new Date().toLocaleTimeString()}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: oklch(0.16 0.03 220 / 0.5); border-radius: 8px; border: 1px solid var(--border);">
        <span class="text-sm">Action</span><span class="text-sm" style="color: var(--warn);">Immediate intervention required</span>
      </div>
    </div>
  `;
  document.getElementById('alert-overlay-modal').classList.remove('hidden');

  // Voice alert
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('Warning! Water condition critical. Immediate action required.');
    u.volume = 1;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
}

document.getElementById('btn-dismiss-alert').addEventListener('click', () => {
  document.getElementById('alert-overlay-modal').classList.add('hidden');
  alertOverlayShown = false;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
});

// === DEMO MODE ===
let demoInterval = null;

document.getElementById('demo-mode-toggle').addEventListener('change', (e) => {
  if (e.target.checked) {
    // Start demo mode - auto-update values
    demoInterval = setInterval(() => {
      const fakePH = (Math.random() * 4 + 5).toFixed(1);
      const fakeO2 = (Math.random() * 6 + 2).toFixed(1);
      const fakeTemp = (Math.random() * 12 + 20).toFixed(1);

      document.getElementById('ui-val-ph').innerText = fakePH;
      document.getElementById('ui-val-oxy').innerHTML = `${fakeO2} <span class="text-muted text-sm">mg/L</span>`;
      document.getElementById('ui-val-temp').innerHTML = `${fakeTemp} <span class="text-muted text-sm">°C</span>`;

      if (chart) {
        chart.data.datasets[0].data.push(parseFloat(fakePH));
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.push(parseFloat(fakeO2));
        chart.data.datasets[1].data.shift();
        chart.update();
      }

      // Trigger alert on extreme values
      if (parseFloat(fakePH) < 5.5 || parseFloat(fakeO2) < 4.0) {
        triggerAlertOverlay(`DEMO ALERT: pH=${fakePH}, O2=${fakeO2} mg/L`);
        triggerMasterWarning(`DEMO: pH=${fakePH}, O2=${fakeO2}`);
      }
    }, 3500);
  } else {
    if (demoInterval) clearInterval(demoInterval);
    demoInterval = null;
  }
});
