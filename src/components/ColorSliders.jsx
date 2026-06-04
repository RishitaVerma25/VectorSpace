import { hexToRgb, rgbToHex } from '../utils/colorMath';

export const ColorSliders = ({ hexColor, onChange }) => {
  const rgb = hexToRgb(hexColor) || { r: 0, g: 0, b: 0 };

  const handleRgbChange = (channel, value) => {
    const nextValue = Math.min(255, Math.max(0, parseInt(value) || 0));
    const nextRgb = { ...rgb, [channel]: nextValue };
    onChange(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b));
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex space-x-2">
        <div className="flex-1">
          <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">R</label>
          <input
            type="number"
            min="0" max="255"
            value={rgb.r}
            onChange={(e) => handleRgbChange('r', e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--accent-ring)] outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">G</label>
          <input
            type="number"
            min="0" max="255"
            value={rgb.g}
            onChange={(e) => handleRgbChange('g', e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--accent-ring)] outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">B</label>
          <input
            type="number"
            min="0" max="255"
            value={rgb.b}
            onChange={(e) => handleRgbChange('b', e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--accent-ring)] outline-none"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div>
          <input
            type="range"
            min="0" max="255"
            value={rgb.r}
            onChange={(e) => handleRgbChange('r', e.target.value)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))` }}
          />
        </div>
        <div>
          <input
            type="range"
            min="0" max="255"
            value={rgb.g}
            onChange={(e) => handleRgbChange('g', e.target.value)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))` }}
          />
        </div>
        <div>
          <input
            type="range"
            min="0" max="255"
            value={rgb.b}
            onChange={(e) => handleRgbChange('b', e.target.value)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))` }}
          />
        </div>
      </div>
    </div>
  );
};
