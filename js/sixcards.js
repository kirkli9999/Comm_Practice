/**
 * 溝通氣場實踐工具 - 核心邏輯
 * Six Cards Communication Tool - Core Logic
 */

// State management
var sixcardsState = {
  inputText: '',
  audience: 'chairman',
  goal: 'resources',
  activeVersion: 'profit',
  versions: { profit: [], risk: [], talent: [] },
  generated: false,
  practiceMode: false,
  practiceIndex: 0,
};

// --- Text Processing (Mock AI) ---

function scRemoveFillerWords(text) {
  var fillers = SIXCARDS_DATA.fillerWords;
  var result = text;
  fillers.forEach(function (w) {
    var re = new RegExp(w + '[，、。]?\\s*', 'g');
    result = result.replace(re, '');
  });
  result = result.replace(/[，、]{2,}/g, '，');
  result = result.replace(/^\s*[，、。]\s*/gm, '');
  return result.trim();
}

function scSplitIntoSentences(text) {
  var raw = text.split(/[。！？；\n]+/).map(function (s) { return s.trim(); });
  return raw.filter(function (s) { return s.length > 0; });
}

function scDistributeIntoSixGroups(sentences) {
  var groups = [[], [], [], [], [], []];

  if (sentences.length === 0) return groups.map(function () { return ''; });

  if (sentences.length <= 6) {
    for (var i = 0; i < 6; i++) {
      groups[i] = sentences[i] || sentences[i % sentences.length];
    }
  } else {
    var perGroup = Math.ceil(sentences.length / 6);
    for (var j = 0; j < sentences.length; j++) {
      var gIdx = Math.min(Math.floor(j / perGroup), 5);
      groups[gIdx].push(sentences[j]);
    }
  }

  return groups.map(function (g) {
    if (Array.isArray(g)) return g.join('，');
    return g;
  });
}

function scApplyTone(chunk, versionType) {
  var vType = SIXCARDS_DATA.versionTypes.find(function (v) { return v.id === versionType; });
  if (!vType || !chunk) return chunk;
  return chunk;
}

function scGenerateSixCards(rawText, audience, goal) {
  var cleaned = scRemoveFillerWords(rawText);
  var sentences = scSplitIntoSentences(cleaned);
  var chunks = scDistributeIntoSixGroups(sentences);

  var versions = {};
  SIXCARDS_DATA.versionTypes.forEach(function (vType) {
    versions[vType.id] = chunks.map(function (c) {
      return scApplyTone(c, vType.id);
    });
  });

  return versions;
}

// --- Rendering ---

function scRenderVersionBar() {
  var bar = document.getElementById('sixcardsVersionBar');
  if (!bar) return;

  bar.style.display = '';
  bar.innerHTML = SIXCARDS_DATA.versionTypes.map(function (v) {
    var activeClass = sixcardsState.activeVersion === v.id ? ' active' : '';
    return '<button class="sixcards-version-btn' + activeClass + '" data-version="' + v.id + '">' +
      v.label + '</button>';
  }).join('');

  bar.querySelectorAll('.sixcards-version-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sixcardsState.activeVersion = btn.dataset.version;
      scExitPracticeMode();
      scRenderVersionBar();
      scRenderBoard();
    });
  });
}

function scRenderBoard() {
  var board = document.getElementById('sixcardsBoard');
  if (!board) return;

  var cards = sixcardsState.versions[sixcardsState.activeVersion];
  if (!cards || cards.length === 0) {
    board.style.display = 'none';
    return;
  }

  board.style.display = '';
  board.innerHTML = cards.map(function (text, idx) {
    var cardClass = 'sixcards-card';
    if (sixcardsState.practiceMode) {
      if (idx < sixcardsState.practiceIndex) {
        cardClass += ' practiced';
      } else if (idx === sixcardsState.practiceIndex) {
        cardClass += ' active practice-clickable';
      }
    }

    return '<div class="' + cardClass + '" data-index="' + idx + '">' +
      '<div class="sixcards-card-header">' +
        '<span class="sixcards-card-number">' + (idx + 1) + '</span>' +
        '<span class="sixcards-card-label">觀點 ' + (idx + 1) + '</span>' +
      '</div>' +
      '<div class="sixcards-card-text">' + text + '</div>' +
    '</div>';
  }).join('');

  if (sixcardsState.practiceMode) {
    board.querySelectorAll('.sixcards-card.practice-clickable').forEach(function (card) {
      card.addEventListener('click', function () {
        scAdvancePractice();
      });
    });
  }
}

function scShowActions() {
  var actions = document.getElementById('sixcardsActions');
  if (actions) actions.style.display = '';
}

