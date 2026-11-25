/* ============================================================
 * lib.js —— 预置动作库 + 计算工具
 * 动作按「部位 + 器械」二维组织，沿用你的乐刻训练计划。
 * MET = 代谢当量，用于估算卡路里。
 * v2: 增加 muscles(主肌群) / synergists(协同肌群) / error(常见错误) / video(教程搜索词)
 * ============================================================ */
(function (global) {
  'use strict';

  var PARTS = ['核心', '臀腿', '背', '手臂', '肩颈体态', '有氧'];
  var EQUIPMENT = ['徒手', '瑜伽垫', '哑铃', '杠铃', '龙门架', '固定器械', '有氧器械'];

  // 肌群 ID → 中文名（与 anatomy.js 一致）
  var MUSCLE_NAMES = {
    frontDelts: '三角肌前束', chest: '胸大肌', biceps: '肱二头肌', forearms: '前臂肌群',
    abs: '腹直肌', obliques: '腹斜肌', transverse: '腹横肌', quads: '股四头肌',
    traps: '斜方肌', rearDelts: '三角肌后束', rhomboids: '菱形肌', lats: '背阔肌',
    erectors: '竖脊肌', triceps: '肱三头肌', glutes: '臀大肌', hamstrings: '腘绳肌', calves: '小腿三头肌'
  };

  // 预置动作库
  // parts: 粗部位标签（用于报告聚合）；muscles: 主发力肌群 ID；synergists: 协同肌群 ID
  var PRESET = [
    // 核心
    { id: 'e001', name: '死虫式 Dead Bug', parts: ['核心'], equipment: '瑜伽垫', met: 3.2, cue: '仰卧，四肢朝天，对侧手脚缓慢放下，后腰始终贴地', muscles: ['transverse', 'abs'], synergists: [], error: '后腰拱起离地；手脚放得太快借力', video: '死虫式 标准动作' },
    { id: 'e002', name: '前臂侧平板 Side Plank', parts: ['核心'], equipment: '瑜伽垫', met: 3.5, cue: '肘在肩正下方，髋部抬起成一条直线，腰别塌', muscles: ['obliques', 'transverse'], synergists: ['glutes'], error: '胯往下掉；肩膀塌下来压关节', video: '侧平板支撑 标准动作' },
    { id: 'e003', name: '空心保持 Hollow Hold', parts: ['核心'], equipment: '瑜伽垫', met: 3.8, cue: '仰卧手足离地约10cm，后腰紧贴地面；腰离地就屈膝降难度', muscles: ['abs'], synergists: ['transverse'], error: '后腰离地；憋气', video: '空心保持 标准动作' },
    { id: 'e004', name: '绳索伐木式 Woodchopper', parts: ['核心'], equipment: '龙门架', met: 4.2, cue: '双手握绳，从高处斜向下方旋转切砍，感受腰侧发力，控制回放', muscles: ['obliques'], synergists: ['abs', 'lats'], error: '只动手臂不转体；回放太快', video: '绳索伐木式 标准动作' },
    { id: 'e005', name: '前臂平板 Forearm Plank', parts: ['核心'], equipment: '瑜伽垫', met: 3.3, cue: '前臂着地，身体成板，收腹夹臀；手腕不适者的友好替代', muscles: ['transverse', 'abs'], synergists: ['glutes'], error: '塌腰或撅屁股；憋气', video: '平板支撑 标准动作' },
    // 臀腿
    { id: 'e006', name: '臀桥 Glute Bridge', parts: ['臀腿'], equipment: '瑜伽垫', met: 4.0, cue: '仰卧屈膝，脚跟着地顶髋，顶端夹臀停1秒，膝盖不内扣', muscles: ['glutes'], synergists: ['hamstrings'], error: '用腰顶而不是夹臀；膝盖内扣', video: '臀桥 标准动作' },
    { id: 'e007', name: '杠铃臀推 Hip Thrust', parts: ['臀腿'], equipment: '杠铃', met: 5.0, cue: '肩靠凳，杠铃置于髋部，顶髋到身体成直线，下巴微收', muscles: ['glutes'], synergists: ['hamstrings'], error: '顶峰没夹臀；下巴抬太高', video: '杠铃臀推 标准动作' },
    { id: 'e008', name: '绳索后踢腿 Cable Kickback', parts: ['臀腿'], equipment: '龙门架', met: 4.2, cue: '踝套绳索，向后上方踢腿，顶端夹臀，控制回放', muscles: ['glutes'], synergists: ['hamstrings'], error: '身体跟着晃；腰椎代偿', video: '绳索后踢腿 标准动作' },
    { id: 'e009', name: '徒手深蹲 Air Squat', parts: ['臀腿'], equipment: '徒手', met: 4.5, cue: '膝盖方向对齐脚尖，臀部后坐，膝盖不适则减小幅度或改臀桥', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '膝盖内扣；脚跟离地', video: '徒手深蹲 标准动作' },
    // 背
    { id: 'e010', name: '高位下拉 Lat Pulldown', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '宽握，肩胛先下沉，把杆拉向锁骨，胸微挺不后仰', muscles: ['lats'], synergists: ['biceps', 'rhomboids'], error: '耸肩；身体后仰借力', video: '高位下拉 标准动作' },
    { id: 'e011', name: '面拉 Face Pull', parts: ['背', '肩颈体态'], equipment: '龙门架', met: 3.5, cue: '绳拉向面部，肘高于腕，肩胛后收，改善圆肩', muscles: ['rearDelts', 'rhomboids'], synergists: ['traps'], error: '耸肩；肘低于手腕', video: '面拉 标准动作' },
    { id: 'e012', name: '坐姿划船 Seated Cable Row', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '挺胸，肩胛后收把把手拉向腹部，别耸肩', muscles: ['lats', 'rhomboids'], synergists: ['biceps'], error: '耸肩；身体大幅后仰', video: '坐姿划船 标准动作' },
    { id: 'e013', name: '单臂哑铃划船 Dumbbell Row', parts: ['背'], equipment: '哑铃', met: 4.5, cue: '一手撑凳，背部平直，肘沿身体向后拉', muscles: ['lats'], synergists: ['biceps', 'rhomboids'], error: '背部弓起；耸肩', video: '单臂哑铃划船 标准动作' },
    // 手臂
    { id: 'e014', name: '绳索下压 Tricep Pushdown', parts: ['手臂'], equipment: '龙门架', met: 3.8, cue: '大臂夹紧身侧不动，前臂下压伸直，顶峰收缩肱三头', muscles: ['triceps'], synergists: [], error: '大臂跟着动；耸肩', video: '绳索下压 标准动作' },
    { id: 'e015', name: '锤式弯举 Hammer Curl', parts: ['手臂'], equipment: '哑铃', met: 3.5, cue: '掌心相对，大臂不动，只弯前臂，练肱肌让手臂紧致', muscles: ['biceps'], synergists: ['forearms'], error: '借力甩；大臂前移', video: '锤式弯举 标准动作' },
    { id: 'e016', name: '哑铃弯举 Dumbbell Curl', parts: ['手臂'], equipment: '哑铃', met: 3.5, cue: '大臂贴身，缓慢弯举，下放控制，别借力甩', muscles: ['biceps'], synergists: [], error: '借力甩；身体后仰', video: '哑铃弯举 标准动作' },
    // 肩颈体态
    { id: 'e017', name: '靠墙滑动 Wall Slide', parts: ['肩颈体态'], equipment: '徒手', met: 2.8, cue: '背靠墙，手臂贴墙上下滑动，始终不离开墙面，开肩改善体态', muscles: ['traps', 'rearDelts'], synergists: ['rhomboids'], error: '手臂离开墙面；耸肩', video: '靠墙滑动 标准动作' },
    { id: 'e018', name: '超人式 Superman', parts: ['背', '肩颈体态'], equipment: '瑜伽垫', met: 3.0, cue: '俯卧，同时对侧手脚抬起，停留1秒，强化竖脊肌', muscles: ['erectors'], synergists: ['glutes', 'traps'], error: '猛地抬起；憋气', video: '超人式 标准动作' },
    { id: 'e019', name: '反向飞鸟 Reverse Fly', parts: ['肩颈体态'], equipment: '哑铃', met: 3.5, cue: '俯身，手臂微弯向两侧打开，感受肩胛后收，别耸肩', muscles: ['rearDelts', 'rhomboids'], synergists: ['traps'], error: '耸肩；用惯性甩', video: '反向飞鸟 标准动作' },
    // 有氧
    { id: 'e020', name: '低冲击有氧操 Low Impact', parts: ['有氧'], equipment: '徒手', met: 6.0, cue: '全程至少一只脚着地，开合步代替开合跳，膝盖不适首选', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '脚离地跳跃；急停扭转', video: '低冲击有氧操 膝盖友好' },
    { id: 'e021', name: '快走 Brisk Walking', parts: ['有氧'], equipment: '徒手', met: 4.3, cue: '步速到微喘但能说话，摆臂，鞋底缓冲好；降皮质醇、利于消腰腹', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '步幅过大；含胸', video: '快走 正确姿势' },
    { id: 'e022', name: '椭圆机 Elliptical', parts: ['有氧'], equipment: '有氧器械', met: 5.5, cue: '膝盖友好，阻力适中，节奏均匀，适合作为有氧操的替代', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '身体后仰；阻力过大', video: '椭圆机 正确姿势' }
  ];

  // 卡路里估算：MET × 体重(kg) × 时长(小时)
  function estimateKcal(met, weightKg, minutes) {
    if (!met || !weightKg || !minutes) return 0;
    return Math.round(met * weightKg * (minutes / 60));
  }

  function calcWorkout(items, weightKg) {
    var totalMin = 0, totalKcal = 0;
    var partCount = {};
    items.forEach(function (it) {
      totalMin += Number(it.minutes) || 0;
      totalKcal += estimateKcal(Number(it.met), weightKg, Number(it.minutes));
      (it.parts || []).forEach(function (p) {
        partCount[p] = (partCount[p] || 0) + 1;
      });
    });
    var partPct = [];
    var totalTags = Object.keys(partCount).reduce(function (s, k) { return s + partCount[k]; }, 0);
    Object.keys(partCount).forEach(function (p) {
      partPct.push({ part: p, count: partCount[p], pct: totalTags ? Math.round(partCount[p] / totalTags * 100) : 0 });
    });
    partPct.sort(function (a, b) { return b.count - a.count; });
    return { totalMinutes: totalMin, estimatedKcal: totalKcal, partPct: partPct };
  }

  function calcWHR(waist, hip) {
    waist = Number(waist); hip = Number(hip);
    if (!waist || !hip) return null;
    return Math.round((waist / hip) * 100) / 100;
  }

  // 合并老数据：用户本地已存的动作可能没有 muscles 字段，按 id 从 PRESET 补齐
  function enrich(dbLib) {
    var lib = (dbLib && dbLib.length) ? dbLib : PRESET;
    return lib.map(function (e) {
      var base = PRESET.find(function (p) { return p.id === e.id; }) || {};
      return {
        id: e.id, name: e.name, parts: e.parts || base.parts || [],
        equipment: e.equipment || base.equipment || '徒手', met: e.met || base.met || 3,
        cue: e.cue || base.cue || '',
        muscles: e.muscles || base.muscles || [],
        synergists: e.synergists || base.synergists || [],
        error: e.error || base.error || '',
        video: e.video || base.video || e.name
      };
    });
  }

  global.Lib = {
    PARTS: PARTS, EQUIPMENT: EQUIPMENT, MUSCLE_NAMES: MUSCLE_NAMES, PRESET: PRESET,
    estimateKcal: estimateKcal, calcWorkout: calcWorkout, calcWHR: calcWHR, enrich: enrich
  };
})(window);
