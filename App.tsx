
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { SurveyAnswers, AnalysisResult, ViewState, HistoryItem, AppTheme } from './types';
import { FOCUS_AREAS, MOOD_STATES, HORSE_TOTEMS, DAILY_SIGNS, OBSTACLE_OPTIONS, TIME_SCALE_OPTIONS, APP_VERSION } from './constants';
import { generateAnalysis } from './services/localEngine';
import { Button } from './components/Button';
import { HorseScale } from './components/HorseScale'; 
import { soundManager } from './utils/soundManager';
import { speakText } from './utils/sound';
import { CameraMaker } from './components/CameraMaker';
import { HudGauge } from './components/HudGauge';

// --- Icons (Unified Ancient/Sci-fi style) ---
const Icons = {
  Home: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Daily: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Ask: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>,
  Totem: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 4l-2 2h-2l-1 2l-2-1l-3 3l-1 4l1 3l4 1l3-3l1-4l2-3v-4z"/><path d="M12 2c3 0 5 2 6 4s1 4 0 6s-3 3-5 4s-4 1-5 3s-1 3 0 4"/></svg>,
  Lab: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  Settings: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Camera: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Share: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  HorseHead: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v1l-2 2v2l-4 4-2-2v4h4v-3l2-2v-2l2-2V5h3v4l2 2V5z"/><path d="M14 8h.01"/></svg>,
  HorseGallop: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v1l-2 2v2l-5 3-4-2-1 4 3 2 1 4h2l2-4 3-2v-2l3-3V5h3v4l2 2V5z"/></svg>,
  Scroll: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Quill: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  Sparkle: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z"/></svg>,
  Lantern: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M8 6h8M8 18h8M6 8v8M18 8v8" /></svg>
};

// --- Helper Components ---

const ProgressBar: React.FC<{ current: number; total: number; theme: AppTheme }> = ({ current, total, theme }) => (
  <div className={`w-full h-1 rounded-full mb-6 flex overflow-hidden ${theme === 'cyber' ? 'bg-gray-800' : 'bg-paper-200'}`}>
    {Array.from({ length: total }).map((_, i) => (
      <div 
        key={i} 
        className={`h-full flex-1 transition-all duration-500 ${i < current ? (theme === 'cyber' ? 'bg-cyber-primary shadow-[0_0_5px_#FF2A2A]' : 'bg-cinnabar-700') : 'bg-transparent'} ${i > 0 ? (theme === 'cyber' ? 'border-l border-black' : 'border-l border-paper-50') : ''}`}
      />
    ))}
  </div>
);

// --- Survey View (Multi-step) ---

