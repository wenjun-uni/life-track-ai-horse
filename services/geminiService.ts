
import { GoogleGenAI, Modality } from "@google/genai";
import { AnalysisResult, SurveyAnswers } from "../types";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

// --- Text Generation ---

export const generateAnalysis = async (answers: SurveyAnswers): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    Request:
    1. Analyze the user's situation based on the Horse Year archetype (Fire Horse).
    2. Provide a specific Tarot Card (Major Arcana) that represents their year.
    3. Provide an Alchemical Element (Sulfur, Mercury, Salt, Lead, Gold, etc.) metaphor for their transformation.
    4. Provide 3 VERY concrete, actionable steps tailored to their Focus Area and habits.
    5. Return valid JSON matching the AnalysisResult interface, including 'tarot' and 'alchemy' objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini.");

    let cleanText = text.trim().replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    let result: AnalysisResult;
    try {
      result = JSON.parse(cleanText) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("解析失败，请重试。");
    }

    if (!result.stage) result.stage = "匀速";
    if (!result.share_text) result.share_text = "马年赛道报告生成完毕。";
    
    // Fallback for new fields if AI misses them (though prompt asks for them)
    if (!result.tarot) result.tarot = { card: "The Wheel of Fortune", meaning: "Change is coming." };
    if (!result.alchemy) result.alchemy = { element: "Fire", insight: "Transmutation through action." };

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// --- Speech Generation (TTS) ---

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  if (!process.env.API_KEY) return undefined;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Use the specific TTS model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO], 
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually deep/calm, good for narration
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return undefined;
  }
};
