/* ============================================================
 * anatomy.js —— 写实人体解剖图（内联 SVG，离线可用）
 * 基于 wger 开源素材（CC BY-SA 4.0 / CC0），按肌群 ID 高亮发力区域。
 * 肌群 ID 与 lib.js MUSCLE_NAMES 一致。
 * ============================================================ */
(function (global) {
  'use strict';

  var PRIMARY = '#8b6fc4';   // 主发力（主题紫）
  var SECOND  = '#57b79b';   // 协同（薄荷绿）
  var BASE    = '#ddd7e6';   // 图例用未激活色

  // 我们的肌群 ID → wger muscle id（15 个）
  // 部分肌群共用同一高亮层（如菱形肌/竖脊肌/斜方肌后侧共用 traps）
  var MAP = {
    frontDelts: 2, chest: 4, biceps: 1, forearms: 13,
    abs: 6, obliques: 14, transverse: 14, quads: 10,
    traps: 9, rearDelts: 2, rhomboids: 9, lats: 12,
    erectors: 9, triceps: 5, glutes: 8, hamstrings: 11, calves: 7
  };
  // 需要叠加多个高亮层的肌群
  var MULTI = { calves: [7, 15] };

  // 每个肌群在哪一面显示（front/back/both）
  var VIEW = {
    frontDelts: 'front', chest: 'front', biceps: 'front', forearms: 'front',
    abs: 'front', obliques: 'front', transverse: 'front', quads: 'front',
    traps: 'back', rearDelts: 'back', rhomboids: 'back', lats: 'back',
    erectors: 'back', triceps: 'back', glutes: 'back', hamstrings: 'back', calves: 'back'
  };

  var MUSCLES = [
    { id:'frontDelts', label:'三角肌前束' }, { id:'chest', label:'胸大肌' },
    { id:'biceps', label:'肱二头肌' }, { id:'forearms', label:'前臂肌群' },
    { id:'abs', label:'腹直肌' }, { id:'obliques', label:'腹斜肌' },
    { id:'transverse', label:'腹横肌/腰侧' }, { id:'quads', label:'股四头肌' },
    { id:'traps', label:'斜方肌' }, { id:'rearDelts', label:'三角肌后束' },
    { id:'rhomboids', label:'菱形肌' }, { id:'lats', label:'背阔肌' },
    { id:'erectors', label:'竖脊肌' }, { id:'triceps', label:'肱三头肌' },
    { id:'glutes', label:'臀大肌' }, { id:'hamstrings', label:'腘绳肌' },
    { id:'calves', label:'小腿三头肌' }
  ];

  function data() { return global.AnatomyData; }

  // 渲染单面解剖图
  function figure(view, primary, second) {
    var D = data();
    if (!D) return '';
    var base = D[view];
    var pPrimary = primary || [], pSecond = second || [];
    var s = '<g transform="' + (base.tr || '') + '">';

    // 基础解剖图（灰度写实人体）
    base.paths.forEach(function (p) {
      s += '<path d="' + p.d + '" fill="' + p.c + '" stroke="#fff" stroke-width="0.6"/>';
    });

    // 高亮层：按肌群聚合，主发力优先于协同
    var layers = {}; // key = 'main-' + wgerId → color
    function addLayer(wid, kind, color) {
      var key = kind + '-' + wid;
      if (!layers[key] || color === PRIMARY) layers[key] = color;
    }
    // 协同先画（主发力覆盖其上）
    pSecond.forEach(function (id) {
      if (VIEW[id] !== view) return;
      var ids = MULTI[id] || [MAP[id]];
      ids.forEach(function (wid) { addLayer(wid, 'secondary', SECOND); });
    });
    pPrimary.forEach(function (id) {
      if (VIEW[id] !== view) return;
      var ids = MULTI[id] || [MAP[id]];
      ids.forEach(function (wid) { addLayer(wid, 'main', PRIMARY); });
    });
    Object.keys(layers).forEach(function (key) {
      var parts = key.split('-');
      var kind = parts[0], wid = parts[1];
      var hl = D.highlights[wid] && D.highlights[wid][kind];
      if (!hl) return;
      hl.forEach(function (d) {
        s += '<path d="' + d + '" fill="' + layers[key] + '" stroke="#fff" stroke-width="0.4"/>';
      });
    });

    s += '</g>';
    return s;
  }

  // 生成完整图：正面 + 背面并排
  function render(primary, second) {
    var D = data();
    if (!D) return '<div style="color:#999;font-size:12px">解剖图数据未加载</div>';
    var vb = D.viewBox || '0 0 200 369';
    return '<svg viewBox="0 0 424 369" width="100%" style="max-width:424px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="100" y="12" text-anchor="middle" font-size="12" font-weight="600" fill="#8b8498">正面</text>' +
      '<text x="324" y="12" text-anchor="middle" font-size="12" font-weight="600" fill="#8b8498">背面</text>' +
      '<g transform="translate(0,16)">' + figure('front', primary, second) + '</g>' +
      '<g transform="translate(224,16)">' + figure('back', primary, second) + '</g>' +
      '</svg>';
  }

  function legend() {
    return '<div class="anat-legend">' +
      '<span><i style="background:' + PRIMARY + '"></i>主发力</span>' +
      '<span><i style="background:' + SECOND + '"></i>协同</span>' +
      '<span><i style="background:#ccc"></i>其他肌群</span>' +
      '</div>' +
      '<div class="anat-credit">解剖图来源：wger Workout Manager（CC BY-SA 4.0 / CC0）</div>';
  }

  global.Anatomy = {
    render: render, legend: legend, MUSCLES: MUSCLES,
    PRIMARY: PRIMARY, SECOND: SECOND, MAP: MAP, VIEW: VIEW
  };
})(window);
