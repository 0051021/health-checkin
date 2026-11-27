/* ============================================================
 * anatomy.js —— 人体肌群图（内联 SVG，离线可用，无版权问题）
 * 正/背面连贯人形轮廓，按肌群 ID 高亮发力区域。
 * 肌群 ID 与 lib.js MUSCLE_NAMES 一致。
 * ============================================================ */
(function (global) {
  'use strict';

  var BODY     = '#f4eff3';   // 人形底色（暖灰，避免冷灰的"解剖感"）
  var EDGE     = '#e3dbe7';   // 轮廓描边
  var HAIR     = '#d6ccde';   // 头发剪影
  var BASE     = '#ddd7e6';   // 未激活肌群
  var PRIMARY  = '#8b6fc4';   // 主发力肌群（主题紫）
  var SECOND   = '#57b79b';   // 协同肌群（薄荷绿）

  // 连贯人形轮廓（一整条 path，头/发单独画）
  // 坐标以 x=80 为中线，y 从 8 到 283
  var BODY_PATH =
    'M75,50 C68,51 60,54 55,59 C48,67 44,86 42,106 ' +
    'L38,152 Q37,160 43,160 L49,118 L57,95 L59,146 L61,162 ' +
    'L59,224 L62,278 Q63,283 69,283 L73,278 L77,232 L80,182 ' +
    'L83,232 L87,278 L91,283 Q97,283 98,278 L101,224 L99,162 ' +
    'L101,146 L103,95 L111,118 L117,160 Q123,160 122,152 ' +
    'L118,106 C116,86 112,67 105,59 C100,54 92,51 85,50 Z';

  var HEAD = '<ellipse cx="80" cy="32" rx="15" ry="17" fill="' + BODY + '" stroke="' + EDGE + '" stroke-width="1"/>' +
             '<path d="M66,28 Q70,15 80,15 Q90,15 94,28 Q87,22 80,22 Q73,22 66,28 Z" fill="' + HAIR + '"/>';

  // 每个肌群由若干平滑 path 组成，贴合人形轮廓
  var MUSCLES = [
    // ============ 正面 ============
    { id: 'frontDelts', view: 'front', label: '三角肌前束', shapes: [
      { t: 'path', d: 'M52,58 Q58,54 64,60 L63,74 Q55,78 50,71 Z' },
      { t: 'path', d: 'M108,58 Q102,54 96,60 L97,74 Q105,78 110,71 Z' }
    ]},
    { id: 'chest', view: 'front', label: '胸大肌', shapes: [
      { t: 'path', d: 'M64,72 Q72,67 79,73 L79,89 Q70,93 64,87 Z' },
      { t: 'path', d: 'M96,72 Q88,67 81,73 L81,89 Q90,93 96,87 Z' }
    ]},
    { id: 'biceps', view: 'front', label: '肱二头肌', shapes: [
      { t: 'path', d: 'M44,88 Q50,88 51,102 L50,114 Q44,116 42,109 Z' },
      { t: 'path', d: 'M116,88 Q110,88 109,102 L110,114 Q116,116 118,109 Z' }
    ]},
    { id: 'forearms', view: 'front', label: '前臂肌群', shapes: [
      { t: 'path', d: 'M41,120 Q47,120 48,134 L46,150 Q41,152 40,146 Z' },
      { t: 'path', d: 'M119,120 Q113,120 112,134 L114,150 Q119,152 120,146 Z' }
    ]},
    { id: 'abs', view: 'front', label: '腹直肌', shapes: [
      { t: 'path', d: 'M72,97 Q76,95 79,97 L79,109 Q75,111 72,109 Z' },
      { t: 'path', d: 'M72,112 Q76,110 79,112 L79,124 Q75,126 72,124 Z' },
      { t: 'path', d: 'M72,127 Q76,125 79,127 L79,139 Q75,141 72,139 Z' },
      { t: 'path', d: 'M81,97 Q84,95 88,97 L88,109 Q84,111 81,109 Z' },
      { t: 'path', d: 'M81,112 Q84,110 88,112 L88,124 Q84,126 81,124 Z' },
      { t: 'path', d: 'M81,127 Q84,125 88,127 L88,139 Q84,141 81,139 Z' }
    ]},
    { id: 'transverse', view: 'front', label: '腹横肌/腰侧', shapes: [
      { t: 'path', d: 'M62,100 Q60,120 62,142 L67,141 Q65,120 67,100 Z' },
      { t: 'path', d: 'M98,100 Q100,120 98,142 L93,141 Q95,120 93,100 Z' }
    ]},
    { id: 'obliques', view: 'front', label: '腹斜肌', shapes: [
      { t: 'path', d: 'M60,104 Q57,120 61,136 L65,132 Q62,120 64,106 Z' },
      { t: 'path', d: 'M100,104 Q103,120 99,136 L95,132 Q98,120 96,106 Z' }
    ]},
    { id: 'quads', view: 'front', label: '股四头肌', shapes: [
      { t: 'path', d: 'M63,170 Q71,167 77,173 L75,220 Q68,224 61,218 Z' },
      { t: 'path', d: 'M97,170 Q89,167 83,173 L85,220 Q92,224 99,218 Z' }
    ]},
    // ============ 背面 ============
    { id: 'traps', view: 'back', label: '斜方肌', shapes: [
      { t: 'path', d: 'M64,58 Q80,52 96,58 L93,82 Q80,88 67,82 Z' }
    ]},
    { id: 'rearDelts', view: 'back', label: '三角肌后束', shapes: [
      { t: 'path', d: 'M52,58 Q58,54 64,60 L63,74 Q55,78 50,71 Z' },
      { t: 'path', d: 'M108,58 Q102,54 96,60 L97,74 Q105,78 110,71 Z' }
    ]},
    { id: 'rhomboids', view: 'back', label: '菱形肌', shapes: [
      { t: 'path', d: 'M73,80 L80,76 L87,80 L84,96 L80,99 L76,96 Z' }
    ]},
    { id: 'lats', view: 'back', label: '背阔肌', shapes: [
      { t: 'path', d: 'M62,88 Q55,106 61,138 L76,141 Q74,110 78,90 Z' },
      { t: 'path', d: 'M98,88 Q105,106 99,138 L84,141 Q86,110 82,90 Z' }
    ]},
    { id: 'erectors', view: 'back', label: '竖脊肌', shapes: [
      { t: 'path', d: 'M77,100 L83,100 L82,142 L78,142 Z' }
    ]},
    { id: 'triceps', view: 'back', label: '肱三头肌', shapes: [
      { t: 'path', d: 'M44,88 Q50,88 51,102 L50,114 Q44,116 42,109 Z' },
      { t: 'path', d: 'M116,88 Q110,88 109,102 L110,114 Q116,116 118,109 Z' }
    ]},
    { id: 'glutes', view: 'back', label: '臀大肌', shapes: [
      { t: 'path', d: 'M62,150 Q71,146 78,152 L77,172 Q69,176 61,170 Z' },
      { t: 'path', d: 'M98,150 Q89,146 82,152 L83,172 Q91,176 99,170 Z' }
    ]},
    { id: 'hamstrings', view: 'back', label: '腘绳肌', shapes: [
      { t: 'path', d: 'M62,176 Q70,172 76,178 L74,222 Q67,226 60,220 Z' },
      { t: 'path', d: 'M98,176 Q90,172 84,178 L86,222 Q93,226 100,220 Z' }
    ]},
    { id: 'calves', view: 'back', label: '小腿三头肌', shapes: [
      { t: 'path', d: 'M63,228 Q69,224 73,230 L71,268 Q66,272 62,266 Z' },
      { t: 'path', d: 'M97,228 Q91,224 87,230 L89,268 Q94,272 98,266 Z' }
    ]}
  ];

  function figureHTML(view, primary, second, xOffset) {
    var s = '<g transform="translate(' + xOffset + ',0)">';
    // 连贯人形底图 + 头
    s += '<path d="' + BODY_PATH + '" fill="' + BODY + '" stroke="' + EDGE + '" stroke-width="1.2" stroke-linejoin="round"/>';
    s += HEAD;
    // 肌群（细白描边形成分区缝，不割裂）
    MUSCLES.filter(function (m) { return m.view === view; }).forEach(function (m) {
      var color = BASE;
      if ((primary || []).indexOf(m.id) >= 0) color = PRIMARY;
      else if ((second || []).indexOf(m.id) >= 0) color = SECOND;
      m.shapes.forEach(function (sp) {
        s += '<path d="' + sp.d + '" fill="' + color + '" stroke="' + BODY + '" stroke-width="0.8" stroke-linejoin="round"/>';
      });
    });
    s += '</g>';
    return s;
  }

  // 生成完整人体图 SVG
  // primary: 主发力肌群 ID 数组；second: 协同肌群 ID 数组
  function render(primary, second) {
    return '<svg viewBox="0 0 320 292" width="100%" style="max-width:340px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="52" y="10" text-anchor="middle" font-size="11" fill="#9a92a6">正面</text>' +
      '<text x="212" y="10" text-anchor="middle" font-size="11" fill="#9a92a6">背面</text>' +
      figureHTML('front', primary, second, -28) +
      figureHTML('back', primary, second, 132) +
      '</svg>';
  }

  // 图例
  function legend() {
    return '<div class="anat-legend">' +
      '<span><i style="background:' + PRIMARY + '"></i>主发力</span>' +
      '<span><i style="background:' + SECOND + '"></i>协同</span>' +
      '<span><i style="background:' + BASE + '"></i>未激活</span>' +
      '</div>';
  }

  global.Anatomy = { render: render, legend: legend, MUSCLES: MUSCLES, PRIMARY: PRIMARY, SECOND: SECOND };
})(window);
