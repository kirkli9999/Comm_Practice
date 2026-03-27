/**
 * 情緒標籤平台 - Emotion Tagging Platform
 * Rule-based NLP for Traditional Chinese text emotion analysis
 */

// ─── Emotion Definitions ───────────────────────────────────────────────────

var EMOTIONS = {
  joy:          { label: '喜悅',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '😊' },
  trust:        { label: '信任',  color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: '🤝' },
  anticipation: { label: '期待',  color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: '✨' },
  surprise:     { label: '驚訝',  color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc', icon: '😮' },
  anger:        { label: '憤怒',  color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '😠' },
  disgust:      { label: '厭惡',  color: '#84cc16', bg: '#f7fee7', border: '#d9f99d', icon: '😤' },
  fear:         { label: '恐懼',  color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: '😨' },
  sadness:      { label: '悲傷',  color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: '😢' },
  anxiety:      { label: '焦慮',  color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff', icon: '😰' },
  neutral:      { label: '中性',  color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', icon: '😐' },
};

// ─── Keyword Dictionary ─────────────────────────────────────────────────────

var EMOTION_KEYWORDS = {
  joy: [
    '開心','快樂','高興','喜悅','興奮','歡喜','愉快','幸福','感謝','感激',
    '欣慰','滿足','自豪','驕傲','喜歡','愛','棒','太好了','讚','完美',
    '順利','成功','好棒','很好','真好','不錯','美好','可愛','有趣','歡樂',
    '笑','笑容','微笑','喜','樂','福','享受','喜悅','值得','感動',
    '超棒','超讚','很讚','很棒','太棒','棒棒','好好','好極了','完美',
    '哈哈','哈','嘻嘻','太開心','非常開心','十分開心','超開心',
  ],
  trust: [
    '信任','信賴','相信','放心','依靠','支持','理解','同理','尊重',
    '謝謝','感謝','可靠','安心','穩定','踏實','誠信','誠實','真誠',
    '合作','一起','共同','溝通','協助','幫忙','幫助','依賴','保證',
    '承諾','答應','守信','負責','可以信賴','相互信任','信心',
  ],
  anticipation: [
    '期待','希望','盼望','渴望','想要','期望','夢想','憧憬','想像',
    '努力','加油','拼','努力中','準備','規劃','計畫','即將','快要',
    '將會','未來','目標','方向','理想','志向','前景','展望','嚮往',
    '很期待','非常期待','超期待','好期待','令人期待','迫不及待',
  ],
  surprise: [
    '驚訝','驚喜','意外','沒想到','出乎意料','震驚','不可思議',
    '哇','天啊','不敢相信','太厲害','竟然','居然','沒料到','真的假的',
    '太神奇','好神','好厲害','嚇到','詫異','訝異','驚奇','驚呆',
    '哇塞','哇靠','太意外','真沒想到','怎麼可能','難以置信',
  ],
  anger: [
    '憤怒','生氣','氣憤','惱怒','火大','煩','煩躁','討厭','不爽',
    '抓狂','失望','憤恨','怒火','發火','憤慨','不滿','暴怒','氣死',
    '氣到','氣炸','激怒','惱火','煩死','煩透了','受夠了','太過分',
    '沒道理','不公平','太氣','很氣','非常氣','超氣','極度不滿',
    '胡鬧','亂來','為什麼','憑什麼','怒','怒不可遏',
  ],
  disgust: [
    '厭惡','噁心','反感','排斥','嫌棄','不想','不願意','嫌','鄙視',
    '不屑','無聊','沒意思','無意義','無語','傻眼','白眼','滾',
    '噁','爛','糟糕','很爛','很差','不好','差勁','差',
    '令人反感','讓人噁心','讓人厭惡','噁心死了','真的很爛',
  ],
  fear: [
    '害怕','恐懼','恐慌','擔心','憂慮','憂心','不安','惶恐',
    '戰戰兢兢','緊張','驚嚇','可怕','嚇到','心跳加速','發抖',
    '顫抖','怕','很怕','非常怕','超怕','極度恐懼','不敢',
    '怎麼辦','完了','糟了','沒救了','絕望','走投無路',
    '恐怖','嚇人','毛骨悚然','心寒','膽怯','畏懼',
  ],
  sadness: [
    '難過','悲傷','傷心','哭泣','悲哀','痛苦','沮喪','低落',
    '心碎','遺憾','後悔','哀痛','傷痛','憂傷','失落','消沉',
    '哭','落淚','流淚','眼淚','心痛','難受','很難過','十分難過',
    '超難過','好難過','傷透心','心好痛','痛心','悲慟','哀傷',
    '不開心','不快樂','鬱悶','哀怨','悲嘆','惋惜','可惜',
  ],
  anxiety: [
    '焦慮','緊張','壓力','壓力大','不安','徬徨','迷茫','迷惘',
    '猶豫','不知所措','忐忑','七上八下','心神不寧','坐立難安',
    '擔憂','憂心忡忡','惶惶不安','茫然','慌亂','慌張','手足無措',
    '糾結','矛盾','兩難','進退兩難','無所適從','不確定','搞不定',
  ],
};

// ─── Core Analysis Functions ─────────────────────────────────────────────────

function etSplitSentences(text) {
  // Split on Chinese/English punctuation and newlines
  var parts = text.split(/[。！？\n!?]+/).map(function(s){ return s.trim(); });
  return parts.filter(function(s){ return s.length >= 2; });
}

function etScoreSentence(sentence) {
  var scores = {};
  Object.keys(EMOTION_KEYWORDS).forEach(function(emo) {
    var score = 0;
    EMOTION_KEYWORDS[emo].forEach(function(kw) {
      if (sentence.indexOf(kw) !== -1) {
        // Longer keywords get higher weight
        score += kw.length >= 4 ? 3 : kw.length >= 2 ? 2 : 1;
      }
    });
    scores[emo] = score;
  });
  return scores;
}

function etGetTopEmotion(scores) {
  var top = 'neutral';
  var max = 0;
  Object.keys(scores).forEach(function(emo) {
    if (scores[emo] > max) {
      max = scores[emo];
      top = emo;
    }
  });
  return { emotion: top, score: max };
}

function etGetTop2Emotions(scores) {
  var sorted = Object.keys(scores)
    .filter(function(k){ return scores[k] > 0; })
    .sort(function(a,b){ return scores[b] - scores[a]; });
  return sorted.slice(0, 2);
}

function etAnalyzeText(text) {
  var sentences = etSplitSentences(text);
  if (sentences.length === 0) return null;

  var results = [];
  var totalScores = {};
  Object.keys(EMOTION_KEYWORDS).forEach(function(e){ totalScores[e] = 0; });

  sentences.forEach(function(sentence) {
    var scores = etScoreSentence(sentence);
    var top = etGetTopEmotion(scores);
    var secondary = etGetTop2Emotions(scores).filter(function(e){ return e !== top.emotion; })[0] || null;

    // Accumulate global scores
    Object.keys(scores).forEach(function(e){
      totalScores[e] += scores[e];
    });

    results.push({
      text: sentence,
      emotion: top.emotion,
      score: top.score,
      secondary: secondary,
      scores: scores,
    });
  });

  // Overall distribution (count by primary emotion)
  var distribution = {};
  Object.keys(EMOTIONS).forEach(function(e){ distribution[e] = 0; });
  results.forEach(function(r){ distribution[r.emotion]++; });

  // Dominant emotion overall
  var dominant = etGetTopEmotion(totalScores);

  return {
    sentences: results,
    distribution: distribution,
    dominant: dominant.emotion,
    totalSentences: results.length,
  };
}

// ─── Render Helpers ──────────────────────────────────────────────────────────

function etEmotionPill(emoKey, small) {
  var e = EMOTIONS[emoKey];
  var size = small ? 'font-size:0.65rem;padding:0.1rem 0.45rem;' : 'font-size:0.7rem;padding:0.15rem 0.55rem;';
  return '<span class="et-pill" style="background:' + e.bg + ';color:' + e.color + ';border:1px solid ' + e.border + ';' + size + '">'
    + e.icon + ' ' + e.label + '</span>';
}

function etRenderDistribution(distribution, total) {
  var keys = Object.keys(EMOTIONS).filter(function(k){ return distribution[k] > 0; });
  keys.sort(function(a,b){ return distribution[b] - distribution[a]; });

  if (keys.length === 0) return '<p style="color:var(--slate-400);font-size:0.8rem">無情緒數據</p>';

  return keys.map(function(k) {
    var e = EMOTIONS[k];
    var pct = total > 0 ? Math.round((distribution[k] / total) * 100) : 0;
    return '<div class="et-dist-row">'
      + '<span class="et-dist-label">' + e.icon + ' ' + e.label + '</span>'
      + '<div class="et-dist-bar-wrap">'
      + '<div class="et-dist-bar" style="width:' + pct + '%;background:' + e.color + '"></div>'
      + '</div>'
      + '<span class="et-dist-pct">' + distribution[k] + '句 <span style="color:var(--slate-400)">(' + pct + '%)</span></span>'
      + '</div>';
  }).join('');
}

function etRenderSentences(sentences) {
  return sentences.map(function(s, i) {
    var e = EMOTIONS[s.emotion];
    return '<div class="et-sentence-row" style="border-left:3px solid ' + e.color + ';background:' + e.bg + '">'
      + '<div class="et-sentence-meta">'
      + '<span class="et-sentence-num">' + (i + 1) + '</span>'
      + etEmotionPill(s.emotion, true)
      + (s.secondary ? etEmotionPill(s.secondary, true) : '')
      + '</div>'
      + '<p class="et-sentence-text">' + etEscapeHtml(s.text) + '</p>'
      + '</div>';
  }).join('');
}

function etEscapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── UI State ────────────────────────────────────────────────────────────────

var etState = {
  result: null,
};

function etInit() {
  var analyzeBtn = document.getElementById('etAnalyzeBtn');
  var clearBtn   = document.getElementById('etClearBtn');
  var uploadBtn  = document.getElementById('etUploadBtn');
  var fileInput  = document.getElementById('etFileInput');
  var textarea   = document.getElementById('etInput');
  var charCount  = document.getElementById('etCharCount');

  textarea.addEventListener('input', function() {
    charCount.textContent = textarea.value.length + ' 字';
  });

  uploadBtn.addEventListener('click', function() { fileInput.click(); });

  fileInput.addEventListener('change', function() {
    var file = fileInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      textarea.value = e.target.result;
      charCount.textContent = textarea.value.length + ' 字';
    };
    reader.readAsText(file, 'UTF-8');
    fileInput.value = '';
  });

  clearBtn.addEventListener('click', function() {
    textarea.value = '';
    charCount.textContent = '0 字';
    document.getElementById('etResults').style.display = 'none';
    document.getElementById('etPlaceholder').style.display = 'flex';
  });

  analyzeBtn.addEventListener('click', function() {
    var text = textarea.value.trim();
    if (!text) {
      etShowError('請先輸入或上傳文字內容');
      return;
    }
    if (text.length < 10) {
      etShowError('文字內容太短，請輸入至少 10 個字');
      return;
    }
    etRunAnalysis(text);
  });

  document.getElementById('etDemoBtn').addEventListener('click', function() {
    textarea.value = EMOTION_DEMO_TEXT;
    charCount.textContent = textarea.value.length + ' 字';
  });

  document.getElementById('etCopyBtn') && document.getElementById('etCopyBtn').addEventListener('click', etCopyResults);
}

function etRunAnalysis(text) {
  var btn = document.getElementById('etAnalyzeBtn');
  btn.disabled = true;
  btn.textContent = '分析中…';

  // Simulate async processing
  setTimeout(function() {
    var result = etAnalyzeText(text);
    etState.result = result;
    etRenderResults(result);
    btn.disabled = false;
    btn.textContent = '分析情緒';
  }, 400);
}

function etRenderResults(result) {
  document.getElementById('etPlaceholder').style.display = 'none';
  var panel = document.getElementById('etResults');
  panel.style.display = 'block';

  // Summary
  var dominant = EMOTIONS[result.dominant];
  document.getElementById('etDominantIcon').textContent = dominant.icon;
  document.getElementById('etDominantLabel').textContent = dominant.label;
  document.getElementById('etDominantLabel').style.color = dominant.color;
  document.getElementById('etSentenceCount').textContent = result.totalSentences + ' 個句子';

  // Distribution
  document.getElementById('etDistribution').innerHTML = etRenderDistribution(result.distribution, result.totalSentences);

  // Sentences
  document.getElementById('etSentenceList').innerHTML = etRenderSentences(result.sentences);

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function etShowError(msg) {
  var el = document.getElementById('etError');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(function(){ el.style.display = 'none'; }, 3000);
}

function etCopyResults() {
  if (!etState.result) return;
  var lines = ['情緒分析結果', '═══════════════', ''];
  lines.push('主要情緒：' + EMOTIONS[etState.result.dominant].label);
  lines.push('分析句數：' + etState.result.totalSentences + ' 句');
  lines.push('');
  lines.push('情緒分佈：');
  Object.keys(etState.result.distribution).forEach(function(k) {
    if (etState.result.distribution[k] > 0) {
      lines.push('  ' + EMOTIONS[k].label + '：' + etState.result.distribution[k] + ' 句');
    }
  });
  lines.push('');
  lines.push('逐句分析：');
  etState.result.sentences.forEach(function(s, i) {
    lines.push((i+1) + '. [' + EMOTIONS[s.emotion].label + '] ' + s.text);
  });

  var text = lines.join('\n');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      var btn = document.getElementById('etCopyBtn');
      var orig = btn.textContent;
      btn.textContent = '已複製！';
      setTimeout(function(){ btn.textContent = orig; }, 2000);
    });
  }
}

// ─── Demo Text ───────────────────────────────────────────────────────────────

var EMOTION_DEMO_TEXT = '今天真的太開心了，終於完成了這個重要的專案！\n' +
  '整個過程真的很辛苦，有幾次差點就放棄了。\n' +
  '我非常感謝團隊的支持與配合，大家都很努力。\n' +
  '但我對於某些部門的配合度感到非常失望，\n' +
  '這種不負責任的態度讓我很生氣。\n' +
  '現在看到最終的成果，所有的辛苦都值得了！\n' +
  '未來我期待繼續和大家合作，一起創造更好的成果。\n' +
  '不過我也擔心接下來的市場競爭壓力越來越大，\n' +
  '不知道我們能不能撐過去。\n' +
  '無論如何，今天先好好慶祝一番！';

// ─── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', etInit);
