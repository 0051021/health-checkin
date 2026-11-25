/* ============================================================
 * anatomy.js —— 人体肌群图（内联 SVG，离线可用，无版权问题）
 * 提供正面/背面人体轮廓，按肌群 ID 高亮发力区域。
 * 肌群 ID 与 lib.js MUSCLE_NAMES 一致。
 * ============================================================ */
(function (global) {
  'use strict';

  var BASE = '#e7e3ee';        // 未激活肌群底色
  var PRIMARY = '#8b6fc4';     // 主发力肌群（主题紫）
  var SECOND = '#57b79b';      // 协同肌群（薄荷绿）

  // 每个肌群由若干 SVG 图元组成：{id, view:'front'|'back', shapes:[...]}
  // shape 类型：ellipse(cx,cy,rx,ry) / rect(x,y,w,h,r) / path(d)
  var MUSCLES = [
    // ============ 正面 ============
    { id: 'frontDelts', view: 'front', label: '三角肌前束', shapes: [
      { t: 'ellipse', cx: 52, cy: 44, rx: 13, ry: 10 },
      { t: 'ellipse', cx: 108, cy: 44, rx: 13, ry: 10 }
    ]},
    { id: 'chest', view: 'front', label: '胸大肌', shapes: [
      { t: 'path', d: 'M60,58 Q72,52 82,60 L84,76 Q72,82 60,76 Z' },
      { t: 'path', d: 'M78,60 Q88,52 100,58 L100,76 Q88,82 78,76 Z' }
    ]},
    { id: 'biceps', view: 'front', label: '肱二头肌', shapes: [
      { t: 'ellipse', cx: 40, cy: 88, rx: 9, ry: 17 },
      { t: 'ellipse', cx: 120, cy: 88, rx: 9, ry: 17 }
    ]},
    { id: 'forearms', view: 'front', label: '前臂肌群', shapes: [
      { t: 'ellipse', cx: 36, cy: 122, rx: 7, ry: 18 },
      { t: 'ellipse', cx: 124, cy: 122, rx: 7, ry: 18 }
    ]},
    { id: 'abs', view: 'front', label: '腹直肌', shapes: [
      { t: 'rect', x: 66, y: 80, w: 28, h: 54, r: 6 }
    ]},
    { id: 'transverse', view: 'front', label: '腹横肌/腰侧', shapes: [
      { t: 'path', d: 'M62,84 Q64,108 62,130 L68,130 Q70,106 68,84 Z' },
      { t: 'path', d: 'M92,84 Q90,108 92,130 L98,130 Q96,106 98,84 Z' }
    ]},
    { id: 'obliques', view: 'front', label: '腹斜肌', shapes: [
      { t: 'path', d: 'M60,88 Q56,108 62,126 L68,124 Q64,106 66,88 Z' },
      { t: 'path', d: 'M94,88 Q98,108 92,126 L86,124 Q90,106 88,88 Z' }
    ]},
    { id: 'quads', view: 'front', label: '股四头肌', shapes: [
      { t: 'ellipse', cx: 68, cy: 168, rx: 15, ry: 30 },
      { t: 'ellipse', cx: 92, cy: 168, rx: 15, ry: 30 }
    ]},
    // ============ 背面 ============
    { id: 'traps', view: 'back', label: '斜方肌', shapes: [
      { t: 'path', d: 'M60,58 Q80,48 100,58 L96,78 Q80,86 64,78 Z' }
    ]},
    { id: 'rearDelts', view: 'back', label: '三角肌后束', shapes: [
      { t: 'ellipse', cx: 52, cy: 46, rx: 13, ry: 10 },
      { t: 'ellipse', cx: 108, cy: 46, rx: 13, ry: 10 }
    ]},
    { id: 'rhomboids', view: 'back', label: '菱形肌', shapes: [
      { t: 'path', d: 'M68,80 L80,76 L92,80 L88,98 L80,102 L72,98 Z' }
    ]},
    { id: 'lats', view: 'back', label: '背阔肌', shapes: [
      { t: 'path', d: 'M62,82 Q52,100 58,126 L76,132 Q72,104 78,84 Z' },
      { t: 'path', d: 'M98,82 Q108,100 102,126 L84,132 Q88,104 82,84 Z' }
    ]},
    { id: 'erectors', view: 'back', label: '竖脊肌', shapes: [
      { t: 'rect', x: 74, y: 100, w: 12, h: 38, r: 4 }
    ]},
    { id: 'triceps', view: 'back', label: '肱三头肌', shapes: [
      { t: 'ellipse', cx: 40, cy: 88, rx: 9, ry: 17 },
      { t: 'ellipse', cx: 120, cy: 88, rx: 9, ry: 17 }
    ]},
    { id: 'glutes', view: 'back', label: '臀大肌', shapes: [
      { t: 'ellipse', cx: 68, cy: 144, rx: 15, ry: 15 },
      { t: 'ellipse', cx: 92, cy: 144, rx: 15, ry: 15 }
    ]},
    { id: 'hamstrings', view: 'back', label: '腘绳肌', shapes: [
      { t: 'ellipse', cx: 68, cy: 178, rx: 14, ry: 28 },
      { t: 'ellipse', cx: 92, cy: 178, rx: 14, ry: 28 }
    ]},
    { id: 'calves', view: 'back', label: '小腿三头肌', shapes: [
      { t: 'ellipse', cx: 69, cy: 222, rx: 11, ry: 22 },
      { t: 'ellipse', cx: 91, cy: 222, rx: 11, ry: 22 }
    ]}
  ];

  // 人体的非肌肉基础轮廓（灰色底图，帮助定位）
  var OUTLINE = {
    front: [
      { t: 'circle', cx: 80, cy: 22, r: 14 },
      { t: 'rect', x: 74, y: 34, w: 12, h: 12, r: 3 },
      { t: 'path', d: 'M64,56 Q80,50 96,56 L100,140 Q80,148 60,140 Z' },
      { t: 'path', d: 'M52,108 L44,142 L52,144 L60,116 Z' },
      { t: 'path', d: 'M108,108 L116,142 L108,144 L100,116 Z' },
      { t: 'path', d: 'M62,198 L58,252 L70,252 L72,200 Z' },
      { t: 'path', d: 'M88,198 L92,252 L80,252 L78,200 Z' }
    ],
    back: [
      { t: 'circle', cx: 80, cy: 22, r: 14 },
      { t: 'rect', x: 74, y: 34, w: 12, h: 12, r: 3 },
      { t: 'path', d: 'M64,56 Q80,50 96,56 L100,140 Q80,148 60,140 Z' },
      { t: 'path', d: 'M52,108 L44,142 L52,144 L60,116 Z' },
      { t: 'path', d: 'M108,108 L116,142 L108,144 L100,116 Z' },
      { t: 'path', d: 'M62,198 L58,252 L70,252 L72,200 Z' },
      { t: 'path', d: 'M88,198 L92,252 L80,252 L78,200 Z' }
    ]
  };

  function shapeStr(s, fill, stroke) {
    var st = stroke ? ' stroke="' + stroke + '" stroke-width="1"' : '';
    var f = ' fill="' + fill + '"' + st;
    if (s.t === 'ellipse') return '<ellipse cx="' + s.cx + '" cy="' + s.cy + '" rx="' + s.rx + '" ry="' + s.ry + '"' + f + '/>';
    if (s.t === 'circle') return '<circle cx="' + s.cx + '" cy="' + s.cy + '" r="' + s.r + '"' + f + '/>';
    if (s.t === 'rect') return '<rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '" rx="' + s.r + '"' + f + '/>';
    if (s.t === 'path') return '<path d="' + s.d + '"' + f + '/>';
    return '';
  }

  function figureHTML(view, primary, second, xOffset) {
    var s = '<g transform="translate(' + xOffset + ',0)">';
    // 底图轮廓
    OUTLINE[view].forEach(function (o) { s += shapeStr(o, '#f1eef5', '#e2dcec'); });
    // 肌群
    MUSCLES.filter(function (m) { return m.view === view; }).forEach(function (m) {
      var color = BASE;
      if ((primary || []).indexOf(m.id) >= 0) color = PRIMARY;
      else if ((second || []).indexOf(m.id) >= 0) color = SECOND;
      m.shapes.forEach(function (sp) { s += shapeStr(sp, color, '#ffffff'); });
    });
    s += '</g>';
    return s;
  }

  // 生成完整人体图 SVG
  // primary: 主发力肌群 ID 数组；second: 协同肌群 ID 数组
  function render(primary, second) {
    return '<svg viewBox="0 0 320 270" width="100%" style="max-width:340px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="52" y="14" text-anchor="middle" font-size="11" fill="#8b8498">正面</text>' +
      '<text x="212" y="14" text-anchor="middle" font-size="11" fill="#8b8498">背面</text>' +
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
