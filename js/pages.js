/* ============================================================
 * pages.js —— 身体数据 / 打卡中心 / 日历 / 设置
 * 扩展 App 对象里的渲染函数（app.js 的 render() 会调用）
 * ============================================================ */
(function () {
  'use strict';
  var $ = App.$, $$ = App.$$, esc = App.esc, toast = App.toast;
  var Store = window.Store, Lib = window.Lib;

  /* ============================================================
   * 页面 3：身体数据
   * ============================================================ */
  var chartMetric = 'weight'; // weight | waist | hip | whr

  function renderBody() {
    var d = Store.load();
    var logs = d.bodyLogs;
    var last = logs.length ? logs[logs.length - 1] : null;
    var first = logs.length ? logs[0] : null;

    var nowHTML = last ?
      '<div class="now-row"><span class="k">体重</span><span class="v">' + last.weightKg + ' <small>kg</small></span></div>' +
      '<div class="now-row"><span class="k">腰围</span><span class="v">' + (last.waistCm || '—') + ' <small>cm</small></span></div>' +
      '<div class="now-row"><span class="k">臀围</span><span class="v">' + (last.hipCm || '—') + ' <small>cm</small></span></div>' +
      '<div class="now-row"><span class="k">腰臀比 WHR</span><span class="v" style="color:var(--mint)">' + (last.whr || '—') + '</span></div>'
      : '<div class="empty-state"><div class="ic">📏</div><div class="t">还没有身体数据</div></div>';

    var deltaHTML = '';
    if (last && first && logs.length > 1) {
      var dw = Math.round((last.weightKg - first.weightKg) * 10) / 10;
      var dwhr = (last.whr && first.whr) ? Math.round((last.whr - first.whr) * 100) / 100 : null;
      deltaHTML = '<div style="font-size:11.5px;color:var(--muted);margin-top:10px">较首次记录：体重 ' +
        (dw > 0 ? '+' : '') + dw + 'kg' + (dwhr !== null ? ' · 腰臀比 ' + (dwhr > 0 ? '+' : '') + dwhr : '') + '</div>';
    }

    var historyHTML = logs.length ? logs.slice().reverse().slice(0, 12).map(function (l) {
      return '<div class="log-item"><div class="log-top"><span class="log-date">' + esc(l.date) + '</span>' +
        '<span class="log-val">' + l.weightKg + ' kg</span></div>' +
        '<div class="log-sub">腰 ' + (l.waistCm || '—') + ' · 臀 ' + (l.hipCm || '—') + ' · WHR ' + (l.whr || '—') + '</div></div>';
    }).join('') : '';

    $('#page-body').innerHTML =
      '<div class="card">' +
        '<h2><span class="dot"></span>最新数据</h2>' + nowHTML + deltaHTML +
      '</div>' +
      '<div class="card">' +
        '<h2><span class="dot"></span>趋势图</h2>' +
        '<div class="chips" id="metricChips">' +
          [['weight', '体重'], ['waist', '腰围'], ['hip', '臀围'], ['whr', '腰臀比']].map(function (m) {
            return '<div class="chip' + (m[0] === chartMetric ? ' active' : '') + '" data-m="' + m[0] + '">' + m[1] + '</div>';
          }).join('') +
        '</div>' +
        '<div class="chart-box"><canvas id="trendCanvas"></canvas></div>' +
      '</div>' +
      '<div class="card">' +
        '<h2><span class="dot"></span>历史记录 <span style="font-size:11px;color:var(--muted);font-weight:400">（每周日空腹量一次）</span></h2>' +
        (historyHTML || '<div class="empty-state"><div class="t">暂无记录</div></div>') +
      '</div>' +
      '<button class="btn btn-primary" id="addBody" style="margin-bottom:14px">+ 记录身体数据</button>';

    $('#addBody').addEventListener('click', openBodyForm);
    $$('#metricChips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        $$('#metricChips .chip').forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active'); chartMetric = c.dataset.m; drawTrend();
      });
    });
    drawTrend();
  }

  function drawTrend() {
    var cv = $('#trendCanvas');
    if (!cv) return;
    var d = Store.load();
    var logs = d.bodyLogs.slice(-12);
    var dpr = window.devicePixelRatio || 1;
    var w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (logs.length < 1) {
      ctx.fillStyle = '#9a9fb2'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('记录 2 次以上就能看到趋势', w / 2, h / 2);
      return;
    }
    var key = chartMetric === 'weight' ? 'weightKg' : chartMetric === 'waist' ? 'waistCm' : chartMetric === 'hip' ? 'hipCm' : 'whr';
    var vals = logs.map(function (l) { return Number(l[key]); }).filter(function (v) { return !isNaN(v) && v > 0; });
    if (!vals.length) return;

    var padL = 34, padR = 10, padT = 14, padB = 24;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (max === min) { max += 1; min -= 1; }
    var range = max - min;
    min -= range * 0.15; max += range * 0.15;
    var X = function (i) { return padL + (vals.length === 1 ? (w - padL - padR) / 2 : i * (w - padL - padR) / (vals.length - 1)); };
    var Y = function (v) { return padT + (max - v) / (max - min) * (h - padT - padB); };

    // 网格 + Y 轴标注
    ctx.strokeStyle = '#eceef5'; ctx.fillStyle = '#9a9fb2'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    for (var g = 0; g <= 3; g++) {
      var gy = padT + g * (h - padT - padB) / 3;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
      var gv = max - g * (max - min) / 3;
      ctx.fillText(gv.toFixed(chartMetric === 'whr' ? 2 : 1), padL - 5, gy + 3);
    }
    // 折线
    var grad = ctx.createLinearGradient(padL, 0, w - padR, 0);
    grad.addColorStop(0, '#8b6fc4'); grad.addColorStop(1, '#3fb59b');
    ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.beginPath();
    vals.forEach(function (v, i) { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); });
    ctx.stroke();
    // 点 + X 轴日期
    ctx.fillStyle = '#8b6fc4'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    vals.forEach(function (v, i) {
      ctx.beginPath(); ctx.arc(X(i), Y(v), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9a9fb2';
      var dt = logs[i].date.slice(5).replace('-', '/');
      ctx.fillText(dt, X(i), h - 6);
      ctx.fillStyle = '#8b6fc4';
    });
  }

  function openBodyForm() {
    var d = Store.load();
    var p = d.profile;
    var html =
      '<div class="grid2">' +
        '<div class="field"><label>日期</label><input class="input" type="date" id="bDate" value="' + Store.today() + '"></div>' +
        '<div class="field"><label>体重 (kg)</label><input class="input" type="number" step="0.1" id="bWeight" value="' + p.weightKg + '"></div>' +
      '</div>' +
      '<div class="grid2">' +
        '<div class="field"><label>腰围 (cm)</label><input class="input" type="number" step="0.1" id="bWaist" placeholder="空腹量"></div>' +
        '<div class="field"><label>臀围 (cm)</label><input class="input" type="number" step="0.1" id="bHip" placeholder="最宽处"></div>' +
      '</div>' +
      '<div class="field"><label>腰臀比（自动计算）</label><input class="input" id="bWhr" disabled value="—"></div>' +
      '<button class="btn btn-primary" id="saveBody" style="margin-top:6px">保存</button>';
    App.openSheet('记录身体数据', html);

    function calcWhr() {
      var w = Number($('#bWaist').value), h = Number($('#bHip').value);
      $('#bWhr').value = (w && h) ? Lib.calcWHR(w, h) : '—';
    }
    $('#bWaist').addEventListener('input', calcWhr);
    $('#bHip').addEventListener('input', calcWhr);

    $('#saveBody').addEventListener('click', function () {
      var weight = Number($('#bWeight').value);
      if (!weight) { toast('请填体重'); return; }
      var waist = Number($('#bWaist').value) || null;
      var hip = Number($('#bHip').value) || null;
      var whr = (waist && hip) ? Lib.calcWHR(waist, hip) : null;
      var date = $('#bDate').value || Store.today();
      Store.update(function (x) {
        // 同一天覆盖
        x.bodyLogs = x.bodyLogs.filter(function (l) { return l.date !== date; });
        x.bodyLogs.push({ date: date, weightKg: weight, waistCm: waist, hipCm: hip, whr: whr });
        x.bodyLogs.sort(function (a, b) { return a.date.localeCompare(b.date); });
        x.profile.weightKg = weight;
      });
      App.closeSheet(); toast('身体数据已保存 ✅'); App.refresh();
    });
  }

  /* ============================================================
   * 页面 4：打卡中心
   * ============================================================ */
  function renderHabit() {
    var d = Store.load();
    var date = Store.today();
    var rec = d.habitLogs.find(function (x) { return x.date === date; });
    var checks = rec ? rec.checks : {};

    function groupHTML(group) {
      var items = d.habitDefs.filter(function (h) { return h.group === group; });
      if (!items.length) return '';
      return '<div class="habit-group"><div class="habit-group-title">' + esc(group) + '</div>' +
        items.map(function (h) {
          return '<div class="habit-item' + (checks[h.id] ? ' on' : '') + '" data-h="' + esc(h.id) + '">' +
            '<div class="habit-check">' + (checks[h.id] ? '✓' : '') + '</div>' +
            '<div class="habit-name">' + h.icon + ' ' + esc(h.name) + '</div>' +
            '<div class="habit-del" data-del-h="' + esc(h.id) + '">×</div>' +
          '</div>';
        }).join('') + '</div>';
    }

    var financeToday = d.financeLogs.filter(function (f) { return f.date === date; });
    var expense = financeToday.filter(function (f) { return f.type === 'expense'; }).reduce(function (s, f) { return s + f.amount; }, 0);
    var income = financeToday.filter(function (f) { return f.type === 'income'; }).reduce(function (s, f) { return s + f.amount; }, 0);
    var finHTML = financeToday.length ? financeToday.map(function (f) {
      return '<div class="log-item"><div class="log-top"><span class="log-date">' + esc(f.category) + (f.note ? ' · ' + esc(f.note) : '') + '</span>' +
        '<span class="log-val" style="color:' + (f.type === 'expense' ? 'var(--red)' : 'var(--mint)') + '">' +
        (f.type === 'expense' ? '-' : '+') + f.amount + '</span></div></div>';
    }).join('') : '<div class="empty-state"><div class="t">今日暂无记录</div></div>';

    $('#page-habit').innerHTML =
      '<div class="card">' +
        '<h2><span class="dot"></span>今日打卡 <span style="font-size:11px;color:var(--muted);font-weight:400">' + date + '</span></h2>' +
        groupHTML('护肤') + groupHTML('习惯') + groupHTML('学习/其他') +
        '<div class="ex-add" id="addHabit" style="margin-top:12px">+ 自定义打卡项</div>' +
      '</div>' +
      '<div class="card">' +
        '<h2><span class="dot"></span>今日小账本</h2>' +
        '<div style="display:flex;gap:10px;margin-bottom:10px">' +
          '<div style="flex:1;background:var(--amber-soft);border-radius:10px;padding:10px;text-align:center">' +
            '<div style="font-size:11px;color:#8a6a35">支出</div><div style="font-size:18px;font-weight:700;color:var(--red)">' + expense.toFixed(1) + '</div></div>' +
          '<div style="flex:1;background:var(--mint-soft);border-radius:10px;padding:10px;text-align:center">' +
            '<div style="font-size:11px;color:#2f6b5c">收入</div><div style="font-size:18px;font-weight:700;color:var(--mint)">' + income.toFixed(1) + '</div></div>' +
        '</div>' +
        finHTML +
        '<button class="btn btn-ghost btn-sm" id="addFinance" style="width:100%;margin-top:12px">+ 记一笔</button>' +
      '</div>';

    $$('#page-habit .habit-item').forEach(function (it) {
      it.addEventListener('click', function (e) {
        if (e.target.dataset.delH) return;
        var id = it.dataset.h;
        Store.update(function (x) {
          var r = x.habitLogs.find(function (y) { return y.date === date; });
          if (!r) { r = { date: date, checks: {} }; x.habitLogs.push(r); }
          r.checks[id] = !r.checks[id];
        });
        App.refresh();
      });
    });
    $$('#page-habit [data-del-h]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.delH;
        Store.update(function (x) { x.habitDefs = x.habitDefs.filter(function (h) { return h.id !== id; }); });
        toast('已删除打卡项'); App.refresh();
      });
    });
    $('#addHabit').addEventListener('click', openHabitForm);
    $('#addFinance').addEventListener('click', openFinanceForm);
  }

  function openHabitForm() {
    var html =
      '<div class="field"><label>打卡项名称</label><input class="input" id="hName" placeholder="如：学习30min / 冥想"></div>' +
      '<div class="field"><label>图标</label><input class="input" id="hIcon" value="⭐" maxlength="4"></div>' +
      '<div class="field"><label>分组</label><select class="input" id="hGroup">' +
        '<option value="护肤">护肤</option><option value="习惯">习惯</option><option value="学习/其他" selected>学习/其他</option>' +
      '</select></div>' +
      '<button class="btn btn-primary" id="saveHabit">添加</button>';
    App.openSheet('自定义打卡项', html);
    $('#saveHabit').addEventListener('click', function () {
      var name = $('#hName').value.trim();
      if (!name) { toast('请填名称'); return; }
      Store.update(function (x) {
        x.habitDefs.push({ id: Store.uid('h'), name: name, group: $('#hGroup').value, icon: $('#hIcon').value || '⭐' });
      });
      App.closeSheet(); toast('已添加'); App.refresh();
    });
  }

  function openFinanceForm() {
    var html =
      '<div class="field"><label>类型</label><select class="input" id="fType"><option value="expense">支出</option><option value="income">收入</option></select></div>' +
      '<div class="grid2">' +
        '<div class="field"><label>金额 (¥)</label><input class="input" type="number" step="0.1" id="fAmount" placeholder="0.0"></div>' +
        '<div class="field"><label>分类</label><select class="input" id="fCat">' +
          '<option>餐饮</option><option>交通</option><option>购物</option><option>学习</option><option>其他</option>' +
        '</select></div>' +
      '</div>' +
      '<div class="field"><label>备注（可选）</label><input class="input" id="fNote" placeholder="如：午餐"></div>' +
      '<button class="btn btn-primary" id="saveFin">保存</button>' +
      '<p style="font-size:10.5px;color:var(--muted);margin-top:10px">仅为个人记账记录，非交易功能。</p>';
    App.openSheet('记一笔', html);
    $('#saveFin').addEventListener('click', function () {
      var amt = Number($('#fAmount').value);
      if (!amt || amt <= 0) { toast('请填金额'); return; }
      Store.update(function (x) {
        x.financeLogs.push({ date: Store.today(), type: $('#fType').value, category: $('#fCat').value, amount: amt, note: $('#fNote').value.trim() });
      });
      App.closeSheet(); toast('已记录'); App.refresh();
    });
  }

  /* ============================================================
   * 日历（打卡中心“我的”快捷入口 + 我的页）
   * ============================================================ */
  var calCursor = new Date();
  function showCalendarSheet() {
    function html() { return calendarHTML(); }
    App.openSheet('打卡日历', html());
    bindCalendar();
  }
  function calendarHTML() {
    var y = calCursor.getFullYear(), m = calCursor.getMonth();
    var first = new Date(y, m, 1).getDay();
    var days = new Date(y, m + 1, 0).getDate();
    var cells = '';
    for (var i = 0; i < first; i++) cells += '<div class="cal-day empty"></div>';
    for (var d = 1; d <= days; d++) {
      var ds = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var cls = 'cal-day' + (App.hasAnyLog(ds) ? ' has' : '') + (ds === Store.today() ? ' today' : '');
      cells += '<div class="' + cls + '">' + d + (App.hasAnyLog(ds) ? '<span class="cal-dot"></span>' : '') + '</div>';
    }
    var monthCount = 0;
    for (var k = 1; k <= days; k++) {
      var ks = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(k).padStart(2, '0');
      if (App.hasAnyLog(ks)) monthCount++;
    }
    return '<div class="card" style="box-shadow:none;background:#fbfaff">' +
      '<div class="cal-head"><div class="m">' + y + ' 年 ' + (m + 1) + ' 月</div>' +
      '<div class="cal-nav"><button id="calPrev">‹</button><button id="calNext">›</button></div></div>' +
      '<div class="cal-grid">' + ['日','一','二','三','四','五','六'].map(function (w) { return '<div class="cal-dow">' + w + '</div>'; }).join('') + cells + '</div>' +
      '<div class="cal-legend"><span><i style="background:var(--mint-soft);border:1px solid var(--mint)"></i>已打卡 ' + monthCount + ' 天</span>' +
      '<span><i style="background:var(--accent)"></i>今天</span></div>' +
      '<div style="text-align:center;margin-top:12px;font-size:13px;color:var(--sub)">当前连续 <b style="color:var(--accent);font-size:16px">' + App.calcStreak() + '</b> 天 🔥</div>' +
      '</div>';
  }
  function bindCalendar() {
    var p = $('#calPrev'), n = $('#calNext');
    if (p) p.addEventListener('click', function () { calCursor.setMonth(calCursor.getMonth() - 1); refreshCal(); });
    if (n) n.addEventListener('click', function () { calCursor.setMonth(calCursor.getMonth() + 1); refreshCal(); });
  }
  function refreshCal() {
    var body = App.sheetBody();
    if (!body) return;
    body.innerHTML = calendarHTML();
    bindCalendar();
  }

  /* ============================================================
   * 页面 5：我的（设置）
   * ============================================================ */
  function renderMine() {
    var d = Store.load();
    var exCount = d.exerciseLib.length;
    var logCount = d.workoutLogs.length + d.bodyLogs.length + d.habitLogs.length + d.financeLogs.length;
    $('#page-mine').innerHTML =
      '<div class="card">' +
        '<h2><span class="dot"></span>我的资料</h2>' +
        '<div class="set-item"><div class="left"><div class="t">目标</div><div class="d">' + esc(d.profile.target) + '</div></div><span class="tag">🎯</span></div>' +
        '<div class="set-item"><div class="left"><div class="t">身体</div><div class="d">' + d.profile.heightCm + 'cm · 27岁 · ' + esc(d.profile.injuryNote) + '</div></div></div>' +
      '</div>' +
      '<div class="card">' +
        '<h2><span class="dot"></span>数据</h2>' +
        '<div class="set-item"><div class="left"><div class="t">累计记录</div><div class="d">' + logCount + ' 条 · 动作库 ' + exCount + ' 个</div></div></div>' +
        '<div class="set-item"><div class="left"><div class="t">动作库管理</div><div class="d">增删自定义动作</div></div><button class="btn btn-ghost btn-sm" id="manageEx">管理</button></div>' +
        '<div class="set-item"><div class="left"><div class="t">打卡日历</div><div class="d">看连续天数与分布</div></div><button class="btn btn-ghost btn-sm" id="openCal">查看</button></div>' +
        '<div class="set-item"><div class="left"><div class="t">导出数据</div><div class="d">复制 JSON 备份，换机用</div></div><button class="btn btn-ghost btn-sm" id="exportData">导出</button></div>' +
        '<div class="set-item"><div class="left"><div class="t">导入数据</div><div class="d">粘贴 JSON 恢复</div></div><button class="btn btn-ghost btn-sm" id="importData">导入</button></div>' +
      '</div>' +
      '<div class="card">' +
        '<h2><span class="dot"></span>关于</h2>' +
        '<div style="font-size:12px;color:var(--muted);line-height:1.7">' +
          '📱 <b>装到手机桌面：</b>用浏览器打开本应用 → 菜单 → 「添加到主屏幕」，即可像 App 一样全屏使用，断网也能打开。<br><br>' +
          '🔒 <b>隐私：</b>所有数据只存本机，不上传、无需登录。<br><br>' +
          '⚠️ <b>备份提醒：</b>卸载应用或清除浏览器数据会清空记录，请定期导出。<br><br>' +
          '卡路里为估算值，仅供参考，非医疗建议。' +
        '</div>' +
        '<button class="btn btn-line btn-sm" id="resetData" style="width:100%;margin-top:14px;color:var(--red)">清空全部数据</button>' +
      '</div>';

    $('#manageEx').addEventListener('click', openExManage);
    $('#openCal').addEventListener('click', showCalendarSheet);
    $('#exportData').addEventListener('click', openExport);
    $('#importData').addEventListener('click', openImport);
    $('#resetData').addEventListener('click', function () {
      if (window.confirm('确定清空全部数据？此操作不可恢复，建议先导出备份。')) {
        Store.reset();
        // 恢复预置动作库
        Store.update(function (x) { x.exerciseLib = Lib.PRESET.slice(); });
        toast('已清空'); App.refresh();
      }
    });
  }

  function openExManage() {
    var d = Store.load();
    function listHTML() {
      return d.exerciseLib.map(function (e) {
        var isPreset = e.id.indexOf('e0') === 0;
        return '<div class="log-item"><div class="log-top"><span class="log-date">' + esc(e.name) + '</span>' +
          '<span style="font-size:11px;color:var(--muted)">' + (isPreset ? '预置' : '<span class="del" data-rm="' + esc(e.id) + '" style="color:var(--red);cursor:pointer">删除</span>') + '</span></div>' +
          '<div class="log-sub">' + e.parts.join('·') + ' · ' + esc(e.equipment) + ' · MET ' + e.met + '</div></div>';
      }).join('');
    }
    App.openSheet('动作库管理',
      '<div id="exManageList" style="max-height:46vh;overflow-y:auto">' + listHTML() + '</div>' +
      '<div style="border-top:1px solid var(--line);margin-top:10px;padding-top:14px">' +
        '<div class="field"><label>新动作名称</label><input class="input" id="neName" placeholder="如：绳索面拉"></div>' +
        '<div class="grid2">' +
          '<div class="field"><label>部位</label><select class="input" id="nePart">' + Lib.PARTS.map(function (p) { return '<option>' + p + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label>器械</label><select class="input" id="neEquip">' + Lib.EQUIPMENT.map(function (p) { return '<option>' + p + '</option>'; }).join('') + '</select></div>' +
        '</div>' +
        '<div class="grid2">' +
          '<div class="field"><label>MET 值</label><input class="input" type="number" step="0.1" id="neMet" value="4.0"></div>' +
          '<div class="field"><label>动作要领</label><input class="input" id="neCue" placeholder="一句话"></div>' +
        '</div>' +
        '<button class="btn btn-primary" id="addExLib">添加动作</button>' +
      '</div>');
    function bindDel() {
      $$('#exManageList [data-rm]').forEach(function (b) {
        b.addEventListener('click', function () {
          Store.update(function (x) { x.exerciseLib = x.exerciseLib.filter(function (e) { return e.id !== b.dataset.rm; }); });
          toast('已删除'); openExManage();
        });
      });
    }
    bindDel();
    $('#addExLib').addEventListener('click', function () {
      var name = $('#neName').value.trim();
      if (!name) { toast('请填名称'); return; }
      Store.update(function (x) {
        x.exerciseLib.push({
          id: Store.uid('e'), name: name, parts: [$('#nePart').value],
          equipment: $('#neEquip').value, met: Number($('#neMet').value) || 4.0,
          cue: $('#neCue').value.trim() || '自定义动作'
        });
      });
      toast('已添加'); openExManage();
    });
  }

  function openExport() {
    var text = Store.exportJSON();
    App.openSheet('导出数据（备份）',
      '<p style="font-size:12.5px;color:var(--sub);margin-bottom:10px">复制下面全部文字，存到备忘录或发给自己。换机时用「导入」粘贴恢复。</p>' +
      '<textarea class="input" id="exportText" style="height:180px;font-size:11px" readonly>' + esc(text) + '</textarea>' +
      '<button class="btn btn-primary" id="copyExport" style="margin-top:10px">复制全部</button>');
    $('#copyExport').addEventListener('click', function () {
      var ta = $('#exportText');
      ta.select();
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(ta.value);
        else document.execCommand('copy');
        toast('已复制 ✅');
      } catch (e) { toast('请长按手动复制'); }
    });
  }

  function openImport() {
    App.openSheet('导入数据',
      '<p style="font-size:12.5px;color:var(--sub);margin-bottom:10px">粘贴之前导出的 JSON 文字，导入会覆盖当前全部数据。</p>' +
      '<textarea class="input" id="importText" style="height:180px;font-size:11px" placeholder="在这里粘贴…"></textarea>' +
      '<button class="btn btn-danger" id="doImport" style="margin-top:10px">确认导入并覆盖</button>');
    $('#doImport').addEventListener('click', function () {
      var r = Store.importJSON($('#importText').value);
      toast(r.msg);
      if (r.ok) { App.closeSheet(); App.refresh(); }
    });
  }

  /* ---------- 覆盖 App 的渲染函数 ---------- */
  App.renderBody = renderBody;
  App.renderHabit = renderHabit;
  App.renderMine = renderMine;
  window.showCalendarSheet = showCalendarSheet;
})();
