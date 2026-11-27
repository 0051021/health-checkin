/* ============================================================
 * lib.js —— 预置动作库 + 计算工具
 * 按「部位 + 器械」二维组织，覆盖乐刻常见训练场景。
 * MET = 代谢当量，用于估算卡路里。
 * v3: 扩充至 85+ 动作；muscles(主肌群)/synergists(协同)/error(常见错误)/video(教程搜索词)
 * ============================================================ */
(function (global) {
  'use strict';

  var PARTS = ['核心', '臀腿', '背', '手臂', '肩颈体态', '有氧'];
  var EQUIPMENT = ['徒手', '瑜伽垫', '哑铃', '杠铃', '龙门架', '固定器械', '有氧器械'];

  var MUSCLE_NAMES = {
    frontDelts: '三角肌前束', chest: '胸大肌', biceps: '肱二头肌', forearms: '前臂肌群',
    abs: '腹直肌', obliques: '腹斜肌', transverse: '腹横肌/腰侧', quads: '股四头肌',
    traps: '斜方肌', rearDelts: '三角肌后束', rhomboids: '菱形肌', lats: '背阔肌',
    erectors: '竖脊肌', triceps: '肱三头肌', glutes: '臀大肌', hamstrings: '腘绳肌', calves: '小腿三头肌'
  };

  // parts: 粗部位标签（报告聚合用）；muscles: 主发力肌群 ID；synergists: 协同肌群 ID
  var PRESET = [
    /* ========== 核心 · 基础 5 ========== */
    { id: 'e001', name: '死虫式 Dead Bug', parts: ['核心'], equipment: '瑜伽垫', met: 3.2, cue: '仰卧，四肢朝天，对侧手脚缓慢放下，后腰始终贴地', muscles: ['transverse', 'abs'], synergists: [], error: '后腰拱起离地；手脚放得太快借力', video: '死虫式 标准动作' },
    { id: 'e002', name: '前臂侧平板 Side Plank', parts: ['核心'], equipment: '瑜伽垫', met: 3.5, cue: '肘在肩正下方，髋部抬起成一条直线，腰别塌', muscles: ['obliques', 'transverse'], synergists: ['glutes'], error: '胯往下掉；肩膀塌下来压关节', video: '侧平板支撑 标准动作' },
    { id: 'e003', name: '空心保持 Hollow Hold', parts: ['核心'], equipment: '瑜伽垫', met: 3.8, cue: '仰卧手足离地约10cm，后腰紧贴地面；腰离地就屈膝降难度', muscles: ['abs'], synergists: ['transverse'], error: '后腰离地；憋气', video: '空心保持 标准动作' },
    { id: 'e004', name: '绳索伐木式 Woodchopper', parts: ['核心'], equipment: '龙门架', met: 4.2, cue: '双手握绳，从高处斜向下方旋转切砍，感受腰侧发力，控制回放', muscles: ['obliques'], synergists: ['abs', 'lats'], error: '只动手臂不转体；回放太快', video: '绳索伐木式 标准动作' },
    { id: 'e005', name: '前臂平板 Forearm Plank', parts: ['核心'], equipment: '瑜伽垫', met: 3.3, cue: '前臂着地，身体成板，收腹夹臀；手腕不适者的友好替代', muscles: ['transverse', 'abs'], synergists: ['glutes'], error: '塌腰或撅屁股；憋气', video: '平板支撑 标准动作' },

    /* ========== 核心 · 进阶 12 ========== */
    { id: 'e023', name: '卷腹 Crunch', parts: ['核心'], equipment: '瑜伽垫', met: 3.0, cue: '仰卧屈膝，肩胛骨卷离地面，下巴与胸口留一拳，呼气时卷起', muscles: ['abs'], synergists: [], error: '双手抱头拽脖子；幅度过大', video: '卷腹 标准动作' },
    { id: 'e024', name: '反向卷腹 Reverse Crunch', parts: ['核心'], equipment: '瑜伽垫', met: 3.2, cue: '仰卧，双手置体侧，屈膝把骨盆向上卷起，下腹发力', muscles: ['abs'], synergists: [], error: '用惯性甩腿；腰部离地借力', video: '反向卷腹 标准动作' },
    { id: 'e025', name: '悬垂举腿 Hanging Knee Raise', parts: ['核心'], equipment: '固定器械', met: 4.5, cue: '悬挂于器械，屈膝抬膝向胸口，控制下放不晃', muscles: ['abs'], synergists: ['forearms'], error: '身体前后摆荡借力；耸肩', video: '悬垂举腿 标准动作' },
    { id: 'e026', name: '俄罗斯转体 Russian Twist', parts: ['核心'], equipment: '瑜伽垫', met: 3.6, cue: '坐稳身体后倾，双手持物左右转体，感受腰侧拧转', muscles: ['obliques'], synergists: ['abs'], error: '只转手臂不转躯干；弓背', video: '俄罗斯转体 标准动作' },
    { id: 'e027', name: '鸟狗式 Bird Dog', parts: ['核心'], equipment: '瑜伽垫', met: 2.8, cue: '四点跪撑，对侧手脚伸直，骨盆保持稳定不左右晃', muscles: ['transverse', 'erectors'], synergists: ['glutes'], error: '塌腰；抬起过高失去平衡', video: '鸟狗式 标准动作' },
    { id: 'e028', name: '平板肩触碰 Plank Shoulder Tap', parts: ['核心'], equipment: '瑜伽垫', met: 3.8, cue: '前臂平板姿势，交替用手触碰对侧肩，髋部不左右晃', muscles: ['abs', 'transverse'], synergists: ['frontDelts'], error: '屁股左右摆；塌腰', video: '平板支撑肩触碰 标准动作' },
    { id: 'e029', name: '绳索卷腹 Cable Crunch', parts: ['核心'], equipment: '龙门架', met: 3.8, cue: '跪姿双手握绳于头侧，呼气时脊柱向下卷，腹部收缩', muscles: ['abs'], synergists: [], error: '用腰发力；髋部前后移动', video: '绳索卷腹 标准动作' },
    { id: 'e030', name: '帕洛夫推 Pallof Press', parts: ['核心'], equipment: '龙门架', met: 3.4, cue: '侧身站，双手握绳于胸前推出，身体抗旋转保持正面朝前', muscles: ['obliques', 'transverse'], synergists: ['abs'], error: '身体跟着绳子转；耸肩', video: '帕洛夫推 抗旋转 标准动作' },
    { id: 'e031', name: '侧平板抬腿 Side Plank Leg Lift', parts: ['核心', '臀腿'], equipment: '瑜伽垫', met: 4.0, cue: '侧平板姿势，上侧腿缓慢抬起再落下，全程髋部不塌', muscles: ['obliques', 'glutes'], synergists: [], error: '髋部下沉；速度过快', video: '侧平板抬腿 标准动作' },
    { id: 'e032', name: '死虫式抬腿 Dead Bug Leg Lift', parts: ['核心'], equipment: '瑜伽垫', met: 3.4, cue: '仰卧四肢朝天，单腿缓慢下放至腰即将离地时收回，交替进行', muscles: ['transverse'], synergists: ['abs'], error: '后腰离地；下放过快', video: '死虫式进阶 标准动作' },
    { id: 'e033', name: '登山跑 Mountain Climber', parts: ['核心', '有氧'], equipment: '瑜伽垫', met: 6.0, cue: '俯撑姿势，交替提膝向胸口，核心收紧；膝盖不适改慢速踏步', muscles: ['abs', 'quads'], synergists: ['frontDelts'], error: '塌腰；膝盖不适仍高速做', video: '登山跑 标准动作 膝盖友好' },
    { id: 'e034', name: '农夫行走 Farmer Walk', parts: ['核心', '手臂'], equipment: '哑铃', met: 4.5, cue: '双手持哑铃垂于体侧，挺胸收腹匀速行走，身体不左右晃', muscles: ['transverse', 'forearms'], synergists: ['traps'], error: '耸肩；含胸弓背', video: '农夫行走 标准动作' },

    /* ========== 臀腿 · 基础 4 ========== */
    { id: 'e006', name: '臀桥 Glute Bridge', parts: ['臀腿'], equipment: '瑜伽垫', met: 4.0, cue: '仰卧屈膝，脚跟着地顶髋，顶端夹臀停1秒，膝盖不内扣', muscles: ['glutes'], synergists: ['hamstrings'], error: '用腰顶而不是夹臀；膝盖内扣', video: '臀桥 标准动作' },
    { id: 'e007', name: '杠铃臀推 Hip Thrust', parts: ['臀腿'], equipment: '杠铃', met: 5.0, cue: '肩靠凳，杠铃置于髋部，顶髋到身体成直线，下巴微收', muscles: ['glutes'], synergists: ['hamstrings'], error: '顶峰没夹臀；下巴抬太高', video: '杠铃臀推 标准动作' },
    { id: 'e008', name: '绳索后踢腿 Cable Kickback', parts: ['臀腿'], equipment: '龙门架', met: 4.2, cue: '踝套绳索，向后上方踢腿，顶端夹臀，控制回放', muscles: ['glutes'], synergists: ['hamstrings'], error: '身体跟着晃；腰椎代偿', video: '绳索后踢腿 标准动作' },
    { id: 'e009', name: '徒手深蹲 Air Squat', parts: ['臀腿'], equipment: '徒手', met: 4.5, cue: '膝盖方向对齐脚尖，臀部后坐，膝盖不适则减小幅度或改臀桥', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '膝盖内扣；脚跟离地', video: '徒手深蹲 标准动作' },

    /* ========== 臀腿 · 进阶 14 ========== */
    { id: 'e035', name: '罗马尼亚硬拉 Romanian Deadlift', parts: ['臀腿'], equipment: '哑铃', met: 4.8, cue: '微屈膝，臀部后移，哑铃贴腿下放至膝下，感受腘绳肌拉伸后顶髋起身', muscles: ['hamstrings', 'glutes'], synergists: ['erectors'], error: '弓背；哑铃离身体太远', video: '罗马尼亚硬拉 标准动作' },
    { id: 'e036', name: '杠铃深蹲 Barbell Squat', parts: ['臀腿'], equipment: '杠铃', met: 5.5, cue: '杠铃置于上背，臀后坐下蹲至大腿平行，膝盖对齐脚尖，起身顶髋', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '膝盖内扣；起身时先抬臀', video: '杠铃深蹲 标准动作' },
    { id: 'e037', name: '保加利亚分腿蹲 Bulgarian Split Squat', parts: ['臀腿'], equipment: '哑铃', met: 5.0, cue: '后脚搭凳，前脚掌踩实，垂直下蹲后起身；膝盖不适降低幅度', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '前膝内扣；身体前倾过多', video: '保加利亚分腿蹲 标准动作' },
    { id: 'e038', name: '腿举 Leg Press', parts: ['臀腿'], equipment: '固定器械', met: 5.0, cue: '坐稳踏板，双脚与肩同宽，下放至膝盖约90度，蹬起时不锁死膝盖', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '臀部离开座椅；膝盖锁死', video: '腿举 标准动作' },
    { id: 'e039', name: '绳索髋外展 Cable Hip Abduction', parts: ['臀腿'], equipment: '龙门架', met: 4.0, cue: '踝套绳索，腿向侧上方打开，顶端感受臀侧收缩，控制回放', muscles: ['glutes'], synergists: [], error: '身体侧倾借力；幅度过大', video: '绳索髋外展 标准动作' },
    { id: 'e040', name: '蚌式开合 Clamshell', parts: ['臀腿'], equipment: '瑜伽垫', met: 3.0, cue: '侧卧屈膝，双脚并拢，膝盖像蚌壳一样打开，骨盆不后倒', muscles: ['glutes'], synergists: [], error: '骨盆向后翻；幅度太大', video: '蚌式开合 标准动作' },
    { id: 'e041', name: '侧卧抬腿 Side Lying Leg Raise', parts: ['臀腿'], equipment: '瑜伽垫', met: 3.2, cue: '侧卧，上侧腿伸直缓慢抬起约30度，脚尖略向下，控制下落', muscles: ['glutes'], synergists: [], error: '腿抬过高用腰代偿；速度过快', video: '侧卧抬腿 标准动作' },
    { id: 'e042', name: '单腿臀桥 Single Leg Glute Bridge', parts: ['臀腿'], equipment: '瑜伽垫', met: 4.2, cue: '仰卧单脚踩地，另一腿伸直，顶髋起身，骨盆保持水平', muscles: ['glutes'], synergists: ['hamstrings'], error: '骨盆歪斜；腰部代偿', video: '单腿臀桥 标准动作' },
    { id: 'e043', name: '腿弯举 Leg Curl', parts: ['臀腿'], equipment: '固定器械', met: 4.0, cue: '俯卧器械，脚踝勾住滚垫，屈膝把滚垫拉向臀部，控制回放', muscles: ['hamstrings'], synergists: ['glutes'], error: '臀部抬起；速度过快', video: '腿弯举 标准动作' },
    { id: 'e044', name: '腿屈伸 Leg Extension', parts: ['臀腿'], equipment: '固定器械', met: 4.0, cue: '坐姿，小腿贴滚垫伸直膝盖，顶端停1秒，缓慢下放', muscles: ['quads'], synergists: [], error: '膝盖锁死猛顶；身体后仰', video: '腿屈伸 标准动作' },
    { id: 'e045', name: '提踵 Calf Raise', parts: ['臀腿'], equipment: '固定器械', met: 3.5, cue: '前脚掌踩踏板，脚跟下沉后尽量踮起，顶端停1秒', muscles: ['calves'], synergists: [], error: '借力弹跳；幅度太小', video: '提踵 标准动作' },
    { id: 'e046', name: '史密斯深蹲 Smith Machine Squat', parts: ['臀腿'], equipment: '固定器械', met: 5.0, cue: '背靠史密斯杠，双脚略前站，臀后坐下蹲，轨迹稳定适合膝盖不适者', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '脚站太靠里；膝盖内扣', video: '史密斯深蹲 标准动作' },
    { id: 'e047', name: '相扑硬拉 Sumo Deadlift', parts: ['臀腿'], equipment: '杠铃', met: 5.5, cue: '宽站距，双手握杠于两腿之间，挺胸顶髋起身，感受大腿内侧和臀发力', muscles: ['glutes', 'quads'], synergists: ['hamstrings'], error: '弓背；起身时先抬臀', video: '相扑硬拉 标准动作' },
    { id: 'e048', name: '台阶踏步 Step Up', parts: ['臀腿'], equipment: '哑铃', met: 4.8, cue: '手持哑铃，一脚踩上台阶，前腿发力起身，后脚跟上；膝盖不适减小台阶高度', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '后腿蹬地借力；身体前倾', video: '台阶踏步 标准动作' },

    /* ========== 背 · 基础 4 ========== */
    { id: 'e010', name: '高位下拉 Lat Pulldown', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '宽握，肩胛先下沉，把杆拉向锁骨，胸微挺不后仰', muscles: ['lats'], synergists: ['biceps', 'rhomboids'], error: '耸肩；身体后仰借力', video: '高位下拉 标准动作' },
    { id: 'e011', name: '面拉 Face Pull', parts: ['背', '肩颈体态'], equipment: '龙门架', met: 3.5, cue: '绳拉向面部，肘高于腕，肩胛后收，改善圆肩', muscles: ['rearDelts', 'rhomboids'], synergists: ['traps'], error: '耸肩；肘低于手腕', video: '面拉 标准动作' },
    { id: 'e012', name: '坐姿划船 Seated Cable Row', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '挺胸，肩胛后收把把手拉向腹部，别耸肩', muscles: ['lats', 'rhomboids'], synergists: ['biceps'], error: '耸肩；身体大幅后仰', video: '坐姿划船 标准动作' },
    { id: 'e013', name: '单臂哑铃划船 Dumbbell Row', parts: ['背'], equipment: '哑铃', met: 4.5, cue: '一手撑凳，背部平直，肘沿身体向后拉', muscles: ['lats'], synergists: ['biceps', 'rhomboids'], error: '背部弓起；耸肩', video: '单臂哑铃划船 标准动作' },

    /* ========== 背 · 进阶 12 ========== */
    { id: 'e049', name: '辅助引体向上 Assisted Pull-up', parts: ['背', '手臂'], equipment: '固定器械', met: 5.0, cue: '膝盖置于辅助垫，宽握，肩胛下沉把身体拉向上，控制下降', muscles: ['lats'], synergists: ['biceps', 'rhomboids'], error: '耸肩；借力蹬腿', video: '辅助引体向上 标准动作' },
    { id: 'e050', name: '窄握高位下拉 Close Grip Pulldown', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '窄握，拉时肘部贴近身体向后，感受下背和背阔下部发力', muscles: ['lats'], synergists: ['biceps'], error: '耸肩；身体后仰', video: '窄握高位下拉 标准动作' },
    { id: 'e051', name: '对握高位下拉 Neutral Grip Pulldown', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '双手对握，拉向锁骨，肘向后下方，对肩更友好', muscles: ['lats'], synergists: ['biceps', 'rhomboids'], error: '耸肩；拉不到锁骨', video: '对握高位下拉 标准动作' },
    { id: 'e052', name: 'T杠划船 T-Bar Row', parts: ['背'], equipment: '杠铃', met: 5.0, cue: '俯身胸贴垫，双手握T杠，肘沿身体向后拉，肩胛收紧', muscles: ['lats', 'rhomboids'], synergists: ['biceps'], error: '弓背；耸肩', video: 'T杠划船 标准动作' },
    { id: 'e053', name: '杠铃俯身划船 Barbell Row', parts: ['背'], equipment: '杠铃', met: 5.0, cue: '屈髋俯身背平直，杠铃拉向下胸，肘向后，控制下放', muscles: ['lats', 'rhomboids'], synergists: ['biceps', 'erectors'], error: '弓背；身体随重量起伏', video: '杠铃划船 标准动作' },
    { id: 'e054', name: '窄握坐姿划船 Close Grip Row', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '挺胸窄握，肘贴身后拉，肩胛夹紧停留1秒', muscles: ['rhomboids', 'lats'], synergists: ['biceps'], error: '耸肩；身体后仰借力', video: '窄握坐姿划船 标准动作' },
    { id: 'e055', name: '直臂下压 Straight Arm Pulldown', parts: ['背'], equipment: '龙门架', met: 4.0, cue: '面对龙门架，手臂微屈保持不变，用背阔肌把杆压至大腿前', muscles: ['lats'], synergists: [], error: '屈肘变成下拉；身体后仰', video: '直臂下压 标准动作' },
    { id: 'e056', name: '单臂绳索划船 Single Arm Cable Row', parts: ['背'], equipment: '龙门架', met: 4.5, cue: '单手握绳，肩胛后收把绳拉向腰侧，身体保持正对前方', muscles: ['lats'], synergists: ['biceps', 'rhomboids'], error: '身体跟着转；耸肩', video: '单臂绳索划船 标准动作' },
    { id: 'e057', name: '俯卧划船 Prone Row', parts: ['背', '肩颈体态'], equipment: '瑜伽垫', met: 3.2, cue: '俯卧，双臂张开，肘向后夹肩胛抬起上身，停留1秒', muscles: ['rhomboids', 'traps'], synergists: ['rearDelts'], error: '猛地抬起；颈部过度后仰', video: '俯卧划船 标准动作' },
    { id: 'e058', name: '背部伸展 Back Extension', parts: ['背'], equipment: '固定器械', met: 3.8, cue: '俯卧于伸展凳，用下背和臀把上身抬起至与腿成直线，控制下降', muscles: ['erectors', 'glutes'], synergists: [], error: '过度后仰；速度过快', video: '背部伸展 标准动作' },
    { id: 'e059', name: '宽握坐姿划船 Wide Grip Row', parts: ['背'], equipment: '固定器械', met: 4.5, cue: '宽握，拉时肘向两侧展开，感受上背和肩胛后收', muscles: ['rhomboids', 'lats'], synergists: ['biceps'], error: '耸肩；只用手臂拉', video: '宽握坐姿划船 标准动作' },
    { id: 'e060', name: '哑铃耸肩 Dumbbell Shrug', parts: ['背', '肩颈体态'], equipment: '哑铃', met: 3.5, cue: '手持哑铃垂于体侧，肩向上耸起停顿，再缓慢下沉', muscles: ['traps'], synergists: [], error: '耸肩时转肩；借力甩', video: '哑铃耸肩 标准动作' },

    /* ========== 手臂 · 基础 3 ========== */
    { id: 'e014', name: '绳索下压 Tricep Pushdown', parts: ['手臂'], equipment: '龙门架', met: 3.8, cue: '大臂夹紧身侧不动，前臂下压伸直，顶峰收缩肱三头', muscles: ['triceps'], synergists: [], error: '大臂跟着动；耸肩', video: '绳索下压 标准动作' },
    { id: 'e015', name: '锤式弯举 Hammer Curl', parts: ['手臂'], equipment: '哑铃', met: 3.5, cue: '掌心相对，大臂不动，只弯前臂，练肱肌让手臂紧致', muscles: ['biceps'], synergists: ['forearms'], error: '借力甩；大臂前移', video: '锤式弯举 标准动作' },
    { id: 'e016', name: '哑铃弯举 Dumbbell Curl', parts: ['手臂'], equipment: '哑铃', met: 3.5, cue: '大臂贴身，缓慢弯举，下放控制，别借力甩', muscles: ['biceps'], synergists: [], error: '借力甩；身体后仰', video: '哑铃弯举 标准动作' },

    /* ========== 手臂 · 进阶 10 ========== */
    { id: 'e061', name: '绳索锤式弯举 Cable Hammer Curl', parts: ['手臂'], equipment: '龙门架', met: 3.6, cue: '对握绳索，大臂贴身不动，前臂弯举，持续张力', muscles: ['biceps', 'forearms'], synergists: [], error: '大臂前移；借力甩', video: '绳索锤式弯举 标准动作' },
    { id: 'e062', name: '牧师凳弯举 Preacher Curl', parts: ['手臂'], equipment: '固定器械', met: 3.5, cue: '大臂搭在牧师凳上，弯举至顶峰停1秒，缓慢下放', muscles: ['biceps'], synergists: [], error: '身体离凳；下放过快', video: '牧师凳弯举 标准动作' },
    { id: 'e063', name: '集中弯举 Concentration Curl', parts: ['手臂'], equipment: '哑铃', met: 3.4, cue: '坐姿，肘撑膝内侧，弯举时把哑铃朝肩膀方向举，顶峰收紧', muscles: ['biceps'], synergists: [], error: '肘部离开支撑；借力', video: '集中弯举 标准动作' },
    { id: 'e064', name: '过顶臂屈伸 Overhead Tricep Extension', parts: ['手臂'], equipment: '哑铃', met: 3.5, cue: '双手持哑铃举过头顶，肘贴近耳侧，屈肘下放后伸直', muscles: ['triceps'], synergists: [], error: '肘外展；耸肩', video: '过顶臂屈伸 标准动作' },
    { id: 'e065', name: '绳索过顶臂屈伸 Cable Overhead Extension', parts: ['手臂'], equipment: '龙门架', met: 3.6, cue: '背对龙门架，双手持绳过顶，肘固定伸直前臂', muscles: ['triceps'], synergists: [], error: '肘跟着动；身体前倾', video: '绳索过顶臂屈伸 标准动作' },
    { id: 'e066', name: '窄距俯卧撑 Close Grip Push-up', parts: ['手臂'], equipment: '瑜伽垫', met: 4.0, cue: '双手窄距撑地，肘贴近身体后屈，推起时发力于三头；手腕不适握拳撑', muscles: ['triceps'], synergists: ['chest', 'frontDelts'], error: '肘外展；塌腰', video: '窄距俯卧撑 标准动作' },
    { id: 'e067', name: '凳上反屈伸 Bench Dip', parts: ['手臂'], equipment: '徒手', met: 3.8, cue: '背对凳子双手撑边，屈肘下沉至90度后推起，肩保持下沉', muscles: ['triceps'], synergists: [], error: '下沉过深伤肩；耸肩', video: '凳上反屈伸 标准动作' },
    { id: 'e068', name: '反向弯举 Reverse Curl', parts: ['手臂'], equipment: '哑铃', met: 3.2, cue: '掌心向下握哑铃，大臂不动弯举，练前臂和肱肌', muscles: ['forearms', 'biceps'], synergists: [], error: '手腕翻折；借力甩', video: '反向弯举 标准动作' },
    { id: 'e069', name: '腕弯举 Wrist Curl', parts: ['手臂'], equipment: '哑铃', met: 2.5, cue: '坐姿前臂搭膝，掌心向上握哑铃，只用手腕向上卷起', muscles: ['forearms'], synergists: [], error: '前臂跟着抬；幅度太小', video: '腕弯举 标准动作' },
    { id: 'e070', name: '绳索弯举 Cable Curl', parts: ['手臂'], equipment: '龙门架', met: 3.5, cue: '面对龙门架握杆，大臂贴身，弯举至顶峰停1秒，缓慢下放', muscles: ['biceps'], synergists: [], error: '身体后仰借力；大臂前移', video: '绳索弯举 标准动作' },

    /* ========== 肩颈体态 · 基础 3 ========== */
    { id: 'e017', name: '靠墙滑动 Wall Slide', parts: ['肩颈体态'], equipment: '徒手', met: 2.8, cue: '背靠墙，手臂贴墙上下滑动，始终不离开墙面，开肩改善体态', muscles: ['traps', 'rearDelts'], synergists: ['rhomboids'], error: '手臂离开墙面；耸肩', video: '靠墙滑动 标准动作' },
    { id: 'e018', name: '超人式 Superman', parts: ['背', '肩颈体态'], equipment: '瑜伽垫', met: 3.0, cue: '俯卧，同时对侧手脚抬起，停留1秒，强化竖脊肌', muscles: ['erectors'], synergists: ['glutes', 'traps'], error: '猛地抬起；憋气', video: '超人式 标准动作' },
    { id: 'e019', name: '反向飞鸟 Reverse Fly', parts: ['肩颈体态'], equipment: '哑铃', met: 3.5, cue: '俯身，手臂微弯向两侧打开，感受肩胛后收，别耸肩', muscles: ['rearDelts', 'rhomboids'], synergists: ['traps'], error: '耸肩；用惯性甩', video: '反向飞鸟 标准动作' },

    /* ========== 肩颈体态 · 进阶 10 ========== */
    { id: 'e071', name: '哑铃肩推 Dumbbell Shoulder Press', parts: ['肩颈体态'], equipment: '哑铃', met: 4.5, cue: '坐姿，哑铃推举过头顶至手臂伸直，缓慢下放至耳侧', muscles: ['frontDelts'], synergists: ['triceps'], error: '耸肩；腰部过度后弯', video: '哑铃肩推 标准动作' },
    { id: 'e072', name: '哑铃侧平举 Lateral Raise', parts: ['肩颈体态'], equipment: '哑铃', met: 3.5, cue: '手臂微弯向两侧抬起至肩高，练三角肌中束，控制下落', muscles: ['frontDelts'], synergists: ['traps'], error: '耸肩；抬过高借力', video: '哑铃侧平举 标准动作' },
    { id: 'e073', name: '俯身侧平举 Bent Over Lateral Raise', parts: ['肩颈体态'], equipment: '哑铃', met: 3.5, cue: '俯身背平直，手臂微弯向两侧打开，练三角肌后束', muscles: ['rearDelts'], synergists: ['rhomboids'], error: '耸肩；用惯性甩', video: '俯身侧平举 标准动作' },
    { id: 'e074', name: '弹力带拉开 Band Pull Apart', parts: ['肩颈体态'], equipment: '徒手', met: 2.8, cue: '双手握弹力带于胸前，向两侧拉开至胸口，肩胛后收不耸肩', muscles: ['rearDelts', 'rhomboids'], synergists: ['traps'], error: '耸肩；手臂弯曲', video: '弹力带拉开 标准动作' },
    { id: 'e075', name: '墙天使 Wall Angel', parts: ['肩颈体态'], equipment: '徒手', met: 2.6, cue: '背靠墙，手臂呈W形贴墙上下滑动，腰始终贴墙', muscles: ['traps', 'rearDelts'], synergists: ['rhomboids'], error: '腰离墙；手臂离开墙面', video: '墙天使 标准动作' },
    { id: 'e076', name: '下巴内收 Chin Tuck', parts: ['肩颈体态'], equipment: '徒手', met: 2.0, cue: '站直或仰卧，下巴水平向后收，感觉后颈拉长，改善头前伸', muscles: ['traps'], synergists: [], error: '低头而非后收；用力过猛', video: '下巴内收 改善头前伸 瘦脸' },
    { id: 'e077', name: '胸椎旋转 Thoracic Rotation', parts: ['肩颈体态', '核心'], equipment: '瑜伽垫', met: 2.5, cue: '四点跪撑，一手扶头，上臂向天花板打开再收回，改善胸椎活动度', muscles: ['erectors', 'obliques'], synergists: [], error: '用腰旋转；幅度过大', video: '胸椎旋转 标准动作' },
    { id: 'e078', name: '猫牛式 Cat Cow', parts: ['肩颈体态'], equipment: '瑜伽垫', met: 2.2, cue: '四点跪撑，吸气塌腰抬头，呼气拱背低头，脊柱逐节活动', muscles: ['erectors'], synergists: [], error: '速度过快；只动脖子', video: '猫牛式 标准动作' },
    { id: 'e079', name: '肩胛骨俯卧撑 Scapular Push-up', parts: ['肩颈体态'], equipment: '瑜伽垫', met: 3.0, cue: '俯撑手臂伸直不动，只做肩胛后收和前伸，改善肩胛稳定', muscles: ['rhomboids', 'traps'], synergists: [], error: '手臂弯曲；塌腰', video: '肩胛骨俯卧撑 标准动作' },
    { id: 'e080', name: '哑铃前平举 Front Raise', parts: ['肩颈体态'], equipment: '哑铃', met: 3.2, cue: '手持哑铃垂于体前，手臂微弯向前抬至肩高，控制下落', muscles: ['frontDelts'], synergists: [], error: '耸肩；借力甩', video: '哑铃前平举 标准动作' },

    /* ========== 有氧 · 基础 3 ========== */
    { id: 'e020', name: '低冲击有氧操 Low Impact', parts: ['有氧'], equipment: '徒手', met: 6.0, cue: '全程至少一只脚着地，开合步代替开合跳，膝盖不适首选', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '脚离地跳跃；急停扭转', video: '低冲击有氧操 膝盖友好' },
    { id: 'e021', name: '快走 Brisk Walking', parts: ['有氧'], equipment: '徒手', met: 4.3, cue: '步速到微喘但能说话，摆臂，鞋底缓冲好；降皮质醇、利于消腰腹', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '步幅过大；含胸', video: '快走 正确姿势' },
    { id: 'e022', name: '椭圆机 Elliptical', parts: ['有氧'], equipment: '有氧器械', met: 5.5, cue: '膝盖友好，阻力适中，节奏均匀，适合作为有氧操的替代', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '身体后仰；阻力过大', video: '椭圆机 正确姿势' },

    /* ========== 有氧 · 进阶 9 ========== */
    { id: 'e081', name: '跑步机快走 Treadmill Walking', parts: ['有氧'], equipment: '有氧器械', met: 4.5, cue: '速度4.5-5.5，坡度1-3，挺胸摆臂；膝盖不适别选跑步', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '扶扶手含胸；步幅过大', video: '跑步机快走 正确姿势' },
    { id: 'e082', name: '动感单车 Spin Bike', parts: ['有氧'], equipment: '有氧器械', met: 6.5, cue: '座椅高度合适，阻力适中，节奏均匀；膝盖不适降低阻力', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '阻力过大；座椅过低', video: '动感单车 正确姿势 膝盖' },
    { id: 'e083', name: '划船机 Rowing', parts: ['有氧', '背'], equipment: '有氧器械', met: 6.0, cue: '先蹬腿再拉把手，回程顺序相反，背保持平直', muscles: ['quads', 'lats'], synergists: ['glutes', 'biceps'], error: '先拉手后蹬腿；弓背', video: '划船机 标准动作' },
    { id: 'e084', name: '爬楼机 Stair Climber', parts: ['有氧', '臀腿'], equipment: '有氧器械', met: 6.5, cue: '踩稳台阶，身体直立微前倾，步速均匀，感受臀腿发力', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '身体过度前倾；扶扶手借力', video: '爬楼机 正确姿势' },
    { id: 'e085', name: '跳绳 Jump Rope', parts: ['有氧'], equipment: '徒手', met: 8.0, cue: '前脚掌轻跳，手腕摇绳；膝盖不适改无绳原地跳或直接跳过', muscles: ['calves', 'quads'], synergists: [], error: '跳太高；膝盖不适硬跳', video: '跳绳 正确姿势 膝盖友好' },
    { id: 'e086', name: '开合步 Step Jacks', parts: ['有氧'], equipment: '徒手', met: 4.5, cue: '开合跳的低冲击版：左右脚交替向外点地，双手上举，双脚不离地', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '跳起来变成开合跳；膝盖内扣', video: '开合步 低冲击 标准动作' },
    { id: 'e087', name: '原地踏步 Marching in Place', parts: ['有氧'], equipment: '徒手', met: 3.5, cue: '原地交替抬膝踏步，摆臂，最低冲击，适合膝盖不适或热身', muscles: ['quads', 'glutes'], synergists: ['calves'], error: '抬膝过高；含胸', video: '原地踏步 正确姿势' },
    { id: 'e088', name: '低冲击搏击操 Low Impact Boxing', parts: ['有氧'], equipment: '徒手', met: 6.0, cue: '直拳勾拳配合脚步移动，脚不离地，核心收紧；避免急停扭转', muscles: ['quads', 'obliques'], synergists: ['frontDelts'], error: '脚离地跳；扭转发力过猛', video: '低冲击搏击操 膝盖友好' },
    { id: 'e089', name: '爬楼梯 Stair Climbing', parts: ['有氧', '臀腿'], equipment: '徒手', met: 5.5, cue: '一级一级上，全脚掌踩实，身体略前倾，臀部发力；下楼坐电梯护膝', muscles: ['quads', 'glutes'], synergists: ['hamstrings'], error: '跨多级台阶；含胸弓背', video: '爬楼梯 正确姿势 护膝' }
  ];

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

  // 兼容老数据：按 id 从 PRESET 补齐新字段
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
