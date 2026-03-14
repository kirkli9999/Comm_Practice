/**
 * AI 財務創新案例方向 - 互動邏輯
 */

var financeState = {
  activeDomain: 'banking',
  activeCase: null,
};

// --- Domain Tab Switching ---

function renderDomainTabs() {
  var tabs = document.getElementById('domainTabs');
  if (!tabs) return;

  tabs.querySelectorAll('.domain-tab').forEach(function (tab) {
    if (tab.dataset.domain === financeState.activeDomain) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }

    tab.addEventListener('click', function () {
      financeState.activeDomain = tab.dataset.domain;
      financeState.activeCase = null;
      hideDetailPanel();
      renderDomainTabs();
      renderCasesGrid();
    });
  });
}

// --- Cases Grid ---

function renderCasesGrid() {
  var grid = document.getElementById('casesGrid');
  if (!grid) return;

  var cases = AI_FINANCE_DATA.cases[financeState.activeDomain] || [];

  grid.innerHTML = cases.map(function (c) {
    var sourceTags = c.sources.map(function (s) {
      return '<span class="case-tag ' + s + '">' + AI_FINANCE_DATA.sourceLabels[s] + '</span>';
    }).join('');

    var keywordTags = c.keywords.map(function (k) {
      return '<span class="case-tag keyword">' + k + '</span>';
    }).join('');

    return '<div class="case-card" data-id="' + c.id + '" data-level="' + c.level + '">' +
      '<div class="case-card-header">' +
        '<div class="case-card-title">' + c.title + '</div>' +
        '<span class="case-level-badge ' + c.level + '">' + c.levelLabel + '</span>' +
      '</div>' +
      '<div class="case-card-desc">' + c.desc + '</div>' +
      '<div class="case-card-tags">' + sourceTags + keywordTags + '</div>' +
      '<div class="case-card-arrow">點擊查看詳細分析 →</div>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('.case-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var caseId = card.dataset.id;
      var caseData = cases.find(function (c) { return c.id === caseId; });
      if (caseData) {
        financeState.activeCase = caseData;
        renderDetailPanel(caseData);
      }
    });
  });
}

// --- Detail Panel ---

function renderDetailPanel(caseData) {
  var panel = document.getElementById('detailPanel');
  var title = document.getElementById('detailTitle');
  var sources = document.getElementById('detailSources');
  var body = document.getElementById('detailBody');

  if (!panel || !title || !sources || !body) return;

  title.textContent = caseData.title;

  sources.innerHTML = caseData.sources.map(function (s) {
    return '<span class="source-tag ' + s + '">' + AI_FINANCE_DATA.sourceLabels[s] + '</span>';
  }).join('');

  var d = caseData.detail;

  var featuresHtml = d.features.map(function (f) {
    return '<li>' + f + '</li>';
  }).join('');

  body.innerHTML =
    '<div class="detail-section">' +
      '<div class="detail-section-title">案例背景與理論依據</div>' +
      '<p style="font-size:0.8rem;color:var(--slate-600);line-height:1.8">' + d.background + '</p>' +
    '</div>' +

    '<div class="detail-section">' +
      '<div class="detail-section-title">核心功能設計</div>' +
      '<ul class="detail-list">' + featuresHtml + '</ul>' +
    '</div>' +

    '<div class="detail-section">' +
      '<div class="detail-section-title">NIST 監控框架對應</div>' +
      '<p style="font-size:0.8rem;color:var(--slate-600);line-height:1.8">' + d.nistMapping + '</p>' +
    '</div>' +

    '<div class="detail-section">' +
      '<div class="detail-section-title">Deloitte 高階主管角色對應</div>' +
      '<p style="font-size:0.8rem;color:var(--slate-600);line-height:1.8">' + d.deloitteMapping + '</p>' +
    '</div>' +

    '<div class="detail-highlight">' +
      '<div class="detail-highlight-label">IMF 研究洞察</div>' +
      '<div class="detail-highlight-text">' + d.imfInsight + '</div>' +
    '</div>' +

    '<div class="detail-section" style="margin-top:1rem">' +
      '<div class="detail-section-title">主要挑戰與風險</div>' +
      '<p style="font-size:0.8rem;color:var(--slate-600);line-height:1.8">' + d.challenges + '</p>' +
    '</div>';

  panel.style.display = '';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideDetailPanel() {
  var panel = document.getElementById('detailPanel');
  if (panel) panel.style.display = 'none';
}

// --- C-Suite Grid ---

function renderCsuiteGrid() {
  var grid = document.getElementById('csuiteGrid');
  if (!grid) return;

  grid.innerHTML = AI_FINANCE_DATA.csuite.map(function (c) {
    return '<div class="csuite-card">' +
      '<div class="csuite-role">' + c.role + '</div>' +
      '<div class="csuite-title">' + c.title + '</div>' +
      '<div class="csuite-desc">' + c.desc + '</div>' +
    '</div>';
  }).join('');
}

// --- Monitoring Grid ---

function renderMonitoringGrid() {
  var grid = document.getElementById('monitoringGrid');
  if (!grid) return;

  grid.innerHTML = AI_FINANCE_DATA.monitoring.map(function (m) {
    return '<div class="monitoring-card">' +
      '<div class="monitoring-label">' + m.label + '</div>' +
      '<div class="monitoring-desc">' + m.desc + '</div>' +
    '</div>';
  }).join('');
}

// --- Challenges List ---

function renderChallenges() {
  var list = document.getElementById('challengesList');
  if (!list) return;

  list.innerHTML = AI_FINANCE_DATA.challenges.map(function (c) {
    return '<div class="challenge-item">' +
      '<div class="challenge-icon">' + c.icon + '</div>' +
      '<div class="challenge-content">' +
        '<div class="challenge-title">' + c.title + '</div>' +
        '<div class="challenge-desc">' + c.desc + '</div>' +
        '<div class="challenge-strategy">' + c.strategy + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// --- Initialization ---

function initAiFinance() {
  renderDomainTabs();
  renderCasesGrid();
  renderCsuiteGrid();
  renderMonitoringGrid();
  renderChallenges();

  // Detail close button
  var closeBtn = document.getElementById('detailClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      hideDetailPanel();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAiFinance);
} else {
  initAiFinance();
}
