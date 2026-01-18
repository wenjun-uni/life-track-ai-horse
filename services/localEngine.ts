
import { AnalysisResult, SurveyAnswers, HorseTotem } from "../types";
import { HORSE_TOTEMS, INSPIRATIONS } from "../constants";

// --- Data Banks ---

const SEASONAL_ADVICE_POOL = {
  "起跑": {
    spring: "春日宜谋篇布局，不急于出手，先画地图。就像炼金术中的'黑化'阶段，在黑暗中孕育。",
    summer: "夏日试错，允许小范围的失败，验证核心假设。塔罗愚人牌提示：迈出第一步。",
    autumn: "秋日复盘，砍掉无效枝节，聚焦单一目标。收敛能量，去芜存菁。",
    winter: "冬日扎根，向内求索，为明年储备粮草。积蓄势能。"
  },
  "匀速": {
    spring: "保持节奏，像春雨一样润物细无声地推进。维持系统的稳态。",
    summer: "乘胜追击，扩大优势，建立护城河。力量牌提示：以柔克刚。",
    autumn: "颗粒归仓，将流量转化为留量，将名声转化为资产。",
    winter: "修缮兵器，维护关系，温暖身边的人。保持内在的'盐'之稳定性。"
  },
  "冲刺": {
    spring: "雷厉风行，将所有资源压强在一点。如硫磺般燃烧，驱动转化。",
    summer: "热血沸腾，不惜体力，与时间赛跑。战车牌提示：掌控缰绳，直冲终点。",
    autumn: "高位套现，在这个收获的季节拿到结果。完成转化的最后一步。",
    winter: "深呼吸，从极动转为极静，避免崩断心弦。回归平静。"
  },
  "蛰伏": {
    spring: "不要强行苏醒，在此刻，睡觉就是最好的工作。隐士牌提示：向内寻找光明。",
    summer: "去晒太阳，去出汗，排除体内的寒湿与情绪。净化身心。",
    autumn: "读书喝茶，在精神世界里构建新的秩序。重新校准指南针。",
    winter: "像熊一样冬眠，等待下一个天时的到来。保护你的核心之火。"
  },
  "转折": {
    spring: "打破旧壳，虽然疼痛，但是新生的开始。高塔牌提示：毁灭后的重建。",
    summer: "尝试跨界，去陌生的地方，见陌生的人。引入新的变量。",
    autumn: "断舍离，扔掉旧物，清理旧关系。炼金术'白化'阶段，洗净铅华。",
    winter: "确立新坐标，在此刻许下新的愿望。命运之轮开始转动。"
  }
};

const EXPLANATION_TEMPLATES = [
  "丙午马年，火运当头。你的{Totem}特质与当前的{Stage}状态形成了一种奇妙的张力。{Details}",
  "在2026的历史长河中，你选择了以{Totem}的姿态入局。{Stage}并非终点，而是你修炼{Keyword}之道的必经之路。{Details}",
  "观你气象，正如{Totem}过隙。虽处{Stage}，但内里乾坤未定。{Details}这也是破局的关键所在。"
];

const ACTIONS_LIBRARY: Record<string, string[]> = {
  '功名 (事业)': ["梳理核心技能树 (Earth)", "寻找行业导师深谈 (Mercury)", "制定不可替代性计划 (Sulfur)", "承担高风险高回报项目 (Fire)", "记录每日工作成就 (Salt)"],
  '金玉 (财富)': ["强制储蓄收入的20% (Salt)", "审视负债制定策略 (Lead)", "学习一项资产配置知识 (Mercury)", "记录每日开支 (Earth)", "探索副业机会 (Fire)"],
  '体魄 (健康)': ["坚持每日有氧30分钟 (Air)", "减少糖分摄入 (Purification)", "每晚11点前关机 (Rest)", "尝试冥想或站桩 (Spirit)", "定期体检关注信号 (Observation)"],
  '良缘 (情感)': ["每日夸赞伴侣一次 (Love)", "每周高质量共处 (Union)", "学会倾听不评判 (Empathy)", "清理不必要社交 (Detachment)", "勇敢表达需求 (Expression)"],
  '家和 (家庭)': ["策划全家短途旅行 (Journey)", "固定每周家庭聚餐 (Gathering)", "整理家庭相册 (Memory)", "与父母深入对话 (Roots)", "改善居住环境 (Sanctuary)"],
  '绝学 (技能)': ["番茄工作法专注1小时 (Focus)", "输出倒逼输入 (Transmutation)", "加入高质量学习社群 (Community)", "复盘过往案例 (Review)", "挑战高难度技能 (Mastery)"],
  '默认': ["每日静坐十分钟 (Meditation)", "清理物理空间 (Cleansing)", "阅读经典书籍 (Wisdom)", "早起一小时 (Discipline)", "记录每日小确幸 (Gratitude)"]
};

