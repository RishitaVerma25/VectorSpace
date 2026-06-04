import { useRef, useEffect, useState } from 'react';

const imageCache = new Map();

export const ImageComparisonSlider = ({ beforeUrl, afterUrl, viewMode }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [loaded, setLoaded] = useState(() => imageCache.has(beforeUrl) && imageCache.has(afterUrl));

  useEffect(() => {
    if (loaded) return;
    let count = 0;
    const check = () => {
      count++;
      if (count === 2) setLoaded(true);
    };
    
    [beforeUrl, afterUrl].forEach(url => {
      if (imageCache.has(url)) {
        check();
      } else {
        const img = new Image();
        img.onload = () => {
          imageCache.set(url, true);
          check();
        };
        img.onerror = check; // fallback
        img.src = url;
      }
    });
  }, [beforeUrl, afterUrl, loaded]);

  return (
    <div className={`relative ${viewMode === 'list' ? 'w-12 h-12' : 'w-full h-20'} rounded-2xl overflow-hidden group/slider border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-200 dark:bg-slate-800 ${!loaded ? 'animate-pulse' : ''}`}>
      {loaded && (
        <>
          <img src={afterUrl} className="absolute inset-0 w-full h-full object-cover" alt="After" draggable={false} />
          <img src={beforeUrl} className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }} alt="Before" draggable={false} />
          <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10" />
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)] z-0 pointer-events-none" style={{ left: `${sliderPos}%` }}>
            <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4.5 h-4.5 bg-white rounded-full shadow-lg border border-slate-300 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const PreviewSandboxCanvas = ({ previewText, strokes }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !strokes || strokes.length === 0) return;
    const ctx = canvas.getContext('2d');
    
    // Calculate bounding box of the drawn strokes
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    strokes.forEach(stroke => {
      stroke.forEach(point => {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      });
    });

    const strokeWidth = maxX - minX || 1;
    const strokeHeight = maxY - minY || 1;

    // Define target character dimensions
    const targetHeight = 40; 
    const scale = targetHeight / strokeHeight;
    const charWidth = strokeWidth * scale + 5; // adding a little spacing

    // Calculate total canvas width based on text length
    canvas.width = previewText.length * charWidth;
    canvas.height = targetHeight + 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';

    // Draw characters
    for (let i = 0; i < previewText.length; i++) {
      const char = previewText[i];
      if (char === ' ') continue; // Skip space drawing

      const startX = i * charWidth;
      
      ctx.save();
      ctx.translate(startX - minX * scale, 5 - minY * scale);
      ctx.scale(scale, scale);
      
      strokes.forEach(stroke => {
        if (stroke.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let j = 1; j < stroke.length; j++) {
          ctx.lineTo(stroke[j].x, stroke[j].y);
        }
        ctx.stroke();
      });
      
      ctx.restore();
    }
  }, [previewText, strokes]);

  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full h-auto object-contain bg-transparent"
    />
  );
};
