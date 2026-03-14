/**
 * NIST AI 800-4 六大維度監控 Dashboard — 前端邏輯
 */
(function () {
  'use strict';

  var data = NIST_DASHBOARD;
  var dims = data.dimensions;
  var labels = data.labels;
  var activeDim = null; // 目前展開的維度 index

  /* ========== Helpers ========== */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ========== SVG Icons ========== */
  var icons = {
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="18" r="1"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  };

  /* ========== Canvas mini-chart (sparkline) ========== */
  function drawSparkline(canvas, series, color, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Filter non-null values
    var pts = [];
    for (var i = 0; i < series.length; i++) {
      if (series[i].value != null) pts.push({ x: i, y: series[i].value });
    }
    if (pts.length < 2) return;

    var vals = pts.map(function (p) { return p.y; });
    var minV = opts.min != null ? opts.min : Math.min.apply(null, vals);
    var maxV = opts.max != null ? opts.max : Math.max.apply(null, vals);
    if (maxV === minV) { maxV = minV + 1; }

    var padY = 4;
    function tx(i) { return (i / (series.length - 1)) * w; }
    function ty(v) { return padY + (1 - (v - minV) / (maxV - minV)) * (h - padY * 2); }

    // threshold line
    if (opts.threshold != null) {
      var thY = ty(opts.threshold);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239,68,68,0.3)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.moveTo(0, thY);
      ctx.lineTo(w, thY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // area fill
    ctx.beginPath();
    ctx.moveTo(tx(pts[0].x), ty(pts[0].y));
    for (var j = 1; j < pts.length; j++) {
      ctx.lineTo(tx(pts[j].x), ty(pts[j].y));
    }
    ctx.lineTo(tx(pts[pts.length - 1].x), h);
    ctx.lineTo(tx(pts[0].x), h);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '05');
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.moveTo(tx(pts[0].x), ty(pts[0].y));
    for (var k = 1; k < pts.length; k++) {
      ctx.lineTo(tx(pts[k].x), ty(pts[k].y));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // last point dot
    var last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(tx(last.x), ty(last.y), 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* ========== System Info Bar ========== */
  function renderSysInfo() {
    var bar = $('#sysInfoBar');
    var info = data.systemInfo;
    bar.innerHTML = [
      '<span class="sys-info-item"><strong>系統：</strong>' + info.name + '</span>',
      '<span class="sys-info-item"><strong>部署日：</strong>' + info.deployDate + '</span>',
      '<span class="sys-info-item"><strong>負責單位：</strong>' + info.owner + '</span>',
      '<span class="sys-info-item"><strong>環境：</strong>' + info.environment + '</span>',
      '<span class="sys-info-item"><strong>模型：</strong>' + info.model + '</span>',
    ].join('');
  }

  /* ========== Overall Score ========== */
  function renderOverall() {
    var avg = Math.round(dims.reduce(function (s, d) { return s + d.score; }, 0) / dims.length);
    var scoreColor = avg >= 90 ? '#22c55e' : avg >= 75 ? '#eab308' : '#ef4444';

    // Ring
    var circumference = 2 * Math.PI * 54;
    var offset = circumference * (1 - avg / 100);

    var ring = $('#overallRing');
    ring.innerHTML =
      '<svg viewBox="0 0 120 120">' +
      '<circle class="score-ring-bg" cx="60" cy="60" r="54"/>' +
      '<circle class="score-ring-fill" cx="60" cy="60" r="54" ' +
      'stroke="' + scoreColor + '" ' +
      'stroke-dasharray="' + circumference + '" ' +
      'stroke-dashoffset="' + offset + '"/>' +
      '</svg>' +
      '<div class="score-ring-text">' +
      '<div class="score-ring-number" style="color:' + scoreColor + '">' + avg + '</div>' +
      '<div class="score-ring-label">Overall Score</div>' +
      '</div>';

    // Alert summary
    var critical = 0, warning = 0, info = 0;
    dims.forEach(function (d) {
      d.alerts.forEach(function (a) {
        if (a.level === 'critical') critical++;
        else if (a.level === 'warning') warning++;
        else info++;
      });
    });

    $('#alertCriticalNum').textContent = critical;
    $('#alertWarningNum').textContent = warning;
    $('#alertInfoNum').textContent = info;

    // Recent alerts (sorted by day desc)
    var allAlerts = [];
    dims.forEach(function (d, idx) {
      d.alerts.forEach(function (a) {
        allAlerts.push({ dim: d.title, day: a.day, level: a.level, msg: a.msg, dimIdx: idx });
      });
    });
    allAlerts.sort(function (a, b) { return b.day - a.day; });

    var list = $('#alertRecentList');
    list.innerHTML = '';
    allAlerts.slice(0, 6).forEach(function (a) {
      var item = el('div', 'alert-recent-item');
      item.innerHTML =
        '<span class="alert-dot ' + a.level + '"></span>' +
        '<span class="alert-recent-text">' + a.msg + '</span>' +
        '<span class="alert-recent-day">Day ' + a.day + '</span>';
      list.appendChild(item);
    });
  }

  /* ========== Dimension Grid ========== */
  function renderDimGrid() {
    var grid = $('#dimGrid');
    grid.innerHTML = '';

    dims.forEach(function (d, idx) {
      var card = el('div', 'dim-card' + (activeDim === idx ? ' active' : ''));
      card.style.setProperty('--dim-color', d.color);
      card.querySelector; // dummy
      card.innerHTML =
        '<div style="position:absolute;top:0;left:0;width:100%;height:3px;background:' + d.color + '"></div>' +
        (d.alerts.length > 0 ? '<div class="dim-alert-badge">' + d.alerts.length + '</div>' : '') +
        '<div class="dim-card-header">' +
        '  <div>' +
        '    <div class="dim-card-title">' + d.title + '</div>' +
        '    <div class="dim-card-subtitle">' + d.subtitle + '</div>' +
        '  </div>' +
        '  <div class="dim-score-badge ' + d.status + '">' + d.score + '</div>' +
        '</div>' +
        '<div class="dim-spark"><canvas id="spark' + idx + '"></canvas></div>' +
        '<div class="dim-metrics-row" id="dimPills' + idx + '"></div>';

      card.addEventListener('click', function () { toggleDetail(idx); });
      grid.appendChild(card);

      // Metric pills
      var pillRow = card.querySelector('#dimPills' + idx);
      d.metrics.forEach(function (m) {
        var last = null;
        for (var i = m.series.length - 1; i >= 0; i--) {
          if (m.series[i].value != null) { last = m.series[i].value; break; }
        }
        if (last == null) return;
        var pill = el('span', 'dim-metric-pill');
        var shortName = m.name.replace(/\s*\(.*?\)\s*/g, '');
        pill.innerHTML = shortName + ' <span class="pill-val">' + last + (m.unit ? m.unit : '') + '</span>';
        pillRow.appendChild(pill);
      });
    });

    // Draw sparklines after DOM is ready
    requestAnimationFrame(function () {
      dims.forEach(function (d, idx) {
        var canvas = document.getElementById('spark' + idx);
        if (!canvas) return;
        // Use first metric's series for sparkline
        drawSparkline(canvas, d.metrics[0].series, d.color, {
          threshold: d.metrics[0].lowerIsBetter ? d.metrics[0].threshold : null,
        });
      });
    });
  }

  /* ========== Detail Panel ========== */
  function toggleDetail(idx) {
    var panel = $('#detailPanel');
    if (activeDim === idx) {
      activeDim = null;
      panel.style.display = 'none';
      renderDimGrid();
      return;
    }
    activeDim = idx;
    renderDimGrid();
    renderDetail(idx);
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderDetail(idx) {
    var d = dims[idx];
    var panel = $('#detailPanel');

    // Header
    var iconEl = $('#detailIcon');
    iconEl.style.background = d.color + '22';
    iconEl.style.color = d.color;
    iconEl.innerHTML = icons[d.icon];
    $('#detailTitle').textContent = d.title;
    $('#detailSubtitle').textContent = d.subtitle + ' — ' + d.summary;

    // Metrics
    var metricsGrid = $('#detailMetrics');
    metricsGrid.innerHTML = '';

    d.metrics.forEach(function (m, mi) {
      var last = null;
      for (var i = m.series.length - 1; i >= 0; i--) {
        if (m.series[i].value != null) { last = m.series[i].value; break; }
      }

      var card = el('div', 'detail-metric-card');
      card.innerHTML =
        '<div class="detail-metric-name">' + m.name + '</div>' +
        '<div class="detail-metric-value">' + (last != null ? last : 'N/A') +
        (m.unit ? '<span class="detail-metric-unit"> ' + m.unit + '</span>' : '') +
        '</div>' +
        (m.target != null ? '<div class="detail-metric-target">Target: ' + m.target + (m.unit ? m.unit : '') +
          (m.threshold != null ? ' / Threshold: ' + m.threshold + (m.unit ? m.unit : '') : '') + '</div>' : '') +
        '<div class="detail-metric-chart"><canvas id="detailChart' + idx + '_' + mi + '"></canvas></div>';
      metricsGrid.appendChild(card);
    });

    // Draw detail charts
    requestAnimationFrame(function () {
      d.metrics.forEach(function (m, mi) {
        var canvas = document.getElementById('detailChart' + idx + '_' + mi);
        if (!canvas) return;
        drawSparkline(canvas, m.series, d.color, {
          threshold: m.threshold,
        });
      });
    });

    // Alerts timeline
    var alertsCol = $('#detailAlerts');
    alertsCol.innerHTML = '';
    if (d.alerts.length === 0) {
      alertsCol.innerHTML = '<div style="font-size:0.68rem;color:var(--slate-500)">No alerts in this period</div>';
    } else {
      d.alerts.forEach(function (a) {
        var item = el('div', 'timeline-item');
        item.innerHTML =
          '<span class="timeline-day">Day ' + a.day + '</span>' +
          '<span class="timeline-badge ' + a.level + '"></span>' +
          '<span class="timeline-text">' + a.msg + '</span>';
        alertsCol.appendChild(item);
      });
    }

    // Events timeline
    var eventsCol = $('#detailEvents');
    eventsCol.innerHTML = '';
    d.events.forEach(function (e) {
      var item = el('div', 'timeline-item');
      item.innerHTML =
        '<span class="timeline-day">Day ' + e.day + '</span>' +
        '<span class="timeline-badge event"></span>' +
        '<span class="timeline-text">' + e.msg + '</span>';
      eventsCol.appendChild(item);
    });
  }

  /* ========== Refresh (regenerate data) ========== */
  function refresh() {
    // Reload page to regenerate random data
    window.location.reload();
  }

  /* ========== Init ========== */
  function init() {
    renderSysInfo();
    renderOverall();
    renderDimGrid();

    $('#refreshBtn').addEventListener('click', refresh);
    $('#detailCloseBtn').addEventListener('click', function () {
      activeDim = null;
      $('#detailPanel').style.display = 'none';
      renderDimGrid();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