// --- Logic Helpers ---

const getTarotCard = (stage: string, totemId: string) => {
  // Mapping logic combining Stage and Totem
  if (stage === '冲刺') return { card: "VII. 战车 (The Chariot)", meaning: "意志力驱动的胜利，掌控对立力量，直冲目标。" };
  if (stage === '蛰伏') return { card: "IX. 隐士 (The Hermit)", meaning: "向内探索，在孤独中寻找智慧，暂避世俗喧嚣。" };
  if (stage === '转折') return { card: "X. 命运之轮 (Wheel of Fortune)", meaning: "顺应周期变化，在无常中把握机遇，拥抱新命运。" };
  
  // Based on Totem if stage is stable
  if (totemId === 'chitu') return { card: "IV. 皇帝 (The Emperor)", meaning: "建立秩序，行使权力，以父权般的威严稳固疆土。" };
  if (totemId === 'dilu') return { card: "XVI. 高塔 (The Tower)", meaning: "虽有惊雷，却是突破束缚的契机，置之死地而后生。" };
  if (totemId === 'jueying') return { card: "II. 女祭司 (The High Priestess)", meaning: "相信直觉，在静默中洞察先机，深藏不露。" };
  if (totemId === 'hualiliu') return { card: "VIII. 力量 (Strength)", meaning: "以柔克刚，内在的韧性胜过外在的咆哮，持久取胜。" };

  return { card: "0. 愚人 (The Fool)", meaning: "保持空杯心态，带着纯真的勇气踏上未知旅程。" };
};

const getAlchemyElement = (fiveElements: { career: number, wealth: number, health: number, relationships: number, growth: number }) => {
  // Find highest element
  const maxVal = Math.max(fiveElements.career, fiveElements.wealth, fiveElements.health, fiveElements.relationships, fiveElements.growth);
  
  if (maxVal === fiveElements.career) return { element: "硫磺 (Sulfur) - 灵魂之火", insight: "不仅是燃烧，更是转化的动力。利用你的激情（火）将原本粗糙的物质（现状）升华。" };
  if (maxVal === fiveElements.wealth) return { element: "铅变金 (Transmutation)", insight: "财富不仅是积累，更是能量的凝结。像炼金术士一样，将沉重的'铅'（压力/责任）转化为'金'（价值）。" };
  if (maxVal === fiveElements.health) return { element: "第五元素 (Quintessence)", insight: "生命力是万物之源。保持身体这一容器的纯净，才能承载更高阶的能量转化。" };
  if (maxVal === fiveElements.relationships) return { element: "水银 (Mercury) - 流动之智", insight: "关系如水银般流动结合。沟通是你的魔法，连接对立面，创造新的融合。" };
  return { element: "盐 (Salt) - 躯体之基", insight: "稳固、结晶、保存。在动荡的年份，你就是那个不变的基石，为一切提供结构。" };
};

const calculateFiveElements = (answers: SurveyAnswers, stage: string) => {
  const base = 60;
  
  const fireScore = (answers.metricQi + answers.metricSpeed) / 2;
  const earthScore = (answers.metricResources + (100 - answers.metricLoad)) / 2;
  const metalScore = (answers.metricStrategy + answers.metricResources) / 2;
  const waterScore = (answers.metricBond + answers.metricLuck) / 2;
  const woodScore = (answers.metricSkill + answers.metricQi) / 2;

  const getScore = (val: number, domainKeys: string[]) => {
    let score = (base + val) / 1.6; 
    if (answers.focusArea.some(f => domainKeys.some(k => f.includes(k)))) {
      score += 10; 
    }
    return Math.min(98, Math.max(40, Math.round(score)));
  };

  return {
    career: getScore(fireScore, ['事业', '绝技', '声望']), 
    wealth: getScore(metalScore, ['财富']), 
    health: getScore(woodScore, ['体魄']), 
    relationships: getScore(waterScore, ['情缘', '家运']), 
    growth: getScore(earthScore, ['修心', '雅趣', '远方']) 
  };
};

