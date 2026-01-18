
export type SoundTheme = 'epic' | 'ink' | 'jade' | 'bamboo' | 'zen' | 'retro';

export type AppTheme = 'ink' | 'cyber';

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0 to 1
  theme: SoundTheme;
}

export interface SurveyAnswers {
  totemId: string;
  timeScale: string;
  focusArea: string[]; 
  // --- The 8 Pulleys (Metrics) ---
  metricQi: number;       // 气 (Spirit/Energy)
  metricLoad: number;     // 重 (Load/Burden)
  metricSpeed: number;    // 风 (Speed/Efficiency)
  metricResources: number;// 粮 (Resources/Money)
  metricBond: number;     // 缘 (Relationships)
  metricStrategy: number; // 谋 (Strategy/Mind)
  metricSkill: number;    // 技 (Skill/Ability)
  metricLuck: number;     // 运 (Luck/Opportunity)
  // ------------------------------
  currentMood: string;
  actionFrequency: string;
  obstacle: string[]; 
  obstacleDetail: string; 
}

export interface HorseTotem {
  id: string;
  name: string;
  title: string;
  desc: string;
  traits: string;
  poem: string; 
  cyber_desc?: string; // New: Sci-fi interpretation
}

export interface AnalysisResult {
  totem: HorseTotem;
  stage: "起跑" | "匀速" | "冲刺" | "蛰伏" | "转折";
  confidence: number;
  annual_keyword: string;
  one_line_summary: string;
  explanation: string;
  resolution: string;
  five_elements: {
    career: number;
    wealth: number;
    health: number;
    relationships: number;
    growth: number;
  };
  seasonal_advice: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  three_actions: string[];
  lucky_color: string;
  lucky_color_code: string; 
  lucky_direction: string;
  // New Western Mysticism Fields
  tarot: {
    card: string; // e.g., "The Chariot"
    meaning: string;
  };
  alchemy: {
    element: string; // e.g., "Sulfur (Soul)"
    insight: string;
  };
  inspiration_quote?: string;
  share_text: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  result: AnalysisResult;
}

// Expanded View States
export type ViewState = 'home' | 'daily' | 'totem_gallery' | 'lab' | 'settings' | 'survey' | 'loading' | 'result' | 'history';
