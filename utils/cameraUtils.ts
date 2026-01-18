
/**
 * Utility for handling Camera and Canvas processing for "Spirit Horse" photos.
 * Pure frontend, no backend.
 */

export type FilterType = 'ink' | 'cyber' | 'none';

// Check if camera is supported
export const hasCameraSupport = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Start Camera Stream
export const startCamera = async (videoElement: HTMLVideoElement): Promise<MediaStream> => {
    // Prefer user facing camera for selfies, environment for world
    const constraints = { 
        video: { 
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 720 }
        }, 
        audio: false 
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        await videoElement.play();
        return stream;
    } catch (err) {
        console.error("Camera Access Error:", err);
        throw err;
    }
};

// Stop Camera
export const stopCamera = (stream: MediaStream | null) => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
};

// Apply Filter Logic to Canvas
export const processFrame = (
    ctx: CanvasRenderingContext2D, 
    video: HTMLVideoElement, 
    width: number, 
    height: number, 
    type: FilterType
) => {
    // 1. Draw raw video frame (mirroring if user facing)
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    const frameData = ctx.getImageData(0, 0, width, height);
    const data = frameData.data;

    // 2. Pixel Manipulation
    if (type === 'ink') {
        // High contrast B&W + Noise
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Luminance
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Thresholding for Ink look
            gray = gray > 120 ? 245 : (gray < 60 ? 30 : gray);
            
            // Add slight sepia/warmth
            data[i] = gray + 20;     // R
            data[i + 1] = gray + 10; // G
            data[i + 2] = gray;      // B
        }
    } else if (type === 'cyber') {
        // Green tint + randomized glitch lines
        const time = Date.now();
        const glitchLine = Math.floor(time / 100) % height;
        
        for (let i = 0; i < data.length; i += 4) {
            // Boost Green, reduce Red/Blue for matrix look
            data[i] = data[i] * 0.8; // R
            data[i + 1] = Math.min(255, data[i + 1] * 1.2); // G
            data[i + 2] = data[i + 2] * 0.8; // B

            // Simple Scanline effect (darken every other line)
            const y = Math.floor((i / 4) / width);
            if (y % 2 === 0) {
                data[i] *= 0.8;
                data[i+1] *= 0.8;
                data[i+2] *= 0.8;
            }

            // Glitch band
            if (Math.abs(y - glitchLine) < 5) {
                data[i] = Math.min(255, data[i] + 100); // Red glitch
            }
        }
    }

    ctx.putImageData(frameData, 0, 0);

    // 3. Overlays (Canvas Drawing)
    if (type === 'ink') {
        // Add Vignette
        const gradient = ctx.createRadialGradient(width/2, height/2, width/3, width/2, height/2, width*0.8);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(40,30,30,0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,width,height);

        // Stamp
        ctx.strokeStyle = '#A62419';
        ctx.lineWidth = 4;
        ctx.strokeRect(width - 80, 20, 60, 60);
        ctx.font = 'bold 30px "Ma Shan Zheng", serif';
        ctx.fillStyle = '#A62419';
        ctx.fillText('午', width - 60, 60);
    } else if (type === 'cyber') {
        // HUD Corners
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        const len = 40;
        
        // TL
        ctx.beginPath(); ctx.moveTo(10, 10+len); ctx.lineTo(10,10); ctx.lineTo(10+len, 10); ctx.stroke();
        // TR
        ctx.beginPath(); ctx.moveTo(width-10-len, 10); ctx.lineTo(width-10,10); ctx.lineTo(width-10, 10+len); ctx.stroke();
        // BL
        ctx.beginPath(); ctx.moveTo(10, height-10-len); ctx.lineTo(10,height-10); ctx.lineTo(10+len, height-10); ctx.stroke();
        // BR
        ctx.beginPath(); ctx.moveTo(width-10-len, height-10); ctx.lineTo(width-10,height-10); ctx.lineTo(width-10, height-10-len); ctx.stroke();

        // Text
        ctx.font = '12px "Courier New"';
        ctx.fillStyle = '#00FF00';
        ctx.fillText('REC // 2026.SYS', 20, height - 20);
    }
};