const getAnalysisContent = (answers: SurveyAnswers, totem: HorseTotem) => {
  const { metricQi, metricLoad, metricSpeed, currentMood, focusArea, obstacle, timeScale } = answers;
  
  // 1. Determine Stage
  let stage: AnalysisResult['stage'] = "匀速";
  
  if (currentMood.includes('信马') || currentMood.includes('乱花')) stage = "转折";
  else if (metricQi <= 30 && metricLoad >= 70) stage = "蛰伏"; 
  else if (metricQi >= 80 && metricSpeed >= 80) stage = "冲刺";
  else if (metricSpeed <= 40) stage = "起跑";

  // 2. Select Annual Keyword
  let keyword = "稳";
  if (stage === "冲刺") keyword = "战";
  if (stage === "蛰伏") keyword = "养";
  if (stage === "转折") keyword = totem.id === 'dilu' ? "跃" : "破";
  if (stage === "起跑") keyword = "谋";
  
  // 3. Explanation
  const mainFocus = focusArea.length > 0 ? focusArea[0].split(' (')[0] : "生活";
  const obstaclesStr = obstacle.length > 0 ? obstacle.join('与') : "";
  const timeDesc = timeScale === 'month' ? "当下" : (timeScale === 'season' ? "当季" : "全年");

  let details = `你将重心置于【${mainFocus}】，着眼于${timeDesc}之变。`;
  if (metricSpeed >= 70) {
    details += `这种雷厉风行是你最大的武器。`;
  } else if (metricLoad >= 70) {
    details += `但负荷正在拖慢脚步，需先减负。`;
  }

  if (obstaclesStr) {
    details += `面对“${obstaclesStr}”，${totem.name}不仅擅长奔袭，更擅长逾越。`;
  }

  const explanation = EXPLANATION_TEMPLATES[Math.floor(Math.random() * EXPLANATION_TEMPLATES.length)]
    .replace(/{Totem}/g, totem.name)
    .replace(/{Stage}/g, stage)
    .replace(/{Keyword}/g, keyword)
    .replace(/{Details}/g, details);

  // 4. Resolution
  const resolution = `【${keyword}字诀】在${timeDesc}内，针对${mainFocus}战场，你最大的敌人不是${obstaclesStr || '外界'}，而是犹豫。唯有保持${totem.traits}，${answers.obstacleDetail ? `并在“${answers.obstacleDetail}”处破局，` : ""}方能达成所愿。`;

  // 5. Actions
  let actions: string[] = [];
  focusArea.forEach(area => {
    if (ACTIONS_LIBRARY[area]) {
        const pool = ACTIONS_LIBRARY[area];
        // Pick 2 from main area if possible
        for(let i=0; i<3; i++) {
           const act = pool[Math.floor(Math.random() * pool.length)];
           if (!actions.includes(act)) actions.push(act);
        }
    }
  });
  while (actions.length < 3) {
      const pool = ACTIONS_LIBRARY['默认'];
      const act = pool[Math.floor(Math.random() * pool.length)];
      if (!actions.includes(act)) actions.push(act);
  }
  
  return { stage, keyword, explanation, resolution, actions: actions.slice(0, 3) };
};

export const generateAnalysis = async (answers: SurveyAnswers): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000)); 

  const totem = HORSE_TOTEMS.find(t => t.id === answers.totemId) || HORSE_TOTEMS[0];
  const { stage, keyword, explanation, resolution, actions } = getAnalysisContent(answers, totem);
  const five_elements = calculateFiveElements(answers, stage);
  const seasonal_advice = SEASONAL_ADVICE_POOL[stage as keyof typeof SEASONAL_ADVICE_POOL];
  
  // New: Tarot & Alchemy
  const tarot = getTarotCard(stage, totem.id);
  const alchemy = getAlchemyElement(five_elements);

  const colors = [
    { name: "朱砂红", code: "#A62419" }, 
    { name: "玄铁黑", code: "#2C2C2A" }, 
    { name: "帝王黄", code: "#E6B422" }, 
    { name: "青花蓝", code: "#1B315E" }, 
    { name: "赤金", code: "#C49A6C" }
  ];
  const luckyColorObj = colors[Math.floor(Math.random() * colors.length)];
  const directions = ["正南 (离火)", "正北 (坎水)", "东南 (巽木)", "西北 (乾金)", "西南 (坤土)"];

  const result: AnalysisResult = {
    totem,
    stage,
    confidence: Math.floor(80 + Math.random() * 19),
    annual_keyword: keyword,
    one_line_summary: `塔罗【${tarot.card.split('.')[1].trim()}】指引：${alchemy.element.split('(')[0].trim()}转化之年。`,
    explanation,
    resolution,
    five_elements,
    seasonal_advice,
    three_actions: actions,
    lucky_color: luckyColorObj.name,
    lucky_color_code: luckyColorObj.code,
    lucky_direction: directions[Math.floor(Math.random() * directions.length)],
    inspiration_quote: INSPIRATIONS[Math.floor(Math.random() * INSPIRATIONS.length)],
    tarot,
    alchemy,
    share_text: `🐎 2026丙午马年 · 人生策\n【${totem.name}】命格 | 塔罗：${tarot.card}\n炼金元素：${alchemy.element}\n决断：${resolution.substring(0, 20)}...`,
    timestamp: Date.now()
  };

  return result;
};
