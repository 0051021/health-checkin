/* ============================================================
 * app.js —— 主逻辑：路由 + 各页面渲染 + 交互
 * ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var TITLES = { home: '今日', workout: '运动打卡', body: '身体数据', habit: '打卡中心', mine: '我的' };
  var currentPage = 'home';

  /* ---------- 轻提示 ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1900);
  }

  /* ---------- 路由 ---------- */
  function go(page) {
    currentPage = page;
    $$('.page').forEach(function (p) { p.classList.remove('active'); });
    var el = $('#page-' + page);
    if (el) el.classList.add('active');
    $$('.tab').forEach(function (b) { b.classList.toggle('active', b.dataset.page === page); });
    $('#pageTitle').textContent = TITLES[page] || '';
    window.scrollTo(0, 0);
    render(page);
  }

  function render(page) {
    switch (page) {
      case 'home': renderHome(); break;
      case 'workout': renderWorkout(); break;
      case 'body': if (App.renderBody) App.renderBody(); break;
      case 'habit': if (App.renderHabit) App.renderHabit(); break;
      case 'mine': if (App.renderMine) App.renderMine(); break;
    }
  }
  function refresh() { render(currentPage); }

  /* ---------- 通用：连续天数 & 当日是否有记录 ---------- */
  function dateStr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function hasAnyLog(date) {
    var d = Store.load();
    return d.workoutLogs.some(function (x) { return x.date === date; }) ||
      d.bodyLogs.some(function (x) { return x.date === date; }) ||
      d.habitLogs.some(function (x) { return x.date === date && Object.values(x.checks || {}).some(Boolean); }) ||
      d.financeLogs.some(function (x) { return x.date === date; });
  }
  function calcStreak() {
    var cursor = new Date();
    // 今天没打卡则从昨天起算
    if (!hasAnyLog(dateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
    var count = 0;
    for (var i = 0; i < 400; i++) {
      if (hasAnyLog(dateStr(cursor))) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return count;
  }
  function todayKcal() {
    var d = Store.load();
    return d.workoutLogs.filter(function (x) { return x.date === Store.today(); })
      .reduce(function (s, x) { return s + (x.estimatedKcal || 0); }, 0);
  }
  function todayHabitCount() {
    var d = Store.load();
    var rec = d.habitLogs.find(function (x) { return x.date === Store.today(); });
    if (!rec) return 0;
    return Object.values(rec.checks || {}).filter(Boolean).length;
  }

  /* ============================================================
   * 页面 1：今日（首页）
   * ============================================================ */
  function renderHome() {
    var d = Store.load();
    var streak = calcStreak();
    var kcal = todayKcal();
    var habitCnt = todayHabitCount();
    var habitTotal = d.habitDefs.length;
    var pct = habitTotal ? Math.round(habitCnt / habitTotal * 100) : 0;
    var ring = ringSVG(pct);

    var lastBody = d.bodyLogs.length ? d.bodyLogs[d.bodyLogs.length - 1] : null;
    var bodyLine = lastBody
      ? ('最近 ' + lastBody.date + ' · 体重 ' + lastBody.weightKg + 'kg · 腰臀比 ' + (lastBody.whr || '—'))
      : '还没有记录，去「身体」页记第一次吧';

    $('#page-home').innerHTML =
      '<div class="hero">' +
        '<div class="hi">Hi，继续保持 💪</div>' +
        '<div class="goal">' + esc(d.profile.target) + '</div>' +
        '<div class="hero-stats">' +
          '<div class="hero-stat"><div class="v">' + streak + '</div><div class="l">连续天数</div></div>' +
          '<div class="hero-stat"><div class="v">' + kcal + '</div><div class="l">今日消耗 kcal</div></div>' +
          '<div class="hero-stat"><div class="v">' + habitCnt + '/' + habitTotal + '</div><div class="l">今日打卡</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<h2><span class="dot"></span>今日进度</h2>' +
        '<div class="ring-wrap">' + ring +
          '<div class="ring-info"><div class="big">' + pct + '%</div><div class="lbl">习惯打卡完成度</div>' +
          '<div class="lbl" style="margin-top:6px;color:var(--muted)">' + esc(bodyLine) + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<h2><span class="dot"></span>快捷入口</h2>' +
        '<div class="quick">' +
          '<div class="quick-item" data-go="workout"><div class="ic">🏋️</div><div class="t">运动打卡</div><div class="d">选动作·算消耗</div></div>' +
          '<div class="quick-item" data-go="body"><div class="ic">📊</div><div class="t">身体数据</div><div class="d">体重·腰臀比</div></div>' +
          '<div class="quick-item" data-go="habit"><div class="ic">✅</div><div class="t">日常打卡</div><div class="d">护肤·习惯·记账</div></div>' +
          '<div class="quick-item" data-go="calendar"><div class="ic">📅</div><div class="t">日历统计</div><div class="d">看坚持的痕迹</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="background:var(--amber-soft);box-shadow:none">' +
        '<div style="font-size:12px;color:#8a6a35;line-height:1.6">💾 <b>记得备份：</b>数据只存本机，卸载或清缓存会丢失。去「我的 → 导出数据」保存一份。</div>' +
      '</div>';

    $$('#page-home .quick-item').forEach(function (it) {
      it.addEventListener('click', function () {
        var g = it.dataset.go;
        if (g === 'calendar') {
          go('mine');
          setTimeout(function () { if (window.showCalendarSheet) window.showCalendarSheet(); }, 60);
        } else {
          go(g);
        }
      });
    });
  }

  function ringSVG(pct) {
    var r = 30, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return '<svg class="ring" viewBox="0 0 76 76">' +
      '<circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#eee" stroke-width="8"/>' +
      '<circle cx="38" cy="38" r="' + r + '" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round" ' +
        'stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 38 38)"/>' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8b6fc4"/><stop offset="1" stop-color="#3fb59b"/></linearGradient></defs>' +
      '</svg>';
  }

  /* ============================================================
   * 弹层通用
   * ============================================================ */
  function openSheet(title, html, onClose) {
    var root = $('#modalRoot');
    root.innerHTML = '<div class="mask"><div class="sheet">' +
      '<div class="sheet-head"><div class="t">' + esc(title) + '</div><div class="x" id="sheetClose">×</div></div>' +
      '<div id="sheetBody">' + html + '</div></div></div>';
    function dismiss() { closeSheet(); if (onClose) onClose(); }
    $('.mask').addEventListener('click', function (e) { if (e.target.classList.contains('mask')) dismiss(); });
    $('#sheetClose').addEventListener('click', dismiss);
  }
  function closeSheet() { $('#modalRoot').innerHTML = ''; }
  function sheetBody() { return $('#sheetBody'); }

  /* ============================================================
   * 页面 2：运动打卡
   * ============================================================ */
  var workoutDraft = { items: [] };  // 当前这次训练的选择

  function renderWorkout() {
    var d = Store.load();
    var items = workoutDraft.items;
    var summary = Lib.calcWorkout(items, d.profile.weightKg);

    var pickedHTML = items.length ? items.map(function (it, i) {
      return '<div class="picked">' +
        '<div class="row1"><div class="nm">' + esc(it.name) + '</div><span class="del" data-del="' + i + '">删除</span></div>' +
        '<div class="inputs">' +
          '<div class="mini"><label>组数</label><input type="number" min="0" value="' + it.sets + '" data-i="' + i + '" data-f="sets"></div>' +
          '<div class="mini"><label>次数/组</label><input type="number" min="0" value="' + it.reps + '" data-i="' + i + '" data-f="reps"></div>' +
          '<div class="mini"><label>重量kg</label><input type="number" min="0" step="0.5" value="' + it.weight + '" data-i="' + i + '" data-f="weight"></div>' +
          '<div class="mini"><label>时长min</label><input type="number" min="0" value="' + it.minutes + '" data-i="' + i + '" data-f="minutes"></div>' +
        '</div></div>';
    }).join('') : '<div class="empty-state"><div class="ic">🏋️</div><div class="t">还没选动作，点下面按钮开始</div></div>';

    var reportHTML = items.length ?
      '<div class="report">' +
        '<div><span class="big-kcal">' + summary.estimatedKcal + '</span> <span class="unit">kcal 估算消耗 · 共 ' + summary.totalMinutes + ' 分钟</span></div>' +
        summary.partPct.map(function (p) {
          return '<div class="bar-row"><span class="bn">' + esc(p.part) + '</span>' +
            '<div class="bar-track"><div class="bar-fill" style="width:' + p.pct + '%"></div></div>' +
            '<span class="bp">' + p.pct + '%</span></div>';
        }).join('') +
        '<div class="disclaimer">' + esc(d.settings.kcalDisclaimer) + '</div>' +
      '</div>' : '';

    var history = d.workoutLogs.slice().reverse().slice(0, 8);
    var historyHTML = history.length ? history.map(function (l) {
      var parts = Object.keys(l.partsHit || {}).join('·');
      return '<div class="log-item"><div class="log-top"><span class="log-date">' + esc(l.date) + ' ' + esc(l.startTime || '') + '</span>' +
        '<span class="log-val">' + l.estimatedKcal + ' kcal</span></div>' +
        '<div class="log-sub">' + (l.items ? l.items.length : 0) + ' 个动作 · ' + l.totalMinutes + ' 分钟 · ' + esc(parts || '—') + '</div></div>';
    }).join('') : '<div class="empty-state"><div class="t">暂无运动记录</div></div>';

    $('#page-workout').innerHTML =
      '<div class="card">' +
        '<h2><span class="dot"></span>本次训练</h2>' +
        '<p class="desc" style="font-size:12.5px;color:var(--muted);margin-bottom:12px">按部位选动作，时长会自动估算，可手动改。</p>' +
        pickedHTML +
        '<div class="ex-add" id="addEx">+ 添加动作</div>' +
      '</div>' +
      (items.length ? '<div class="card"><h2><span class="dot"></span>本次报告</h2>' + reportHTML +
        '<div class="btn-row" style="margin-top:14px">' +
          '<button class="btn btn-ghost btn-sm" id="clearDraft" style="flex:1">清空</button>' +
          '<button class="btn btn-primary btn-sm" id="saveWorkout" style="flex:2">保存记录</button>' +
        '</div></div>' : '') +
      '<div class="card"><h2><span class="dot"></span>最近运动</h2>' + historyHTML + '</div>';

    $('#addEx').addEventListener('click', openExercisePicker);
    $$('#page-workout [data-del]').forEach(function (b) {
      b.addEventListener('click', function () { workoutDraft.items.splice(Number(b.dataset.del), 1); refresh(); });
    });
    $$('#page-workout .inputs input').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var i = Number(inp.dataset.i), f = inp.dataset.f;
        workoutDraft.items[i][f] = Number(inp.value) || 0;
        refresh();
      });
    });
    var clear = $('#clearDraft'); if (clear) clear.addEventListener('click', function () { workoutDraft.items = []; refresh(); });
    var save = $('#saveWorkout'); if (save) save.addEventListener('click', saveWorkout);
  }

  function openExercisePicker() {
    var d = Store.load();
    var lib = Lib.enrich(d.exerciseLib);
    var state = { part: '全部', equip: '全部', kw: '' };

    function listHTML() {
      var arr = lib.filter(function (e) {
        var okPart = state.part === '全部' || e.parts.indexOf(state.part) >= 0;
        var okEquip = state.equip === '全部' || e.equipment === state.equip;
        var okKw = !state.kw || e.name.toLowerCase().indexOf(state.kw.toLowerCase()) >= 0;
        return okPart && okEquip && okKw;
      });
      if (!arr.length) return '<div class="empty-state"><div class="t">没有匹配动作，可到「我的」添加</div></div>';
      return arr.map(function (e) {
        return '<div class="ex-item">' +
          '<div class="ex-head"><div><div class="ex-name">' + esc(e.name) + '</div>' +
          '<div class="ex-meta">' + e.parts.map(function (p) { return '<span class="tag">' + esc(p) + '</span>'; }).join('') +
          '<span class="tag eq">' + esc(e.equipment) + '</span> · MET ' + e.met + '</div></div>' +
          '<span class="ex-detail" data-detail="' + esc(e.id) + '">发力详情 ›</span></div>' +
          '<div class="ex-cue">' + esc(e.cue) + '</div>' +
          '<div class="ex-actions"><div class="ex-add" data-pick="' + esc(e.id) + '">+ 加入本次</div></div>' +
        '</div>';
      }).join('');
    }

    var html =
      '<div class="field"><input class="input" id="exSearch" placeholder="🔍 搜动作名…"></div>' +
      '<div class="chips" id="partChips">' +
        ['全部'].concat(Lib.PARTS).map(function (p) { return '<div class="chip' + (p === '全部' ? ' active' : '') + '" data-part="' + esc(p) + '">' + esc(p) + '</div>'; }).join('') +
      '</div>' +
      '<div class="chips" id="equipChips">' +
        ['全部'].concat(Lib.EQUIPMENT).map(function (p) { return '<div class="chip' + (p === '全部' ? ' active' : '') + '" data-equip="' + esc(p) + '">' + esc(p) + '</div>'; }).join('') +
      '</div>' +
      '<div id="exList">' + listHTML() + '</div>';

    openSheet('选动作', html);

    function bindList() {
      $$('#exList [data-pick]').forEach(function (b) {
        b.addEventListener('click', function () {
          var e = lib.find(function (x) { return x.id === b.dataset.pick; });
          if (!e) return;
          var already = workoutDraft.items.some(function (it) { return it.id === e.id; });
          if (already) { toast('已在本次训练中'); return; }
          workoutDraft.items.push({
            id: e.id, name: e.name, met: e.met, parts: e.parts,
            sets: 3, reps: 12, weight: 0, minutes: 4
          });
          toast('已加入：' + e.name);
          closeSheet();
          refresh();
        });
      });
      $$('#exList [data-detail]').forEach(function (b) {
        b.addEventListener('click', function () {
          var e = lib.find(function (x) { return x.id === b.dataset.detail; });
          if (e) openExerciseDetail(e, openExercisePicker);
        });
      });
    }
    bindList();

    $('#exSearch').addEventListener('input', function (e) { state.kw = e.target.value; $('#exList').innerHTML = listHTML(); bindList(); });
    $$('#partChips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        $$('#partChips .chip').forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active'); state.part = c.dataset.part;
        $('#exList').innerHTML = listHTML(); bindList();
      });
    });
    $$('#equipChips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        $$('#equipChips .chip').forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active'); state.equip = c.dataset.equip;
        $('#exList').innerHTML = listHTML(); bindList();
      });
    });
  }

  // 动作详情：发力区域图 + 要领 + 常见错误 + 教程搜索
  function openExerciseDetail(e, back) {
    var nameMap = Lib.MUSCLE_NAMES;
    function tags(ids, cls) {
      return (ids || []).map(function (id) {
        return '<span class="ms-tag ' + cls + '">' + esc(nameMap[id] || id) + '</span>';
      }).join('') || '<span style="font-size:12px;color:var(--muted)">—</span>';
    }
    var q = encodeURIComponent(e.video || e.name);
    var html =
      '<div class="anat-wrap">' +
        (window.Anatomy ? Anatomy.render(e.muscles, e.synergists) + Anatomy.legend() : '<div class="empty-state"><div class="t">肌群图未加载</div></div>') +
      '</div>' +
      '<div class="muscle-line"><b>主发力：</b>' + tags(e.muscles, 'pri') + '</div>' +
      '<div class="muscle-line"><b>协同：</b>' + tags(e.synergists, 'sec') + '</div>' +
      '<div class="detail-sec"><h4>✅ 动作要领</h4><p>' + esc(e.cue || '—') + '</p></div>' +
      '<div class="detail-sec err"><h4>⚠️ 常见错误</h4><p>' + esc(e.error || '暂无') + '</p></div>' +
      '<div class="video-btns">' +
        '<a href="https://search.bilibili.com/all?keyword=' + q + '" target="_blank" rel="noopener">▶ B站看教程</a>' +
        '<a class="xhs" href="https://www.xiaohongshu.com/search_result?keyword=' + q + '" target="_blank" rel="noopener">▶ 小红书看教程</a>' +
      '</div>';
    openSheet(e.name, html, back);
  }

  function saveWorkout() {
    if (!workoutDraft.items.length) { toast('先选动作'); return; }
    var d = Store.load();
    var summary = Lib.calcWorkout(workoutDraft.items, d.profile.weightKg);
    var partsHit = {};
    workoutDraft.items.forEach(function (it) {
      (it.parts || []).forEach(function (p) { partsHit[p] = (partsHit[p] || 0) + 1; });
    });
    Store.update(function (x) {
      x.workoutLogs.push({
        date: Store.today(), startTime: Store.nowTime(),
        items: workoutDraft.items.map(function (it) {
          return { exerciseId: it.id, name: it.name, sets: it.sets, reps: it.reps, weightKg: it.weight, minutes: it.minutes, met: it.met };
        }),
        totalMinutes: summary.totalMinutes, estimatedKcal: summary.estimatedKcal, partsHit: partsHit
      });
    });
    workoutDraft.items = [];
    toast('运动记录已保存 ✅');
    refresh();
  }

  window.__appGo = go;
  window.__appInit = function () {
    // 动作库初始化/升级：
    // - 空库 → 写入全部预置
    // - libVersion < 3 → 追加缺失的预置动作（你手机上旧的22个会自动补到89个），保留自定义动作
    // - 已升级过 → 不动，避免覆盖你改过的动作
    Store.update(function (d) {
      if (!d.exerciseLib || !d.exerciseLib.length) {
        d.exerciseLib = JSON.parse(JSON.stringify(Lib.PRESET));
        d.libVersion = 3;
      } else if ((d.libVersion || 1) < 3) {
        var existing = {};
        d.exerciseLib.forEach(function (e) { existing[e.id] = true; });
        Lib.PRESET.forEach(function (p) {
          if (!existing[p.id]) d.exerciseLib.push(JSON.parse(JSON.stringify(p)));
        });
        d.libVersion = 3;
      }
    });
    var now = new Date();
    var wd = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
    $('#topDate').textContent = (now.getMonth() + 1) + '月' + now.getDate() + '日 · 周' + wd;
    $$('.tab').forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.page); }); });
    go('home');
  };

  // 暴露给后续脚本扩展（身体/习惯/日历/设置）
  window.App = {
    $: $, $$: $$, esc: esc, toast: toast, go: go, refresh: refresh,
    openSheet: openSheet, closeSheet: closeSheet, sheetBody: sheetBody,
    calcStreak: calcStreak, dateStr: dateStr, hasAnyLog: hasAnyLog
  };
})();
