import { useRef, useState, useEffect } from 'react';

export const TypographyWhiteboard = ({ fontStyle, onSaveStyleAsset, onClearBoard }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let displayFont = '100px sans-serif';
    if (fontStyle) {
      displayFont = fontStyle.replace(/\d+(?:\.\d+)?(?:px|em|rem|pt)(?:\/\d+(?:\.\d+)?)?/g, '180px');
    }
    ctx.font = displayFont;
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Aa', canvas.width / 2, canvas.height / 2);
    if (onClearBoard) onClearBoard();
  }, [fontStyle, onClearBoard]);

  const getCoords = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing || !isExpanded) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e, canvas);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b'; 
    ctx.lineTo(x, y);
    ctx.stroke();
    setCurrentStroke(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (currentStroke.length > 0) {
        setStrokes(prev => [...prev, currentStroke]);
        setCurrentStroke([]);
      }
    }
  };

  const clearCanvas = (e) => {
    if (e) e.stopPropagation();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let displayFont = '100px sans-serif';
    if (fontStyle) {
      displayFont = fontStyle.replace(/\d+(?:\.\d+)?(?:px|em|rem|pt)(?:\/\d+(?:\.\d+)?)?/g, '180px');
    }
    ctx.font = displayFont;
    ctx.fillStyle = '#e2e8f0'; 
    ctx.fillText('Aa', canvas.width / 2, canvas.height / 2);
    setStrokes([]);
    setCurrentStroke([]);
    if (onClearBoard) onClearBoard();
  };

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 z-[190] bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsExpanded(false)}></div>
      )}
      <div className={isExpanded ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl z-[200] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col p-5 animate-fade-in border border-slate-200 dark:border-slate-700" : "space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700/50"}>
        <div className="flex justify-between items-center mb-2">
          <h4 className={`font-black uppercase tracking-wider text-slate-400 ${isExpanded ? 'text-sm' : 'text-[10px]'}`}>Typography Whiteboard {isExpanded && '(Expanded)'}</h4>
          <div className="flex space-x-2">
            <button onClick={(e) => {
              e.stopPropagation();
              if (onSaveStyleAsset) onSaveStyleAsset(canvasRef.current.toDataURL('image/png'), strokes);
            }} className={`font-bold text-slate-500 hover:text-[var(--accent)] transition-colors bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg ${isExpanded ? 'text-xs' : 'text-[9px]'}`}>
              Save Style Asset
            </button>
            <button onClick={clearCanvas} className={`font-bold text-slate-500 hover:text-[var(--accent)] transition-colors bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg ${isExpanded ? 'text-xs' : 'text-[9px]'}`}>
              Clear Board
            </button>
            {isExpanded && (
              <button onClick={() => setIsExpanded(false)} className="font-bold text-slate-500 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs">
                Close
              </button>
            )}
          </div>
        </div>
        <div className={`w-full bg-white rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm cursor-crosshair touch-none ${isExpanded ? '' : 'relative group'}`}>
          {!isExpanded && (
            <div className="absolute inset-0 bg-slate-900/5 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Click to expand & draw</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            className={isExpanded ? 'w-full h-auto aspect-[2/1]' : 'w-full h-[140px] object-cover'}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </>
  );
};
