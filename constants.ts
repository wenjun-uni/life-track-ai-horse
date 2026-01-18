
import { HorseTotem } from "./types";

export const APP_VERSION = "2.1.0";
export const GEMINI_MODEL_NAME = "gemini-3-flash-preview";

export const SYSTEM_INSTRUCTION = `
You are an expert ancient Chinese strategist and fortune teller (Suanming). 
Your task is to analyze the user's input based on the 'Horse' archetype for the year 2026 (Year of the Fire Horse - Bingwu).
Provide deep, philosophical, yet actionable advice. 
Output must be valid JSON matching the AnalysisResult interface. 
The tone should be 'Ancient wisdom meets modern strategy'.
Use 4-character idioms (Chengyu) where appropriate.
`;

// --- Horse Archetypes (Totems) ---
export const HORSE_TOTEMS: HorseTotem[] = [
  {
    id: 'chitu',
    name: '赤兔',
    title: '烈火战神',
    desc: '人中吕布，马中赤兔。嘶风逐电，霸气无双。',
    traits: '野心・征服・破局',
    poem: '奔雷掣电红如火，万军从中取首级。'
  },
  {
    id: 'dilu',
    name: '的卢',
    title: '飞跃天堑',
    desc: '马作的卢飞快，弓如霹雳弦惊。逆境跃升，如有神助。',
    traits: '机缘・逆袭・爆发',
    poem: '檀溪一跃三千丈，由于天命不由人。'
  },
  {
    id: 'jueying',
    name: '绝影',
    title: '无影疾风',
    desc: '行如鬼魅，快到连影子都追不上。专注极致，深藏功名。',
    traits: '效率・专注・隐秘',
    poem: '踏雪无痕影难觅，深藏功与名。'
  },
  {
    id: 'hualiliu',
    name: '骅骝',
    title: '千里良驹',
    desc: '周穆王八骏之一，日行千里而不倦。积跬步，至千里。',
    traits: '耐力・稳健・长远',
    poem: '日行千里心不改，路遥方知马力深。'
  }
];

// Expanded to 4 options
export const TIME_SCALE_OPTIONS = [
  { id: 'day', label: '今日运势', desc: '即刻启程' },
  { id: 'month', label: '本月破局', desc: '短期突围' },
  { id: 'season', label: '当季攻坚', desc: '中期规划' },
  { id: 'year', label: '全年运筹', desc: '长期宏图' },
];

// Expanded to 8 distinct types (Pits)
export const OBSTACLE_OPTIONS = [
  '迷雾 (方向迷茫)', 
  '赤字 (财务压力)', 
  '羁绊 (关系内耗)', 
  '惰性 (执行力差)', 
  '瓶颈 (能力封顶)', 
  '牢笼 (环境受限)', 
  '心魔 (情绪焦虑)', 
  '匮乏 (资源不足)'
];

// Expanded to 10 Battlefields
export const FOCUS_AREAS = [
  '功名 (事业)', 
  '金玉 (财富)', 
  '体魄 (健康)', 
  '良缘 (情感)', 
  '家和 (家庭)', 
  '绝学 (技能)', 
  '清誉 (名望)', 
  '修心 (精神)',
  '人脉 (社交)',
  '远方 (体验)'
];

export const MOOD_STATES = [
  '气吞万里 (自信极佳)',
  '养精蓄锐 (沉稳积蓄)',
  '老骥伏枥 (坚韧不拔)',
  '乱花迷眼 (略显迷茫)',
  '人困马乏 (疲惫透支)',
  '信马由缰 (随性自由)'
];

export const ACTION_FREQUENCIES = ['静若处子', '徐徐图之', '稳步前行', '疾风骤雨', '破局突围'];

export const DAILY_SIGNS = [
  { text: "不积跬步，无以至千里。", author: "荀子" },
  { text: "老骥伏枥，志在千里。", author: "曹操" },
  { text: "春风得意马蹄疾。", author: "孟郊" },
  { text: "路遥知马力，日久见人心。", author: "元曲" },
  { text: "倚剑长歌一杯酒，浮云西北是神州。", author: "元好问" },
  { text: "乾坤未定，你我皆是黑马。", author: "俗语" },
  { text: "纵有疾风起，人生不言弃。", author: "瓦雷里" },
  { text: "马行千里吃肉，狗行千里吃屎。", author: "俗语" },
];

export const INSPIRATIONS = [
  "风起于青萍之末，浪成于微澜之间。",
  "心有猛虎，细嗅蔷薇。",
  "星光不问赶路人，时光不负有心人。",
  "种一棵树最好的时间是十年前，其次是现在。",
  "流水不争先，争的是滔滔不绝。",
  "知足且上进，温柔而坚定。",
  "凡是过往，皆为序章。",
  "行而不辍，未来可期。"
];