const SurveyView: React.FC<{ 
  answers: SurveyAnswers; 
  setAnswers: React.Dispatch<React.SetStateAction<SurveyAnswers>>; 
  onSubmit: () => void; 
  theme: AppTheme;
}> = ({ answers, setAnswers, onSubmit, theme }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const isCyber = theme === 'cyber';

  const update = (key: keyof SurveyAnswers, val: any) => setAnswers(p => ({ ...p, [key]: val }));
  
  const next = () => {
    soundManager.play('nav.switch');
    if (step < totalSteps) setStep(step + 1);
    else onSubmit();
  };

  const Heading = ({ children }: { children: React.ReactNode }) => (
      <h3 className={`font-serif text-lg font-bold mb-4 ${isCyber ? 'text-white' : 'text-paper-900'}`}>{children}</h3>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
      <label className={`block text-sm font-bold mb-3 ${isCyber ? 'text-gray-300' : 'text-paper-700'}`}>{children}</label>
  );

  const OptionCard = ({ selected, onClick, children }: any) => (
      <button 
        type="button" 
        onClick={onClick} 
        className={`p-4 text-left border rounded-xl transition-all shadow-sm relative overflow-hidden ${selected ? (isCyber ? 'bg-cyber-panel border-cyber-primary text-cyber-primary shadow-[0_0_10px_#FF2A2A]' : 'bg-cinnabar-700 text-white border-cinnabar-900 ring-2 ring-cinnabar-100') : (isCyber ? 'bg-black border-gray-800 text-gray-400 hover:border-gray-600' : 'bg-white text-paper-800 border-paper-300 hover:border-cinnabar-300')}`}
      >
        {children}
      </button>
  );

  return (
    <div className="flex flex-col h-full relative">
        <div className="px-6 pt-6 pb-2">
            <ProgressBar current={step} total={totalSteps} theme={theme} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar">
            
            {/* STEP 1: Totem & Time */}
            {step === 1 && (
            <div className="animate-fade-in-up">
               <Heading>壹 · 择马入局</Heading>
               <Label>选择本命图腾</Label>
               <div className="grid grid-cols-2 gap-3 mb-8">
                  {HORSE_TOTEMS.map(t => (
                     <OptionCard key={t.id} selected={answers.totemId === t.id} onClick={() => { soundManager.play('ui.select'); update('totemId', t.id); }}>
                        <div className="font-bold font-serif text-sm mb-1">{t.name}</div>
                        <div className={`text-[10px] opacity-80`}>{t.traits}</div>
                     </OptionCard>
                  ))}
               </div>
               <Label>推演时间尺度</Label>
               <div className="grid grid-cols-2 gap-3">
                  {TIME_SCALE_OPTIONS.map(opt => (
                      <OptionCard key={opt.id} selected={answers.timeScale === opt.id} onClick={() => { soundManager.play('ui.tap'); update('timeScale', opt.id); }}>
                          <span className="text-sm font-bold block">{opt.label}</span>
                          <span className="text-[10px] opacity-70">{opt.desc}</span>
                      </OptionCard>
                  ))}
               </div>
            </div>
            )}

            {/* STEP 2: Focus Area */}
            {step === 2 && (
            <div className="animate-fade-in-up">
               <Heading>贰 · 核心战场</Heading>
               <p className={`text-xs mb-4 ${isCyber ? 'text-gray-500' : 'text-paper-500'}`}>请选择至多 3 项关注领域</p>
               <div className="grid grid-cols-2 gap-3">
                  {FOCUS_AREAS.map(opt => {
                      const selected = answers.focusArea.includes(opt);
                      const [main] = opt.split(' (');
                      return (
                        <OptionCard key={opt} selected={selected} onClick={() => { 
                            soundManager.play('ui.tap');
                            const current = answers.focusArea;
                            if (current.includes(opt)) update('focusArea', current.filter(i => i !== opt));
                            else if (current.length < 3) update('focusArea', [...current, opt]);
                        }}>
                           <div className="text-center">{main}</div>
                        </OptionCard>
                      );
                  })}
               </div>
            </div>
            )}

            {/* STEP 3: Metrics */}
            {step === 3 && (
            <div className="animate-fade-in-up">
               <Heading>叁 · 内观自省</Heading>
               <p className={`text-xs mb-6 ${isCyber ? 'text-gray-500' : 'text-paper-500'}`}>拖动滑块，凭直觉评估八维状态</p>
               
               <div className="space-y-6">
                  <HorseScale label="心气 (Drive)" value={answers.metricQi} onChange={v => update('metricQi', v)} metricType="qi" theme={theme} />
                  <HorseScale label="负荷 (Load)" value={answers.metricLoad} onChange={v => update('metricLoad', v)} metricType="load" theme={theme} />
                  <HorseScale label="行动 (Action)" value={answers.metricSpeed} onChange={v => update('metricSpeed', v)} metricType="speed" theme={theme} />
                  <HorseScale label="底气 (Reserves)" value={answers.metricResources} onChange={v => update('metricResources', v)} metricType="resources" theme={theme} />
                  <HorseScale label="羁绊 (Bond)" value={answers.metricBond} onChange={v => update('metricBond', v)} metricType="bond" theme={theme} />
                  <HorseScale label="方向 (Clarity)" value={answers.metricStrategy} onChange={v => update('metricStrategy', v)} metricType="strategy" theme={theme} />
                  <HorseScale label="掌控 (Control)" value={answers.metricSkill} onChange={v => update('metricSkill', v)} metricType="skill" theme={theme} />
                  <HorseScale label="境遇 (Flow)" value={answers.metricLuck} onChange={v => update('metricLuck', v)} metricType="luck" theme={theme} />
               </div>
            </div>
            )}

            {/* STEP 4: Obstacle & Mood */}
            {step === 4 && (
            <div className="animate-fade-in-up">
               <Heading>肆 · 破局点</Heading>
               
               <Label>当前最大阻碍</Label>
               <div className="grid grid-cols-2 gap-3 mb-8">
                  {OBSTACLE_OPTIONS.map(opt => {
                      const selected = answers.obstacle.includes(opt);
                      const [main, sub] = opt.split(' (');
                      return (
                          <OptionCard key={opt} selected={selected} onClick={() => {
                              soundManager.play('ui.tap');
                              const current = answers.obstacle;
                              if (current.includes(opt)) update('obstacle', current.filter(i => i !== opt));
                              else update('obstacle', [...current, opt]);
                          }}>
                              <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded-full ${selected ? 'bg-white/20' : (isCyber ? 'bg-gray-800' : 'bg-paper-100')}`}>
                                    <Icons.HorseHead className="w-4 h-4" />
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold">{main}</div>
                                      <div className="text-[10px] opacity-70">{sub ? sub.replace(')', '') : ''}</div>
                                  </div>
                              </div>
                          </OptionCard>
                      )
                  })}
               </div>
               
               <Label>补充详情 (选填)</Label>
               <input 
                 type="text" 
                 placeholder="还有什么想说的..." 
                 value={answers.obstacleDetail}
                 onChange={e => update('obstacleDetail', e.target.value)}
                 className={`w-full p-3 border rounded-lg text-sm mb-8 focus:outline-none focus:ring-1 ${isCyber ? 'bg-black border-gray-700 text-white focus:border-cyber-primary focus:ring-cyber-primary' : 'bg-white border-paper-300 text-paper-900 focus:border-cinnabar-500 focus:ring-cinnabar-500'}`}
               />

               <Label>此刻心境</Label>
               <div className="space-y-2 mb-8">
                   {MOOD_STATES.map((opt) => (
                       <button 
                         type="button" 
                         key={opt} 
                         onClick={() => { soundManager.play('ui.tap'); update('currentMood', opt); }} 
                         className={`w-full text-left p-3 text-sm border rounded-lg flex items-center gap-3 transition-colors shadow-sm ${answers.currentMood === opt ? (isCyber ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary' : 'bg-paper-100 border-cinnabar-700 text-cinnabar-900 font-bold') : (isCyber ? 'bg-black border-gray-800 text-gray-500' : 'bg-white border-paper-200 text-paper-600')}`}
                        >
                           <div className={`p-1.5 rounded-full ${answers.currentMood === opt ? (isCyber ? 'bg-cyber-primary text-black' : 'bg-cinnabar-700 text-white') : (isCyber ? 'bg-gray-800 text-gray-500' : 'bg-paper-100 text-paper-400')}`}>
                               <Icons.HorseGallop className="w-4 h-4" />
                           </div>
                           {opt}
                       </button>
                   ))}
               </div>
            </div>
            )}
        </div>
        <div className={`absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t z-40 ${isCyber ? 'from-black via-black to-transparent' : 'from-paper-50 via-paper-50 to-transparent'}`}>
            <Button fullWidth onClick={next} disabled={step === 1 && (!answers.totemId || !answers.timeScale)} className={isCyber ? 'bg-cyber-primary text-black font-bold border-none shadow-[0_0_10px_#FF2A2A]' : ''}>
                {step === totalSteps ? '生成策论' : '下一步'}
            </Button>
        </div>
    </div>
  );
};


// --- Helper Views (Split for readability) ---

const DailyView: React.FC<{ theme: AppTheme; onClose: () => void }> = ({ theme, onClose }) => {
  const isCyber = theme === 'cyber';
  const sign = useMemo(() => DAILY_SIGNS[Math.floor(Math.random() * DAILY_SIGNS.length)], []);
  
  return (
    <div className="flex flex-col h-full p-6 items-center justify-center relative animate-fade-in-up">
       <div className="absolute top-4 right-4">
           <button onClick={onClose} className="p-2 opacity-50">✕</button>
       </div>
       <h2 className={`font-serif text-lg font-bold mb-8 tracking-widest uppercase flex items-center gap-2 relative z-10 ${isCyber ? 'text-cyber-primary' : 'text-paper-900'}`}>
         <span className={`w-1.5 h-1.5 rounded-full ${isCyber ? 'bg-cyber-accent' : 'bg-cinnabar-700'}`}></span>
         每日一签
         <span className={`w-1.5 h-1.5 rounded-full ${isCyber ? 'bg-cyber-accent' : 'bg-cinnabar-700'}`}></span>
       </h2>
       <div 
         onClick={() => soundManager.play('page.turn')} 
         className={`w-full max-w-[280px] p-10 rounded-xl shadow-xl border cursor-pointer hover:scale-105 transition-transform ${isCyber ? 'bg-cyber-panel/80 border-cyber-grid text-cyber-text' : 'bg-white/60 backdrop-blur border-paper-200 text-paper-900'}`}
       >
         <p className="font-serif text-xl font-bold vertical-text mx-auto h-48">{sign.text}</p>
         <p className={`text-xs text-center mt-6 font-mono ${isCyber ? 'text-cyber-dim' : 'text-paper-400'}`}>— {sign.author} —</p>
       </div>
    </div>
  );
};

const LabView: React.FC<{ theme: AppTheme; onOpenCam: () => void }> = ({ theme, onOpenCam }) => {
    const isCyber = theme === 'cyber';
    return (
        <div className="flex flex-col h-full p-6 items-center justify-center animate-fade-in-up">
             <h2 className={`font-serif text-2xl font-bold mb-8 ${isCyber ? 'text-cyber-text' : 'text-paper-900'}`}>天机阁 · LAB</h2>
             <div className="mb-10">
                 <HudGauge theme={theme} />
             </div>
             
             <div className="grid grid-cols-2 gap-4 w-full">
                 <button onClick={onOpenCam} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-colors ${isCyber ? 'border-cyber-primary bg-cyber-panel text-cyber-primary hover:bg-cyber-primary/20' : 'border-cinnabar-700 bg-paper-100 text-cinnabar-700 hover:bg-cinnabar-50'}`}>
                     <Icons.Camera className="w-8 h-8" />
                     <span className="text-sm font-bold">火马映相</span>
                 </button>
                 <button className={`p-4 border rounded-xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed ${isCyber ? 'border-gray-700 text-gray-500' : 'border-paper-300 text-paper-400'}`}>
                     <span className="text-2xl">⚡</span>
                     <span className="text-sm font-bold">敬请期待</span>
                 </button>
             </div>
        </div>
    );
};

const TotemGalleryView: React.FC<{ theme: AppTheme }> = ({ theme }) => {
    const isCyber = theme === 'cyber';
    return (
        <div className="flex flex-col h-full animate-fade-in-up p-6 overflow-y-auto hide-scrollbar pb-32">
            <h2 className={`font-serif text-2xl font-bold mb-6 sticky top-0 py-4 z-10 border-b ${isCyber ? 'text-cyber-text bg-cyber-bg/90 border-cyber-grid' : 'text-paper-900 bg-paper-50/90 border-paper-200'}`}>图腾殿</h2>
            <div className="space-y-6">
                {HORSE_TOTEMS.map(t => (
                    <div key={t.id} className={`p-6 rounded-xl border shadow-sm ${isCyber ? 'bg-cyber-panel border-cyber-grid' : 'bg-white border-paper-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-xl font-bold font-serif ${isCyber ? 'text-cyber-primary' : 'text-cinnabar-700'}`}>{t.name}</h3>
                            <span className={`text-[10px] px-2 py-1 rounded ${isCyber ? 'bg-gray-800 text-cyber-accent' : 'bg-paper-100 text-paper-500'}`}>{t.title}</span>
                        </div>
                        <p className={`text-sm mb-4 leading-relaxed font-medium ${isCyber ? 'text-cyber-text' : 'text-paper-800'}`}>{t.desc}</p>
                        <div className={`p-3 rounded-lg border-l-2 italic text-xs ${isCyber ? 'bg-black border-cyber-primary text-cyber-dim' : 'bg-paper-50 border-cinnabar-700 text-paper-600'}`}>
                            {t.poem}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Updated Result View with Camera Feature ---

const ResultView: React.FC<{ 
    result: AnalysisResult; 
    theme: AppTheme; 
    onRestart: () => void; 
}> = ({ result, theme, onRestart }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const isCyber = theme === 'cyber';

  useEffect(() => { soundManager.play('result.success'); }, []);

  if (showCamera) {
      return <CameraMaker 
                theme={theme} 
                onCapture={(img) => { setCapturedImage(img); setShowCamera(false); }} 
                onClose={() => setShowCamera(false)} 
             />;
  }

  return (
      <div className="flex flex-col h-full bg-transparent overflow-hidden relative animate-fade-in-up">
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6 pb-32">
             {/* Captured Image Header (if exists) */}
             {capturedImage && (
                 <div className="mb-6 rounded-xl overflow-hidden border-2 border-gold-500 shadow-lg relative group">
                     <img src={capturedImage} className="w-full h-48 object-cover" />
                     <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">本命马影</div>
                 </div>
             )}

             {/* Badge Header */}
             <div className="text-center mb-6">
                 <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-6 shadow-sm ${isCyber ? 'border-cyber-primary/30 bg-black/40 text-cyber-text' : 'border-gold-600/30 bg-white/40 text-paper-800'}`}>
                     <span className={`w-2 h-2 rounded-full ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700'}`}></span>
                     <span className="text-xs font-serif tracking-[0.2em] font-bold">二零二六 · 丙午</span>
                     <span className={`w-2 h-2 rounded-full ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700'}`}></span>
                 </div>
                 <h1 className={`font-calligraphy text-8xl mb-2 drop-shadow-sm relative z-10 ${isCyber ? 'text-cyber-primary animate-pulse' : 'text-transparent bg-clip-text bg-gradient-to-b from-cinnabar-900 to-cinnabar-700'}`}>{result.annual_keyword}</h1>
                 <p className={`font-serif font-bold tracking-widest text-lg ${isCyber ? 'text-cyber-accent' : 'text-paper-900'}`}>{result.one_line_summary}</p>
             </div>
             
             {/* Mysticism Cards */}
             <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className={`p-4 rounded-xl border shadow-sm ${isCyber ? 'bg-gray-900 border-gray-700' : 'bg-white border-paper-200'}`}>
                     <div className={`text-[10px] uppercase tracking-wider mb-2 ${isCyber ? 'text-gray-400' : 'text-paper-500'}`}>塔罗指引</div>
                     <div className={`text-sm font-bold ${isCyber ? 'text-white' : 'text-paper-900'}`}>{result.tarot.card}</div>
                     <div className={`text-[10px] mt-1 leading-tight opacity-70 ${isCyber ? 'text-gray-300' : 'text-paper-600'}`}>{result.tarot.meaning}</div>
                 </div>
                 <div className={`p-4 rounded-xl border shadow-sm ${isCyber ? 'bg-gray-900 border-gray-700' : 'bg-white border-paper-200'}`}>
                     <div className={`text-[10px] uppercase tracking-wider mb-2 ${isCyber ? 'text-gray-400' : 'text-paper-500'}`}>炼金元素</div>
                     <div className={`text-sm font-bold ${isCyber ? 'text-white' : 'text-paper-900'}`}>{result.alchemy.element}</div>
                     <div className={`text-[10px] mt-1 leading-tight opacity-70 ${isCyber ? 'text-gray-300' : 'text-paper-600'}`}>{result.alchemy.insight}</div>
                 </div>
             </div>

             {/* Totem Card */}
             <div className={`relative rounded-xl border shadow-md overflow-hidden mb-8 p-5 pl-7 ${isCyber ? 'bg-cyber-panel border-cyber-primary/50' : 'bg-paper-50 border-paper-200'}`}>
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700'}`}></div>
                 <div className="flex justify-between items-start mb-4">
                     <div>
                         <div className={`text-[10px] uppercase tracking-wider mb-1 ${isCyber ? 'text-cyber-dim' : 'text-paper-500'}`}>本命图腾</div>
                         <div className={`text-2xl font-bold font-serif ${isCyber ? 'text-white' : 'text-paper-900'}`}>{result.totem.name}</div>
                     </div>
                     <button onClick={() => { soundManager.play('ui.select'); speakText(result.explanation); }} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCyber ? 'bg-gray-800 text-cyber-primary' : 'bg-paper-200 text-paper-600'}`}>
                        <span className="text-xs">🔊</span>
                     </button>
                 </div>
                 <p className={`text-sm leading-relaxed text-justify mb-4 font-medium ${isCyber ? 'text-gray-300' : 'text-paper-700'}`}>{result.explanation}</p>
             </div>

             {/* Action List */}
             <div className="mb-8">
                 <h3 className={`font-serif font-bold text-sm mb-3 flex items-center gap-2 ${isCyber ? 'text-cyber-text' : 'text-paper-900'}`}>
                    <span className={`w-1 h-4 ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700'}`}></span>
                    锦囊妙计 (每日修炼)
                 </h3>
                 {result.three_actions.map((act, i) => (
                     <div key={i} className={`flex items-start gap-3 mb-3 p-3 rounded-lg border shadow-sm ${isCyber ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white/90 border-paper-100 text-paper-800'}`}>
                         <span className={`font-mono text-xs mt-0.5 opacity-60 ${isCyber ? 'text-cyber-primary' : 'text-cinnabar-700'}`}>0{i+1}</span>
                         <span className="text-sm font-medium">{act}</span>
                     </div>
                 ))}
             </div>
          </div>

          <div className="absolute bottom-6 left-0 w-full flex gap-3 px-6 z-30">
             <Button variant="secondary" onClick={onRestart} className="flex-1">重置</Button>
             {/* New Feature: Camera */}
             <Button variant="primary" onClick={() => setShowCamera(true)} className="flex-[2]">
                <span className="flex items-center gap-2"><Icons.Camera className="w-5 h-5" /> {capturedImage ? '重拍马影' : '生成马影'}</span>
             </Button>
          </div>
      </div>
  );
};

// --- Settings View ---

const SettingsView: React.FC<{ theme: AppTheme; setTheme: (t: AppTheme) => void }> = ({ theme, setTheme }) => {
    const isCyber = theme === 'cyber';
    const [config, setConfig] = useState(soundManager.getConfig());

    const updateSound = (key: keyof import('./types').SoundConfig, val: any) => {
        const next = { ...config, [key]: val };
        setConfig(next);
        soundManager.setConfig(next);
    };

    return (
        <div className="p-6 h-full overflow-y-auto hide-scrollbar pb-32 animate-fade-in-up">
            <h2 className={`font-serif text-2xl font-bold mb-6 border-b pb-4 ${isCyber ? 'text-white border-gray-700' : 'text-paper-900 border-paper-200'}`}>设置</h2>
            
            <div className="space-y-8">
                <div>
                    <label className={`block font-bold mb-3 ${isCyber ? 'text-gray-300' : 'text-paper-800'}`}>界面主题</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setTheme('ink')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 ${theme === 'ink' ? 'border-cinnabar-700 bg-paper-100' : 'border-gray-500 opacity-50'}`}>
                            <div className="w-6 h-6 rounded-full bg-cinnabar-700"></div>
                            <span className="text-xs font-bold text-black">墨印·策马</span>
                        </button>
                        <button onClick={() => setTheme('cyber')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 ${theme === 'cyber' ? 'border-cyber-primary bg-gray-900' : 'border-gray-500 opacity-50'}`}>
                            <div className="w-6 h-6 rounded-full bg-cyber-primary shadow-[0_0_10px_red]"></div>
                            <span className="text-xs font-bold text-white">赛博·火马</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className={`block font-bold mb-3 ${isCyber ? 'text-gray-300' : 'text-paper-800'}`}>音效控制</label>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                         <span className={isCyber ? 'text-gray-400' : 'text-paper-600'}>启用音效</span>
                         <button onClick={() => updateSound('enabled', !config.enabled)} className={`w-12 h-6 rounded-full relative transition-colors ${config.enabled ? (isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700') : 'bg-gray-400'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${config.enabled ? 'left-7' : 'left-1'}`}></div>
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Updated TabBar (5 Items, Daily Removed) ---

const TabBar: React.FC<{ current: ViewState; onChange: (v: ViewState) => void; theme: AppTheme }> = ({ current, onChange, theme }) => {
    const isCyber = theme === 'cyber';
    
    // Main Tabs (Daily is removed from here)
    const tabs = [
        { id: 'home', icon: Icons.Home, label: '首页' },
        { id: 'totem_gallery', icon: Icons.Totem, label: '图腾' },
        { id: 'survey', icon: Icons.Ask, label: '问策', isMain: true }, // The "Big Button"
        { id: 'lab', icon: Icons.Lab, label: '天机' }, // Lab
        { id: 'settings', icon: Icons.Settings, label: '设置' },
    ];

    return (
        <div className={`h-[80px] border-t flex items-end justify-around pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-50 px-2 backdrop-blur-md ${isCyber ? 'bg-black/80 border-gray-800' : 'bg-paper-50/95 border-paper-200'}`}>
            {tabs.map((tab) => {
                const isActive = current === tab.id || (tab.id === 'survey' && current === 'survey');
                
                if (tab.isMain) {
                     return (
                         <button 
                             key={tab.id}
                             onClick={() => { soundManager.play('home.enter'); onChange('survey' as ViewState); }}
                             className="relative -top-5 group"
                         >
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-active:scale-95 border-4 ${isCyber ? 'bg-cyber-bg border-cyber-primary shadow-[0_0_15px_#FF2A2A]' : 'bg-cinnabar-700 border-paper-50'}`}>
                                 <tab.icon className={`w-8 h-8 ${isCyber ? 'text-cyber-primary' : 'text-white'}`} />
                             </div>
                             <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest ${isCyber ? 'text-cyber-primary' : 'text-cinnabar-700'}`}>{tab.label}</span>
                         </button>
                     );
                }

                return (
                    <button 
                        key={tab.id}
                        onClick={() => { soundManager.play('nav.switch'); onChange(tab.id as ViewState); }}
                        className={`flex flex-col items-center gap-1 transition-colors relative w-12`}
                    >
                        <tab.icon className={`w-6 h-6 ${isActive ? (isCyber ? 'text-cyber-accent' : 'text-cinnabar-700') : (isCyber ? 'text-gray-600' : 'text-paper-400')}`} />
                        <span className={`text-[10px] font-bold tracking-wider ${isActive ? (isCyber ? 'text-cyber-accent' : 'text-cinnabar-700') : (isCyber ? 'text-gray-600' : 'text-paper-400')}`}>{tab.label}</span>
                        {isActive && <div className={`absolute -bottom-2 w-1 h-1 rounded-full ${isCyber ? 'bg-cyber-accent' : 'bg-cinnabar-700'}`}></div>}
                    </button>
                );
            })}
        </div>
    );
};

// --- Home View (Refined Design) ---

const HomeView: React.FC<{ theme: AppTheme; onStart: () => void; onDaily: () => void }> = ({ theme, onStart, onDaily }) => {
    const isCyber = theme === 'cyber';

    return (
        <div className="flex flex-col h-full items-center justify-center p-8 animate-fade-in-up relative">
            
            {/* Hanging Daily Sign Tag (Top Right) */}
            <div className="absolute top-0 right-8 z-20 cursor-pointer group" onClick={onDaily}>
                {/* String */}
                <div className={`w-[2px] h-12 mx-auto ${isCyber ? 'bg-cyber-primary' : 'bg-gold-600'}`}></div>
                {/* Tag */}
                <div className={`w-10 h-14 rounded-md shadow-lg flex items-center justify-center border-2 relative transition-transform group-hover:translate-y-1 ${isCyber ? 'bg-black border-cyber-primary' : 'bg-cinnabar-900 border-gold-500'}`}>
                    <span className={`font-serif font-bold writing-vertical text-sm ${isCyber ? 'text-cyber-primary' : 'text-gold-500'}`}>春</span>
                    {/* Tassel */}
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 w-[2px] h-4 ${isCyber ? 'bg-cyber-primary' : 'bg-gold-600'}`}></div>
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isCyber ? 'bg-cyber-primary' : 'bg-gold-500'}`}></div>
                </div>
            </div>

            {/* Main Logo Area */}
            <div className="mb-10 relative">
                 <div className={`w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl border-[6px] relative z-10 ${isCyber ? 'bg-black border-cyber-primary shadow-[0_0_20px_#FF2A2A]' : 'bg-cinnabar-700 border-gold-500'}`}>
                     <span className={`font-calligraphy text-7xl ${isCyber ? 'text-cyber-primary drop-shadow-[0_0_5px_#fff]' : 'text-gold-500'}`}>午</span>
                 </div>
                 {/* Decorative background glow */}
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-2xl opacity-30 ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-500'}`}></div>
            </div>

            {/* Title */}
            <h1 className={`text-4xl font-bold mb-4 font-serif ${isCyber ? 'text-white' : 'text-paper-900'}`}>人生策</h1>
            <div className="flex items-center gap-4 mb-12 opacity-80">
                <div className={`h-[1px] w-8 ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-900'}`}></div>
                <p className={`text-xs tracking-[0.3em] uppercase ${isCyber ? 'text-cyber-dim' : 'text-paper-500'}`}>新春 · 破局 · 开门红</p>
                <div className={`h-[1px] w-8 ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-900'}`}></div>
            </div>
            
            {/* Feature Cards List */}
            <div className="w-full max-w-xs space-y-4 mb-8">
                <div className={`p-4 rounded-xl flex items-center gap-4 shadow-sm backdrop-blur-sm border ${isCyber ? 'bg-gray-900/50 border-gray-700' : 'bg-white/60 border-paper-200'}`}>
                     <div className={isCyber ? 'text-cyber-primary' : 'text-cinnabar-700'}><Icons.Totem className="w-6 h-6" /></div>
                     <div className="text-left">
                         <div className={`font-bold text-sm ${isCyber ? 'text-white' : 'text-paper-900'}`}>图腾入局</div>
                         <div className={`text-[10px] ${isCyber ? 'text-gray-400' : 'text-paper-500'}`}>择一匹本命战马，定路数</div>
                     </div>
                </div>
                <div className={`p-4 rounded-xl flex items-center gap-4 shadow-sm backdrop-blur-sm border ${isCyber ? 'bg-gray-900/50 border-gray-700' : 'bg-white/60 border-paper-200'}`}>
                     <div className={isCyber ? 'text-cyber-primary' : 'text-cinnabar-700'}><Icons.Scroll className="w-6 h-6" /></div>
                     <div className="text-left">
                         <div className={`font-bold text-sm ${isCyber ? 'text-white' : 'text-paper-900'}`}>策论落地</div>
                         <div className={`text-[10px] ${isCyber ? 'text-gray-400' : 'text-paper-500'}`}>五行战力 + 塔罗 + 炼金术</div>
                     </div>
                </div>
            </div>

            {/* Start Button */}
            <div className="w-full max-w-xs space-y-3">
                <Button fullWidth onClick={onStart} className={`h-14 text-lg font-bold shadow-xl ${isCyber ? 'bg-cyber-primary border-none shadow-[0_0_15px_#FF2A2A] text-black' : 'bg-cinnabar-700 text-white'}`}>
                    开始推演
                </Button>
                <div className={`text-center text-[10px] cursor-pointer hover:underline ${isCyber ? 'text-gray-500' : 'text-paper-400'}`} onClick={() => soundManager.play('ui.select')}>
                    试试手气 · 一键快策
                </div>
            </div>
        </div>
    );
};

// --- Main App Orchestrator ---

const App: React.FC = () => {
  const [theme, setTheme] = useState<AppTheme>('ink');
  const [view, setView] = useState<ViewState>('home'); 
  
  // Theme Side Effect
  useEffect(() => {
     document.body.className = `theme-${theme}`;
     // Optional: Play a sound when theme switches
     soundManager.play('ui.select');
  }, [theme]);

  const [answers, setAnswers] = useState<SurveyAnswers>({
    totemId: '', 
    timeScale: 'year',
    focusArea: [],
    metricQi: 50, metricLoad: 50, metricSpeed: 50, metricResources: 50,
    metricBond: 50, metricStrategy: 50, metricSkill: 50, metricLuck: 50,
    currentMood: '', actionFrequency: '稳步前行', obstacle: [], obstacleDetail: ''
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async () => {
    setView('loading');
    soundManager.play('slider.gallop');
    try {
      const res = await generateAnalysis(answers);
      setResult(res);
      setView('result');
    } catch (e) {
      soundManager.play('error');
      alert("连接受阻，请重试");
      setView('survey');
    }
  };

  // Render View Content
  const renderContent = () => {
      switch (view) {
          case 'home': 
              return <HomeView theme={theme} onStart={() => setView('survey')} onDaily={() => setView('daily')} />;
          case 'daily': return <DailyView theme={theme} onClose={() => setView('home')} />;
          case 'totem_gallery': return <TotemGalleryView theme={theme} />;
          case 'lab': return <LabView theme={theme} onOpenCam={() => setView('result')} />; // Shortcut to result/cam for demo
          case 'settings': return <SettingsView theme={theme} setTheme={setTheme} />;
          
          case 'survey': 
            return <SurveyView answers={answers} setAnswers={setAnswers} onSubmit={handleSubmit} theme={theme} />;

          case 'loading': 
             return (
                 <div className="flex flex-col items-center justify-center h-full">
                     <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${theme === 'cyber' ? 'border-cyber-primary' : 'border-cinnabar-700'}`}></div>
                     <p className={`mt-4 text-xs font-mono animate-pulse ${theme === 'cyber' ? 'text-cyber-primary' : 'text-cinnabar-900'}`}>{theme === 'cyber' ? 'CALCULATING PROBABILITIES...' : '推演天机中...'}</p>
                 </div>
             );

          case 'result': 
             return result ? <ResultView result={result} theme={theme} onRestart={() => setView('home')} /> : <div>No Result</div>;
          
          default: return <div>Not Found</div>;
      }
  };

  return (
    <div className={`min-h-screen w-full flex justify-center items-center font-serif transition-colors duration-500 ${theme === 'cyber' ? 'bg-[#111]' : 'bg-[#D6D6CB]'}`}>
      <div className={`w-full max-w-[390px] h-[100dvh] max-h-[850px] relative flex flex-col shadow-2xl overflow-hidden sm:rounded-[2.5rem] ring-8 transition-all duration-500 ${theme === 'cyber' ? 'bg-cyber-bg ring-gray-900' : 'bg-paper-50 ring-paper-900/5'}`}>
        
        {/* Dynamic Background */}
        <div className={`absolute inset-0 pointer-events-none z-0 ${theme === 'cyber' ? 'opacity-40 bg-scanlines' : 'opacity-100'}`}>
            {theme === 'cyber' && <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>}
            {theme === 'ink' && <div className="absolute inset-0 bg-paper-texture opacity-40 mix-blend-multiply"></div>}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative z-10">
            {renderContent()}
        </div>
        
        {/* Navigation */}
        <TabBar current={view} onChange={setView} theme={theme} />
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}

export default App;