function scUpdatePracticeButton() {
  var btn = document.getElementById('sixcardsPractice');
  if (!btn) return;

  if (sixcardsState.practiceMode) {
    btn.textContent = '結束練習';
    btn.classList.add('stop');
  } else {
    btn.textContent = '開始練習模式';
    btn.classList.remove('stop');
  }
}

function scUpdatePracticeStatus() {
  var status = document.getElementById('sixcardsPracticeStatus');
  if (!status) return;

  if (!sixcardsState.practiceMode) {
    status.style.display = 'none';
    return;
  }

  status.style.display = '';
  if (sixcardsState.practiceIndex >= 6) {
    status.innerHTML = '<span class="practice-complete">練習完成！六張紙片全部講完。點擊「結束練習」可重新開始。</span>';
  } else {
    status.innerHTML = '目前進度：第 <strong>' + (sixcardsState.practiceIndex + 1) +
      '</strong> / 6 張 — 點擊高亮卡片表示「講完這個觀點」，練習停頓後再講下一張';
  }
}

// --- Practice Mode ---

function scStartPracticeMode() {
  sixcardsState.practiceMode = true;
  sixcardsState.practiceIndex = 0;
  scRenderBoard();
  scUpdatePracticeButton();
  scUpdatePracticeStatus();
}

function scExitPracticeMode() {
  sixcardsState.practiceMode = false;
  sixcardsState.practiceIndex = 0;
  scRenderBoard();
  scUpdatePracticeButton();
  scUpdatePracticeStatus();
}

function scAdvancePractice() {
  sixcardsState.practiceIndex++;
  scRenderBoard();
  scUpdatePracticeStatus();
}

// --- Initialization ---

function initSixCards() {
  // Generate button
  var genBtn = document.getElementById('sixcardsGenerate');
  if (genBtn) {
    genBtn.addEventListener('click', function () {
      var input = document.getElementById('sixcardsInput');
      var rawText = input ? input.value.trim() : '';

      if (rawText.length < 20) {
        alert('請輸入至少 20 個字的內容');
        return;
      }

      var audience = document.getElementById('sixcardsAudience').value;
      var goal = document.getElementById('sixcardsGoal').value;

      sixcardsState.inputText = rawText;
      sixcardsState.audience = audience;
      sixcardsState.goal = goal;
      sixcardsState.activeVersion = 'profit';
      sixcardsState.practiceMode = false;
      sixcardsState.practiceIndex = 0;

      if (rawText === SIXCARDS_DATA.sampleInput) {
        sixcardsState.versions = {
          profit: SIXCARDS_DATA.sampleOutput.profit.slice(),
          risk: SIXCARDS_DATA.sampleOutput.risk.slice(),
          talent: SIXCARDS_DATA.sampleOutput.talent.slice(),
        };
      } else {
        sixcardsState.versions = scGenerateSixCards(rawText, audience, goal);
      }

      sixcardsState.generated = true;
      scRenderVersionBar();
      scRenderBoard();
      scShowActions();
      scUpdatePracticeButton();
      scUpdatePracticeStatus();
    });
  }

  // Demo button
  var demoBtn = document.getElementById('sixcardsDemo');
  if (demoBtn) {
    demoBtn.addEventListener('click', function () {
      var input = document.getElementById('sixcardsInput');
      if (input) input.value = SIXCARDS_DATA.sampleInput;
    });
  }

  // Practice button
  var practiceBtn = document.getElementById('sixcardsPractice');
  if (practiceBtn) {
    practiceBtn.addEventListener('click', function () {
      if (sixcardsState.practiceMode) {
        scExitPracticeMode();
      } else {
        scStartPracticeMode();
      }
    });
  }

  // PDF button
  var pdfBtn = document.getElementById('sixcardsPdf');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', function () {
      if (typeof generateSixCardsPDF === 'function') {
        var cards = sixcardsState.versions[sixcardsState.activeVersion];
        var audienceLabel = '';
        var goalLabel = '';
        SIXCARDS_DATA.audiences.forEach(function (a) {
          if (a.id === sixcardsState.audience) audienceLabel = a.label;
        });
        SIXCARDS_DATA.goals.forEach(function (g) {
          if (g.id === sixcardsState.goal) goalLabel = g.label;
        });
        var versionLabel = '';
        SIXCARDS_DATA.versionTypes.forEach(function (v) {
          if (v.id === sixcardsState.activeVersion) versionLabel = v.label;
        });
        generateSixCardsPDF(cards, audienceLabel, goalLabel, versionLabel);
      }
    });
  }
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSixCards);
} else {
  initSixCards();
}
