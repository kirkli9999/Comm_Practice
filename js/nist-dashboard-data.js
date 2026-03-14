/**
 * NIST AI 800-4 六大維度監控 Dashboard — 模擬資料產生器
 * 模擬一個「AI 信用評分模型」部署後 30 天的監控數據
 */
var NIST_DASHBOARD = (function () {

  /* ========== 隨機工具 ========== */
  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* 產生帶漂移的時間序列 */
  function timeSeries(days, base, noise, drift) {
    drift = drift || 0;
    var pts = [];
    var v = base;
    for (var i = 0; i < days; i++) {
      v = v + drift + (Math.random() - 0.5) * noise;
      v = clamp(v, 0, 100);
      pts.push({ day: i + 1, value: Math.round(v * 100) / 100 });
    }
    return pts;
  }

  /* 日期標籤 */
  function dateLabels(days) {
    var labels = [];
    var d = new Date(2026, 1, 12); // 2026-02-12 上線日
    for (var i = 0; i < days; i++) {
      var nd = new Date(d.getTime() + i * 86400000);
      labels.push((nd.getMonth() + 1) + '/' + nd.getDate());
    }
    return labels;
  }

  var DAYS = 30;
  var labels = dateLabels(DAYS);

  /* ============================================================
   *  1. 功能性監控 (Functional)
   * ============================================================ */
  var functional = {
    title: '功能性監控',
    subtitle: 'Functional Monitoring',
    color: '#2563eb',
    bgColor: '#eff6ff',
    icon: 'chart',
    score: 0, // 動態計算
    status: '',
    summary: '追蹤模型準確度、預測偏差與輸出品質，確保 AI 系統持續按預期運作。',
    metrics: [
      {
        name: '模型準確率 (Accuracy)',
        unit: '%',
        target: 92,
        threshold: 85,
        series: timeSeries(DAYS, 94, 1.5, -0.12), // 模擬緩慢下降（模型漂移）
      },
      {
        name: 'F1 Score',
        unit: '',
        target: 0.90,
        threshold: 0.82,
        series: (function () {
          var s = timeSeries(DAYS, 91, 1.2, -0.1);
          return s.map(function (p) { return { day: p.day, value: Math.round(p.value / 100 * 100) / 100 }; });
        })(),
      },
      {
        name: '預測偏差 (Bias Score)',
        unit: '',
        target: 0,
        threshold: 0.15,
        series: (function () {
          var s = timeSeries(DAYS, 3, 2, 0.08);
          return s.map(function (p) { return { day: p.day, value: Math.round(p.value / 100 * 100) / 100 }; });
        })(),
        lowerIsBetter: true,
      },
    ],
    alerts: [
      { day: 18, level: 'warning', msg: '模型準確率連續 3 天低於 92% 目標值' },
      { day: 25, level: 'warning', msg: '偏差分數上升趨勢，建議檢查訓練數據分布' },
    ],
    events: [
      { day: 5, msg: '定期模型效能報告產出' },
      { day: 14, msg: '數據漂移偵測掃描完成' },
      { day: 22, msg: '模型再訓練排程啟動' },
    ],
  };

  /* ============================================================
   *  2. 運作監控 (Operational)
   * ============================================================ */
  var operational = {
    title: '運作監控',
    subtitle: 'Operational Monitoring',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    icon: 'server',
    score: 0,
    status: '',
    summary: '測量系統基礎設施組件，確保維持一致的服務水準。',
    metrics: [
      {
        name: '系統可用率 (Uptime)',
        unit: '%',
        target: 99.9,
        threshold: 99.5,
        series: timeSeries(DAYS, 99.95, 0.08, 0),
      },
      {
        name: 'API 平均延遲',
        unit: 'ms',
        target: 200,
        threshold: 500,
        series: (function () {
          var s = timeSeries(DAYS, 18, 4, 0.15);
          return s.map(function (p) { return { day: p.day, value: Math.round(p.value * 10) }; });
        })(),
        lowerIsBetter: true,
      },
      {
        name: '每日 API 請求量',
        unit: 'K',
        target: null,
        threshold: null,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            pts.push({ day: i + 1, value: Math.round(rand(12, 28) * 10) / 10 });
          }
          return pts;
        })(),
      },
    ],
    alerts: [
      { day: 11, level: 'critical', msg: '05:32 服務中斷 12 分鐘（資料庫連線池耗盡）' },
      { day: 23, level: 'warning', msg: 'API 延遲 P99 超過 500ms 閾值' },
    ],
    events: [
      { day: 7, msg: '基礎設施健康檢查完成' },
      { day: 15, msg: '自動擴縮容策略觸發（+2 replicas）' },
      { day: 28, msg: '排程維護窗口' },
    ],
  };

  /* ============================================================
   *  3. 人類因素監控 (Human Factors)
   * ============================================================ */
  var humanFactors = {
    title: '人類因素監控',
    subtitle: 'Human Factors Monitoring',
    color: '#9333ea',
    bgColor: '#faf5ff',
    icon: 'users',
    score: 0,
    status: '',
    summary: '測量人機互動品質，確保使用者理解 AI 輸出並對其保持適度信任。',
    metrics: [
      {
        name: '使用者覆核率 (Override Rate)',
        unit: '%',
        target: null,
        threshold: null,
        series: timeSeries(DAYS, 24, 3, -0.3), // 覆核率逐漸下降 → 可能過度信賴
      },
      {
        name: '使用者滿意度 (NPS)',
        unit: '',
        target: 70,
        threshold: 50,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            pts.push({ day: i + 1, value: randInt(58, 82) });
          }
          return pts;
        })(),
      },
      {
        name: '每日反饋提交數',
        unit: '',
        target: null,
        threshold: null,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            pts.push({ day: i + 1, value: randInt(3, 18) });
          }
          return pts;
        })(),
      },
    ],
    alerts: [
      { day: 20, level: 'warning', msg: '使用者覆核率降至 15%，可能出現自動化偏誤（Automation Bias）' },
      { day: 27, level: 'info', msg: '新增 4 則使用者反饋：「模型對年輕族群評分偏低」' },
    ],
    events: [
      { day: 3, msg: 'AI 素養培訓第一梯次（42 人參加）' },
      { day: 10, msg: '使用者體驗訪談完成（8 位信用分析師）' },
      { day: 21, msg: 'AI 素養培訓第二梯次（38 人參加）' },
    ],
  };

  /* ============================================================
   *  4. 安全性監控 (Security)
   * ============================================================ */
  var security = {
    title: '安全性監控',
    subtitle: 'Security Monitoring',
    color: '#f97316',
    bgColor: '#fff7ed',
    icon: 'shield',
    score: 0,
    status: '',
    summary: '偵測對抗性攻擊、注入嘗試與模型欺騙行為，維護系統安全。',
    metrics: [
      {
        name: '對抗性輸入偵測數',
        unit: '次/日',
        target: null,
        threshold: 10,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            var v = randInt(0, 6);
            if (i === 15 || i === 16) v = randInt(12, 22); // 模擬攻擊事件
            pts.push({ day: i + 1, value: v });
          }
          return pts;
        })(),
        lowerIsBetter: true,
      },
      {
        name: '模型反轉嘗試',
        unit: '次/日',
        target: null,
        threshold: 5,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            pts.push({ day: i + 1, value: randInt(0, 3) });
          }
          return pts;
        })(),
        lowerIsBetter: true,
      },
      {
        name: '紅隊測試通過率',
        unit: '%',
        target: 95,
        threshold: 85,
        series: (function () {
          // 只有做測試的天才有資料
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            if (i === 6 || i === 13 || i === 20 || i === 27) {
              pts.push({ day: i + 1, value: randInt(88, 97) });
            } else {
              pts.push({ day: i + 1, value: null });
            }
          }
          return pts;
        })(),
      },
    ],
    alerts: [
      { day: 16, level: 'critical', msg: '偵測到集中式對抗性輸入攻擊（來自 3 個 IP 段）' },
      { day: 17, level: 'warning', msg: '對抗性攻擊持續，已啟動 IP 封鎖與模型輸入過濾' },
    ],
    events: [
      { day: 7, msg: '第一次紅隊測試完成（通過率 93%）' },
      { day: 14, msg: '第二次紅隊測試完成（通過率 91%）' },
      { day: 21, msg: '第三次紅隊測試完成（通過率 95%）' },
    ],
  };

  /* ============================================================
   *  5. 合規性監控 (Compliance)
   * ============================================================ */
  var compliance = {
    title: '合規性監控',
    subtitle: 'Compliance Monitoring',
    color: '#0d9488',
    bgColor: '#f0fdfa',
    icon: 'clipboard',
    score: 0,
    status: '',
    summary: '測量系統是否遵循相關法律、規範與內部政策。',
    metrics: [
      {
        name: '合規檢查通過率',
        unit: '%',
        target: 100,
        threshold: 95,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            pts.push({ day: i + 1, value: i < 18 ? 100 : randInt(96, 100) });
          }
          return pts;
        })(),
      },
      {
        name: '個資存取異常',
        unit: '次/日',
        target: 0,
        threshold: 3,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            pts.push({ day: i + 1, value: randInt(0, 2) });
          }
          return pts;
        })(),
        lowerIsBetter: true,
      },
      {
        name: '審計軌跡完整性',
        unit: '%',
        target: 100,
        threshold: 99,
        series: timeSeries(DAYS, 99.9, 0.15, 0),
      },
    ],
    alerts: [
      { day: 19, level: 'warning', msg: '合規檢查項目「模型可解釋性報告」未在期限內提交' },
    ],
    events: [
      { day: 1, msg: '部署後合規 checklist 啟動' },
      { day: 10, msg: '內部稽核團隊現場審查' },
      { day: 20, msg: '監管機關例行查核通知' },
      { day: 30, msg: '月度合規報告產出' },
    ],
  };

  /* ============================================================
   *  6. 大規模影響監控 (Broad Impact)
   * ============================================================ */
  var broadImpact = {
    title: '大規模影響監控',
    subtitle: 'Broad Impact Monitoring',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    icon: 'globe',
    score: 0,
    status: '',
    summary: '評估 AI 決策的廣泛下游影響——公平性、社會效應與系統性風險。',
    metrics: [
      {
        name: '族群公平性指標 (DI Ratio)',
        unit: '',
        target: 1.0,
        threshold: 0.8,
        series: (function () {
          var s = timeSeries(DAYS, 92, 1.5, -0.05);
          return s.map(function (p) { return { day: p.day, value: Math.round(p.value / 100 * 100) / 100 }; });
        })(),
      },
      {
        name: '拒絕率差異 (Denial Gap)',
        unit: '%',
        target: 0,
        threshold: 5,
        series: timeSeries(DAYS, 2.5, 1, 0.05),
        lowerIsBetter: true,
      },
      {
        name: '申訴案件數',
        unit: '件/週',
        target: null,
        threshold: 10,
        series: (function () {
          var pts = [];
          for (var i = 0; i < DAYS; i++) {
            if (i % 7 === 6) {
              pts.push({ day: i + 1, value: randInt(2, 9) });
            } else {
              pts.push({ day: i + 1, value: null });
            }
          }
          return pts;
        })(),
        lowerIsBetter: true,
      },
    ],
    alerts: [
      { day: 22, level: 'warning', msg: '30 歲以下申請者拒絕率較整體高 4.2%，接近 5% 閾值' },
    ],
    events: [
      { day: 7, msg: '公平性月度報告（第 1 週快照）' },
      { day: 14, msg: '公平性月度報告（第 2 週快照）' },
      { day: 28, msg: '社會影響評估報告產出' },
    ],
  };

  /* ============================================================
   *  計算各維度綜合分數
   * ============================================================ */
  function calcScore(dim) {
    var total = 0, count = 0;
    dim.metrics.forEach(function (m) {
      if (m.target == null) return;
      var last = null;
      for (var i = m.series.length - 1; i >= 0; i--) {
        if (m.series[i].value != null) { last = m.series[i].value; break; }
      }
      if (last == null) return;
      var pct;
      if (m.lowerIsBetter) {
        pct = m.threshold === 0 ? (last === 0 ? 100 : Math.max(0, 100 - last * 100)) : Math.max(0, (1 - last / m.threshold) * 100);
        pct = clamp(pct, 0, 100);
      } else {
        pct = clamp(last / m.target * 100, 0, 100);
      }
      total += pct;
      count++;
    });
    return count > 0 ? Math.round(total / count) : 0;
  }

  var dims = [functional, operational, humanFactors, security, compliance, broadImpact];
  dims.forEach(function (d) {
    d.score = calcScore(d);
    d.status = d.score >= 90 ? 'healthy' : d.score >= 75 ? 'warning' : 'critical';
  });

  /* ============================================================
   *  Public API
   * ============================================================ */
  return {
    labels: labels,
    days: DAYS,
    dimensions: dims,
    systemInfo: {
      name: 'AI 信用評分模型 v2.3',
      deployDate: '2026-02-12',
      owner: '風險管理部 / AI CoE',
      environment: 'Production (Asia-Pacific)',
      model: 'XGBoost + LLM 後處理',
    },
  };
})();
