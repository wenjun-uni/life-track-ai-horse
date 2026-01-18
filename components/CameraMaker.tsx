
import React, { useRef, useState, useEffect } from 'react';
import { hasCameraSupport, startCamera, stopCamera, processFrame, FilterType } from '../utils/cameraUtils';
import { Button } from './Button';
import { soundManager } from '../utils/soundManager';
import { AppTheme } from '../types';

interface CameraMakerProps {
  theme: AppTheme;
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraMaker: React.FC<CameraMakerProps> = ({ theme, onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<FilterType>(theme === 'cyber' ? 'cyber' : 'ink');
  const [isProcessing, setIsProcessing] = useState(true);

  // Initialize Camera
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
        if (!hasCameraSupport()) {
            setError("设备不支持摄像头");
            setIsProcessing(false);
            return;
        }
        try {
            if (videoRef.current) {
                const s = await startCamera(videoRef.current);
                if (mounted) setStream(s);
            }
        } catch (e) {
            if (mounted) setError("无法访问摄像头 (请检查权限)");
            setIsProcessing(false);
        }
    };
    init();

    return () => {
        mounted = false;
        if (stream) stopCamera(stream);
    };
  }, []);

  // Frame Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
        if (videoRef.current && canvasRef.current && !videoRef.current.paused && !videoRef.current.ended) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                processFrame(ctx, videoRef.current, canvasRef.current.width, canvasRef.current.height, mode);
            }
        }
        animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [mode, stream]);

  const handleSnap = () => {
    if (canvasRef.current) {
        soundManager.play('success.stamp');
        const data = canvasRef.current.toDataURL('image/png');
        onCapture(data);
    }
  };

  const isCyber = theme === 'cyber';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isCyber ? 'bg-black text-white' : 'bg-paper-100 text-black'}`}>
        {/* Header */}
        <div className="p-4 flex justify-between items-center z-10">
            <h3 className="font-bold text-lg">火马映相 · Spirit Cam</h3>
            <button onClick={onClose} className="p-2 opacity-60">关闭</button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            {error ? (
                <div className="text-white p-6 text-center">
                    <div className="text-2xl mb-2">🚫</div>
                    <p>{error}</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-black rounded">退出</button>
                </div>
            ) : (
                <>
                    {/* Hidden Video Source */}
                    <video ref={videoRef} className="absolute opacity-0 pointer-events-none" playsInline muted autoPlay />
                    {/* Render Canvas */}
                    <canvas ref={canvasRef} className="w-full h-full object-cover" />
                    
                    {/* Filter Switcher Overlay */}
                    <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4">
                        <button onClick={() => setMode('ink')} className={`px-4 py-2 rounded-full text-xs font-bold border ${mode === 'ink' ? 'bg-white text-black' : 'bg-black/50 text-white border-white'}`}>墨影</button>
                        <button onClick={() => setMode('cyber')} className={`px-4 py-2 rounded-full text-xs font-bold border ${mode === 'cyber' ? 'bg-green-500 text-black' : 'bg-black/50 text-white border-green-500'}`}>赛博</button>
                    </div>
                </>
            )}
        </div>

        {/* Footer Action */}
        <div className="p-6 pb-10 flex justify-center bg-transparent absolute bottom-0 w-full pointer-events-none">
            {!error && (
                <button 
                    onClick={handleSnap} 
                    className={`pointer-events-auto w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isCyber ? 'border-cyber-primary bg-black/50' : 'border-cinnabar-700 bg-white/50'}`}
                >
                    <div className={`w-12 h-12 rounded-full ${isCyber ? 'bg-cyber-primary' : 'bg-cinnabar-700'}`}></div>
                </button>
            )}
        </div>
    </div>
  );
};
