/* ============================================================
 * store.js —— 本地数据层
 * 所有数据存在一个 key 里，读写简单、导出方便。
 * 无账号、无联网，数据只在本机。
 * ============================================================ */
(function (global) {
  'use strict';

  var KEY = 'healthData_v1';

  // 默认数据结构（首次打开初始化）
  function defaultData() {
    return {
      version: 1,
      profile: {
        gender: 'F',
        age: 27,
        heightCm: 167,
        weightKg: 55.5,
        target: '圣诞前马甲线 + 改善腰臀比',
        injuryNote: '膝盖/手腕不适，避免跳跃和手腕承压动作'
      },
      exerciseLib: [],          // 由 lib.js 在首次初始化时填充
      workoutLogs: [],          // 运动记录
      bodyLogs: [],             // 身体数据
      habitLogs: [],            // 每日打卡（护肤/习惯/自定义）
      financeLogs: [],          // 记账
      habitDefs: [              // 打卡项定义（可增删）
        { id: 'h1', name: '洁面', group: '护肤', icon: '💧' },
        { id: 'h2', name: '保湿', group: '护肤', icon: '🧴' },
        { id: 'h3', name: '防晒', group: '护肤', icon: '☀️' },
        { id: 'h4', name: '早睡', group: '习惯', icon: '🌙' },
        { id: 'h5', name: '喝水2L', group: '习惯', icon: '🥤' },
        { id: 'h6', name: '戒糖', group: '习惯', icon: '🚫' },
        { id: 'h7', name: '低冲击有氧', group: '习惯', icon: '🏃' }
      ],
      settings: {
        kcalDisclaimer: '卡路里为 MET 公式估算值，仅供参考，非精确测量，不作为医疗或减脂处方依据。'
      }
    };
  }

  var cache = null;

  function load() {
    if (cache) return cache;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        cache = JSON.parse(raw);
        // 兼容旧数据缺字段
        var d = defaultData();
        Object.keys(d).forEach(function (k) {
          if (cache[k] === undefined) cache[k] = d[k];
        });
      } else {
        cache = defaultData();
        save();
      }
    } catch (e) {
      cache = defaultData();
    }
    return cache;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
      return true;
    } catch (e) {
      console.error('保存失败（可能存储空间不足）', e);
      return false;
    }
  }

  // 更新：传入修改函数
  function update(fn) {
    var d = load();
    fn(d);
    save();
    return d;
  }

  // 今天日期 YYYY-MM-DD（本地时区）
  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function nowTime() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  // 生成简单唯一 id
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // 导出：返回 JSON 字符串
  function exportJSON() {
    return JSON.stringify(load(), null, 2);
  }

  // 导入：接受 JSON 字符串，校验后覆盖
  function importJSON(text) {
    var obj;
    try {
      obj = JSON.parse(text);
    } catch (e) {
      return { ok: false, msg: 'JSON 格式错误，无法解析' };
    }
    if (!obj || typeof obj !== 'object' || !obj.profile) {
      return { ok: false, msg: '数据结构不正确，缺少必要字段' };
    }
    var d = defaultData();
    Object.keys(d).forEach(function (k) {
      if (obj[k] === undefined) obj[k] = d[k];
    });
    cache = obj;
    save();
    return { ok: true, msg: '导入成功' };
  }

  // 清空全部数据（危险操作，UI 需二次确认）
  function reset() {
    cache = defaultData();
    save();
  }

  global.Store = {
    load: load, save: save, update: update, today: today, nowTime: nowTime,
    uid: uid, exportJSON: exportJSON, importJSON: importJSON, reset: reset,
    KEY: KEY
  };
})(window);
