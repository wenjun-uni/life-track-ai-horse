
import { AnalysisResult, SurveyAnswers } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateAnalysis = async (answers: SurveyAnswers): Promise<AnalysisResult> => {
  
  const userPrompt = `
    Q0. 选定图腾ID: ${answers.totemId}
    Q1. 关注领域: ${answers.focusArea.join(', ')}
    Q2. 八维状态 (0-100):
       - 心气 (Inner Drive): ${answers.metricQi}
       - 负荷 (Mental Load): ${answers.metricLoad}
       - 行动 (Execution/Action): ${answers.metricSpeed}
       - 底气 (Confidence/Reserves): ${answers.metricResources}
       - 羁绊 (Social Bonds): ${answers.metricBond}
       - 方向 (Clarity/Direction): ${answers.metricStrategy}
       - 掌控 (Sense of Control): ${answers.metricSkill}
       - 境遇 (Smoothness/Flow): ${answers.metricLuck}
    Q3. 此刻状态: ${answers.currentMood}
    Q4. 行动频率: ${answers.actionFrequency}
    Q5. 最大卡点: ${(answers.obstacle || []).join(', ') || "无"}
    Q6. 补充详情: ${answers.obstacleDetail || "无"}
  `;

  // Construct messages for OpenAI-compatible format
  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    { role: "user", content: userPrompt }
  ];

  try {
    // Call our own Netlify Function
    const response = await fetch("/.netlify/functions/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const text = data.content;

    if (!text) {
      throw new Error("Empty response from AI.");
    }

    // Robust JSON extraction (Same logic as before to be safe)
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    let result: AnalysisResult;
    try {
      result = JSON.parse(cleanText) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      throw new Error("Failed to parse AI response.");
    }

    // Basic Validation / Fallbacks
    if (!result.stage) result.stage = "匀速";
    if (!result.share_text) result.share_text = "马年赛道报告生成完毕。";
    
    return result;

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
