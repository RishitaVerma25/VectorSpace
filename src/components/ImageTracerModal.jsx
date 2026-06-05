import { useState, useEffect } from 'react';

export default function ImageTracerModal({ isOpen, onClose, onTraceComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Tracing Options
  const [preset, setPreset] = useState('default'); // default, posterized1, posterized2, curvaceous, sharp, blackandwhite

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      // Don't intercept paste if user is typing in another input
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleTrace = () => {
    if (!previewUrl) return;
    setIsProcessing(true);

    // We use setTimeout to allow the UI to update to 'processing' state before freezing the main thread.
    setTimeout(() => {
      try {
        // Downscale image before tracing to drastically improve speed
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300; // Aggressively cap resolution for instant tracing speed
          let width = img.width;
          let height = img.height;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          // Fill white background for transparent PNGs to trace nicely
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const optimizedUrl = canvas.toDataURL('image/png');

          import('imagetracerjs').then((module) => {
            const ImageTracer = module.default || module;
            ImageTracer.imageToSVG(
              optimizedUrl,
              (svgstr) => {
                setIsProcessing(false);
                // Clean up the SVG
                const cleanSvg = svgstr.replace(/<\?xml.*\?>/g, '').trim();
                onTraceComplete(cleanSvg);
                resetAndClose();
              },
              preset
            );
          }).catch(err => {
            console.error('Failed to load ImageTracer library', err);
            alert('Failed to load tracing library. Please check your connection.');
            setIsProcessing(false);
          });
        };
        img.src = previewUrl;
      } catch (err) {
        console.error('Tracing failed:', err);
        alert('Failed to trace image. Try a simpler or smaller image.');
        setIsProcessing(false);
      }
    }, 100);
  };

  const resetAndClose = () => {
    setPreviewUrl(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={resetAndClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scale-in">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <svg className="text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span>Image-to-SVG Converter</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Convert any PNG/JPG into infinitely scalable SVG paths.</p>
          </div>
          <button onClick={resetAndClose} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">

          {!previewUrl ? (
            <div
              onDragEnter={(e) => e.preventDefault()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-default transition-all overflow-hidden ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)] dark:bg-[var(--accent-light)]' : 'border-slate-300 dark:border-slate-700 hover:border-[var(--accent)] hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center mb-4 text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 pointer-events-none">Drag & Drop Image Here</span>
              <span className="text-xs text-slate-500 mt-1 pointer-events-none">or paste directly (Ctrl+V)</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center h-48">
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <svg className="animate-spin text-[var(--accent)] mb-3" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                    <span className="text-sm font-bold text-[var(--accent)]">Tracing Vectors...</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tracing Detail Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'default', label: 'Default (Balanced)' },
                    { id: 'posterized1', label: 'High Color (Detailed)' },
                    { id: 'posterized2', label: 'Low Color (Simple)' },
                    { id: 'curvaceous', label: 'Smooth Curves' },
                    { id: 'sharp', label: 'Sharp Edges' },
                    { id: 'blackandwhite', label: 'Monochrome Logo' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPreset(opt.id)}
                      disabled={isProcessing}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-all ${preset === opt.id
                        ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] dark:bg-[var(--accent-light)] dark:text-[var(--accent)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <span className="font-bold">💡 Tip:</span> Looking for UI icons like checkmarks or user profiles? Try our <strong className="font-bold text-amber-800 dark:text-amber-300">Native Icon Search</strong> instead for cleaner, mathematically perfect vectors!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={() => { setPreviewUrl(null); }}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleTrace}
              disabled={isProcessing}
              className="px-6 py-2 text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl transition-all shadow-md shadow-[var(--accent-ring)] disabled:opacity-50 flex items-center space-x-2"
            >
              <span>Convert to SVG</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
