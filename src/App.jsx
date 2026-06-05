import { useState, useMemo, useEffect, useRef } from 'react';
import {
  getHarmonies,
  simulateColorBlindness,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb
} from './utils/colorMath';
import { exportW3CTokens, generateThemeCSS, exportZip, downloadFile } from './utils/exportEngine';
import { TypographyWhiteboard } from './components/TypographyWhiteboard';
import { ImageComparisonSlider } from './components/PreviewSandbox';
import { Sidebar } from './components/Sidebar';
import { AuthHeaderControls } from './components/AuthHeaderControls';
import { LoginGateway } from './components/LoginGateway';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { db, doc, setDoc, getDoc, collection, query, where, getDocs } from './firebase';
import { ContextMenu } from './components/ContextMenu';
import { SkeletonCard, SkeletonInspector } from './components/SkeletonLoader';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ColorSliders } from './components/ColorSliders';
import ImageTracerModal from './components/ImageTracerModal';
import IconSearchModal from './components/IconSearchModal';
import VectorSpaceLogo from './components/VectorSpaceLogo';
import HelpGuide from './components/HelpGuide';
import AIGeneratorModal from './components/AIGeneratorModal';

// Pre-loaded icons for the Icon Library Browser
const PRELOADED_ICONS = [
  { name: 'Home', tags: 'icon, home, layout', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { name: 'Settings', tags: 'icon, settings, gear, config', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
  { name: 'Search', tags: 'icon, search, magnifier, find', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' },
  { name: 'Trash', tags: 'icon, delete, remove, bin', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' },
  { name: 'Heart', tags: 'icon, love, like, favorite', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
  { name: 'Star', tags: 'icon, rate, favorite, bookmark', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  { name: 'Check', tags: 'icon, success, done, ok', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' },
  { name: 'Alert Circle', tags: 'icon, warning, danger, error', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
  { name: 'Info', tags: 'icon, details, help, feedback', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' },
  { name: 'Menu', tags: 'icon, hamburger, navigation, collapse', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' },
  { name: 'User', tags: 'icon, profile, account, avatar', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { name: 'Close', tags: 'icon, close, cancel, dismiss', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' }
];

// Helper to generate dynamic shade variants for the selected custom accent color
const getAccentVariants = (hex) => {
  try {
    const rgb = hexToRgb(hex);
    // Darken for hover (multiply by 0.85)
    const hover = rgbToHex(Math.round(rgb.r * 0.85), Math.round(rgb.g * 0.85), Math.round(rgb.b * 0.85));
    // Light tint (add transparency)
    const light = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
    const ring = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    return { hover, light, ring };
  } catch {
    return { hover: '#004d5e', light: 'rgba(0, 95, 115, 0.1)', ring: 'rgba(0, 95, 115, 0.3)' };
  }
};

// Relative Luminance for WCAG Contrast
const getRelativeLuminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Calculate Contrast Ratio
const getContrastRatio = (hex1, hex2) => {
  try {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return '1.00';
    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
  } catch {
    return '1.00';
  }
};

// Generate full 50-950 Tailwind-style shade scale
const generateTailwindShades = (hex) => {
  try {
    const { r, g, b } = hexToRgb(hex);
    const { h, s } = rgbToHsl(r, g, b);

    const shadeLevels = [
      { label: '50', l: 0.97 },
      { label: '100', l: 0.92 },
      { label: '200', l: 0.84 },
      { label: '300', l: 0.74 },
      { label: '400', l: 0.60 },
      { label: '500', l: 0.48 },
      { label: '600', l: 0.40 },
      { label: '700', l: 0.32 },
      { label: '800', l: 0.24 },
      { label: '900', l: 0.16 },
      { label: '950', l: 0.08 }
    ];

    return shadeLevels.map(level => {
      const { r: nr, g: ng, b: nb } = hslToRgb(h, s, level.l);
      return {
        label: level.label,
        hex: rgbToHex(nr, ng, nb)
      };
    });
  } catch {
    return [];
  }
};

// Safely resize SVG string without breaking internal elements
const formatSvg = (svgStr, sizeObj, newStrokeWidth) => {
  if (!svgStr || typeof svgStr !== 'string') return '';
  let formatted = svgStr;

  // Only modify the attributes on the opening <svg> tag.
  formatted = formatted.replace(/<svg([^>]*)>/i, (match, attrs) => {
    let newAttrs = attrs;

    if (sizeObj && sizeObj.width) {
      if (/width="[^"]*"/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/width="[^"]*"/i, `width="${sizeObj.width}"`);
      } else {
        newAttrs += ` width="${sizeObj.width}"`;
      }
    }

    if (sizeObj && sizeObj.height) {
      if (/height="[^"]*"/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/height="[^"]*"/i, `height="${sizeObj.height}"`);
      } else {
        newAttrs += ` height="${sizeObj.height}"`;
      }
    }

    return `<svg${newAttrs}>`;
  });

  if (newStrokeWidth !== undefined) {
    formatted = formatted.replace(/stroke-width="[^"]*"/g, `stroke-width="${newStrokeWidth}"`);
  }

  return formatted;
};

// Seeds for first loading
const INITIAL_WORKSPACES = [
  { id: 'ws-1', name: 'Brand Identity Primary', description: 'Core application primitives, typography guidelines, and icons.', color: '#005F73' },
  { id: 'ws-2', name: 'Portal Dashboard Layout', description: 'Marketing interface metrics and content-focused graphics.', color: '#10b981' }
];

const INITIAL_ASSETS = [
  { id: 'a-1', workspaceId: 'ws-1', type: 'color', name: 'Brand Neon', value: '#005F73', tags: 'primary, brand, app-core', isPinned: true, notes: 'The primary interactive color for buttons, focus rings, and hero graphics.', history: [] },
  { id: 'a-2', workspaceId: 'ws-1', type: 'svg', name: 'Nav Close', value: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>', tags: 'icon, nav, vector', notes: 'Standard dismiss / exit symbol used inside nav headers.', history: [] },
  { id: 'a-3', workspaceId: 'ws-2', type: 'color', name: 'Cyber Mint', value: '#10b981', tags: 'secondary, success', notes: 'Positive status indicator accent color.', history: [] },
  { id: 'a-4', workspaceId: 'ws-1', type: 'gradient', name: 'Sunset Vibe', value: 'linear-gradient(135deg, #f43f5e, #f59e0b)', tags: 'gradient, warm, background', notes: 'Used on landing page cards and decorative elements.', history: [] },
  { id: 'a-5', workspaceId: 'ws-1', type: 'svg', name: 'User Profile', value: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', tags: 'icon, user, avatar', notes: 'Placeholder avatar for navigation dropdown top headers.', history: [] },
  { id: 'a-6', workspaceId: 'ws-1', type: 'color', name: 'Warning Orange', value: '#f97316', tags: 'alert, warning, system', notes: 'Warning banners and caution flags.', history: [] },
  { id: 'a-7', workspaceId: 'ws-1', type: 'typography', name: 'Heading Font', value: '700 32px Outfit', tags: 'font, typography, heading', notes: 'Modern Outfit heading font used for section headers.', history: [] },
  { id: 'a-8', workspaceId: 'ws-1', type: 'shadow', name: 'Elevated Card', value: '0 25px 50px -12px rgba(0,0,0,0.25)', tags: 'shadow, depth, elevation', notes: 'Provides heavy floating layer separation.', history: [] },
  { id: 'a-9', workspaceId: 'ws-1', type: 'compare', name: 'Filter Upgrade', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&grayscale=1|https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', tags: 'image, comparison, grayscale', notes: 'Before/after demo representing image editor grayscale filter filters.', history: [] },
  { id: 'a-10', workspaceId: 'ws-1', type: 'compare', name: 'City Skyline', value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80&sat=-100|https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', tags: 'image, comparison, skyline', notes: 'Saturation adjustments comparison example.', history: [] },
  { id: 'a-11', workspaceId: 'ws-1', type: 'gradient', name: 'Cosmic Wave', value: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #ec4899)', tags: 'gradient, cool, accent', notes: 'Fancy primary header title backdrop gradient.', history: [] },
  { id: 'a-12', workspaceId: 'ws-1', type: 'svg', name: 'Heart Favorite', value: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>', tags: 'icon, social, feedback', notes: 'Favorite / bookmark icon button.', history: [] }
];

import { AppProvider } from './context/AppContext';

const TagAutocompleteInput = ({ value, onChange, availableTags, placeholder, className }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentWord = value.split(',').pop().trim().toLowerCase();
  const suggestions = currentWord ? availableTags.filter(t => t.includes(currentWord) && t !== currentWord).slice(0, 5) : [];

  const handleSelect = (tag) => {
    const parts = value.split(',');
    parts.pop();
    const newValue = [...parts.map(p => p.trim()), tag].filter(Boolean).join(', ') + ', ';
    onChange(newValue);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {suggestions.map(tag => (
            <div
              key={tag}
              onClick={() => handleSelect(tag)}
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-[var(--accent-light)] dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const generateAssetId = () => `asset-${Date.now()}`;

// Migration helper: replace stale indigo (#6366f1) brand color with new deep teal (#005F73)
const migrateIndigoToTeal = (workspaces, assets) => ({
  workspaces: workspaces.map(ws => ws.color === '#6366f1' ? { ...ws, color: '#005F73' } : ws),
  assets: assets.map(a => a.value === '#6366f1' ? { ...a, value: '#005F73' } : a),
});

export default function App() {
  const { user, isLoading } = useAuth();
  const { showToast, showConfirm } = useToast();
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isHelpGuideOpen, setIsHelpGuideOpen] = useState(false);
  const [isIconSearchOpen, setIsIconSearchOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const hasLoadedFromCloud = useRef(false);

  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const stored = localStorage.getItem('wv_workspaces');
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed)) {
        // Migrate: replace old indigo brand color with new deep teal
        return parsed.map(ws => ws.color === '#6366f1' ? { ...ws, color: '#005F73' } : ws);
      }
      return INITIAL_WORKSPACES;
    } catch {
      return INITIAL_WORKSPACES;
    }
  });
  const [assets, setAssets] = useState(() => {
    try {
      const stored = localStorage.getItem('wv_assets');
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed)) {
        // Migrate: replace old indigo asset values with new deep teal
        return parsed.map(a => a.value === '#6366f1' ? { ...a, value: '#005F73' } : a);
      }
      return INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(workspaces[0]?.id || '');
  
  const [folders, setFolders] = useState(() => {
    try {
      const stored = localStorage.getItem('wv_folders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeFolderId, setActiveFolderId] = useState(null);
  // --- UNDO / REDO HISTORY ARCHITECTURE ---
  const historyRef = useRef({ stack: [], index: -1 });

  const commitAssetsUpdate = (newAssetsOrCallback) => {
    setAssets(prevAssets => {
      const nextAssets = typeof newAssetsOrCallback === 'function' ? newAssetsOrCallback(prevAssets) : newAssetsOrCallback;

      let { stack, index } = historyRef.current;
      if (stack.length === 0) {
        stack.push(prevAssets);
        index = 0;
      }
      stack = stack.slice(0, index + 1);
      stack.push(nextAssets);
      if (stack.length > 50) {
        stack.shift();
      }
      historyRef.current = { stack, index: stack.length - 1 };

      return nextAssets;
    });
  };

  // --- INLINE EDITING STATE ---
  const [inlineEditAssetId, setInlineEditAssetId] = useState(null);
  const [inlineEditForm, setInlineEditForm] = useState({ name: '', value: '' });

  const handleInlineSave = (asset) => {
    if (!inlineEditAssetId) return;
    commitAssetsUpdate(prev => prev.map(a => a.id === asset.id ? {
      ...a,
      name: inlineEditForm.name,
      value: inlineEditForm.value,
      lastModified: new Date().toISOString()
    } : a));
    setInlineEditAssetId(null);
  };


  // UI Basic States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('wv_sidebar_collapsed') === 'true');

  // --- SWIPE TO DELETE STATE (MOBILE) ---
  const swipeStartX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState({ id: null, offset: 0 });

  const handleTouchStart = (e, assetId) => {
    swipeStartX.current = e.touches[0].clientX;
    setSwipeOffset({ id: assetId, offset: 0 });
  };

  const handleTouchMove = (e, assetId) => {
    if (swipeOffset.id !== assetId) return;
    const diff = e.touches[0].clientX - swipeStartX.current;
    if (diff < 0) { // only swipe left
      setSwipeOffset({ id: assetId, offset: Math.max(diff, -100) }); // max 100px left
    }
  };

  const handleTouchEnd = (e, assetId) => {
    if (swipeOffset.id === assetId) {
      if (swipeOffset.offset <= -60) {
        // threshold met, keep it open, wait for delete click or tap away
        setSwipeOffset({ id: assetId, offset: -80 });
      } else {
        setSwipeOffset({ id: null, offset: 0 });
      }
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('All');
  const [copiedText, setCopiedText] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Custom Accent — migrate old indigo (#6366f1) to new deep teal (#005F73)
  const [accentColor, setAccentColor] = useState(() => {
    const stored = localStorage.getItem('wv_accent');
    if (!stored || stored === '#6366f1') {
      localStorage.setItem('wv_accent', '#005F73');
      return '#005F73';
    }
    return stored;
  });

  // Sorting
  const [sortMode, setSortMode] = useState('custom');

  // Bulk Edit
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Spotlight Search (/)
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [spotlightSelectedIndex, setSpotlightSelectedIndex] = useState(0);

  // Visual Helper Modals
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  const [iconLibrarySearch, setIconLibrarySearch] = useState('');
  const [showGradientBuilder, setShowGradientBuilder] = useState(false);
  const [isImageTracerOpen, setIsImageTracerOpen] = useState(false);

  // Gradient Builder Temporary States
  const [gradStart, setGradStart] = useState('#f43f5e');
  const [gradEnd, setGradEnd] = useState('#f59e0b');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradType, setGradType] = useState('linear');

  // Onboarding Tour
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Active Asset Selection
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // Recent Assets Rail
  const [recentAssets, setRecentAssets] = useState(() => {
    try {
      const stored = localStorage.getItem('wv_recent_assets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keyboard Shortcuts Modal
  const [showShortcuts, setShowShortcuts] = useState(false);

  // New Asset Form States
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('color');
  const [newAssetValue, setNewAssetValue] = useState('#005F73');
  const [newAssetTags, setNewAssetTags] = useState('');

  // SVG Controls
  const [svgScale, setSvgScale] = useState(1);
  const [svgColor, setSvgColor] = useState('#ffffff');
  const [svgStroke, setSvgStroke] = useState(2);

  // Contrast checker secondary color
  const [contrastBg, setContrastBg] = useState('#ffffff');

  // Sandbox checkboxes
  const [sandboxApplied, setSandboxApplied] = useState({
    btnBg: true,
    btnText: false,
    textHeading: false,
    cardBorder: false,
    cardBg: false,
    headerBanner: true,
    showIconBtn: true,
    shadowCard: true
  });

  // Active Edit Asset States (Inside details view)
  const [isEditingAsset, setIsEditingAsset] = useState(false);
  const [editAssetName, setEditAssetName] = useState('');
  const [editAssetValue, setEditAssetValue] = useState('');
  const [codeUndoCache, setCodeUndoCache] = useState(null);
  const [editAssetTags, setEditAssetTags] = useState('');
  const [editAssetNotes, setEditAssetNotes] = useState('');
  const [editFolderId, setEditFolderId] = useState(null);

  // Code Snippet generator active tab
  const [snippetTab, setSnippetTab] = useState('tailwind');

  // Drag State
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Theme State (Dark mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Share URL Toast Alert
  const [shareLoadedToast, setShareLoadedToast] = useState(false);
  const accentVars = useMemo(() => getAccentVariants(accentColor), [accentColor]);

  // Context Menu state
  const [contextMenuState, setContextMenuState] = useState({ isOpen: false, x: 0, y: 0, asset: null });

  const handleContextMenu = (e, asset) => {
    e.preventDefault();
    setContextMenuState({ isOpen: true, x: e.clientX, y: e.clientY, asset });
  };

  const handleContextMenuAction = (action, payload) => {
    const asset = contextMenuState.asset;
    if (!asset) return;

    if (action === 'copy') triggerCopy(asset.value);
    else if (action === 'pin') togglePinAsset(asset.id, { stopPropagation: () => { } });
    else if (action === 'duplicate') duplicateAsset(asset, { stopPropagation: () => { } });
    else if (action === 'delete') handleDeleteAsset(asset.id, { stopPropagation: () => { } });
    else if (action === 'move') moveAssetToWorkspace(asset.id, payload);

    setContextMenuState(prev => ({ ...prev, isOpen: false }));
  };

  const moveAssetToWorkspace = (assetId, targetWsId) => {
    commitAssetsUpdate(prev => prev.map(a => a.id === assetId ? { ...a, workspaceId: targetWsId } : a));
    showToast('Asset moved to new workspace', 'success');
  };

  // Effects: Apply theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  // Effects: Sync Sidebar Collapse
  useEffect(() => {
    localStorage.setItem('wv_sidebar_collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Effects: Inject Accent Color Primitives
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', accentColor);
    const { hover, light, ring } = getAccentVariants(accentColor);
    root.style.setProperty('--accent-hover', hover);
    root.style.setProperty('--accent-light', light);
    root.style.setProperty('--accent-ring', ring);
    localStorage.setItem('wv_accent', accentColor);
  }, [accentColor]);

  // Effects: Hybrid Storage sync (localStorage / Firestore cloud sync)
  useEffect(() => {
    if (!user) {
      hasLoadedFromCloud.current = false;
    }
  }, [user]);

  // Load data from cloud (Firestore) or fallback to local storage
  useEffect(() => {
    if (isLoading) return;

    const fetchCloudData = async () => {
      if (user) {
        setIsCloudSyncing(true);
        try {
          const userDocRef = doc(db, 'users', user.uid, 'vault', 'data');
          const docSnap = await getDoc(userDocRef);

          let localWS = null;
          let localAssets = null;
          try {
            const storedWS = localStorage.getItem('wv_workspaces');
            localWS = storedWS ? JSON.parse(storedWS) : null;
            const storedAssets = localStorage.getItem('wv_assets');
            localAssets = storedAssets ? JSON.parse(storedAssets) : null;
          } catch (e) {
            console.error("Error reading localStorage", e);
          }

          if (docSnap.exists()) {
            const cloudData = docSnap.data();
            const cloudWS = cloudData.workspaces || [];
            const cloudAssets = cloudData.assets || [];

            // Offer to merge if local data exists and is different from default INITIAL_WORKSPACES
            const hasLocalData = localWS && (localWS.length > INITIAL_WORKSPACES.length || localWS.some((w, idx) => w.name !== INITIAL_WORKSPACES[idx]?.name));

            if (hasLocalData) {
              if (await showConfirm("We found local workspaces and assets on this device. Would you like to merge them into your Google Cloud Vault?")) {
                const mergedWS = [...cloudWS];
                localWS.forEach(lws => {
                  if (!mergedWS.some(cws => cws.id === lws.id)) {
                    mergedWS.push(lws);
                  }
                });

                const mergedAssets = [...cloudAssets];
                localAssets.forEach(la => {
                  if (!mergedAssets.some(ca => ca.id === la.id)) {
                    mergedAssets.push(la);
                  }
                });

                const { workspaces: mWS, assets: mAssets } = migrateIndigoToTeal(mergedWS, mergedAssets);
                setWorkspaces(mWS);
                setAssets(mAssets);

                await setDoc(userDocRef, {
                  workspaces: mWS,
                  assets: mAssets,
                  updatedAt: new Date().toISOString()
                });

                localStorage.removeItem('wv_workspaces');
                localStorage.removeItem('wv_assets');
              } else {
                const { workspaces: mWS, assets: mAssets } = migrateIndigoToTeal(cloudWS, cloudAssets);
                setWorkspaces(mWS);
                setAssets(mAssets);
                localStorage.removeItem('wv_workspaces');
                localStorage.removeItem('wv_assets');
              }
            } else {
              const { workspaces: mWS, assets: mAssets } = migrateIndigoToTeal(cloudWS, cloudAssets);
              setWorkspaces(mWS);
              setAssets(mAssets);
            }
          } else {
            // First time sync, save current state to cloud
            const currentWS = localWS || INITIAL_WORKSPACES;
            const currentAssets = localAssets || INITIAL_ASSETS;

            await setDoc(userDocRef, {
              workspaces: currentWS,
              assets: currentAssets,
              updatedAt: new Date().toISOString()
            });

            setWorkspaces(currentWS);
            setAssets(currentAssets);

            localStorage.removeItem('wv_workspaces');
            localStorage.removeItem('wv_assets');
          }
          hasLoadedFromCloud.current = true;
        } catch (error) {
          console.error("Firestore sync fetch error:", error);
        } finally {
          setIsCloudSyncing(false);
        }
      } else {
        // Logged out: load from localStorage
        try {
          const storedWS = localStorage.getItem('wv_workspaces');
          const parsedWS = storedWS ? JSON.parse(storedWS) : INITIAL_WORKSPACES;
          const storedAssets = localStorage.getItem('wv_assets');
          const parsedAssets = storedAssets ? JSON.parse(storedAssets) : INITIAL_ASSETS;
          const storedFolders = localStorage.getItem('wv_folders');
          const parsedFolders = storedFolders ? JSON.parse(storedFolders) : [];
          const { workspaces: mWS, assets: mAssets } = migrateIndigoToTeal(parsedWS, parsedAssets);
          setWorkspaces(mWS);
          setAssets(mAssets);
          setFolders(parsedFolders);
        } catch {
          setWorkspaces(INITIAL_WORKSPACES);
          setAssets(INITIAL_ASSETS);
          setFolders([]);
        }
      }
    };

    fetchCloudData();
  }, [user, isLoading]);

  // Debounced auto-save effect
  useEffect(() => {
    const statusTimer = setTimeout(() => {
      setSaveStatus('saving');
    }, 0);

    const handler = setTimeout(async () => {
      if (isLoading) return;

      if (user) {
        if (hasLoadedFromCloud.current) {
          try {
            const userDocRef = doc(db, 'users', user.uid, 'vault', 'data');
            await setDoc(userDocRef, {
              workspaces,
              assets,
              folders,
              updatedAt: new Date().toISOString()
            });
            setSaveStatus('saved');
          } catch (e) {
            console.error("Firestore sync write error:", e);
            setSaveStatus('error');
          }
        } else {
          setSaveStatus('saved');
        }
      } else {
        localStorage.setItem('wv_workspaces', JSON.stringify(workspaces));
        localStorage.setItem('wv_assets', JSON.stringify(assets));
        localStorage.setItem('wv_folders', JSON.stringify(folders));
        setSaveStatus('saved');
      }
    }, 1500);

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(handler);
    };
  }, [workspaces, assets, folders, user, isLoading]);

  // Effects: Seed missing default assets if needed
  useEffect(() => {
    const missingSeeds = INITIAL_ASSETS.filter(seed => !assets.some(a => a.id === seed.id));
    if (missingSeeds.length > 0) {
      const timer = setTimeout(() => {
        setAssets(prev => [...prev, ...missingSeeds]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Effects: Load Shared workspace from Hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#share=')) {
      try {
        const encodedData = hash.substring(7);
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
        if (decoded.workspaces && decoded.assets) {
          if (window.confirm("Would you like to import the shared workspaces and assets? This will append them to your vault.")) {
            // Append with unique ids
            const wsMap = {};
            const nextWorkspaces = [...workspaces];
            decoded.workspaces.forEach(ws => {
              const nextId = `ws-shared-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              wsMap[ws.id] = nextId;
              nextWorkspaces.push({ ...ws, id: nextId, name: `${ws.name} (Shared)` });
            });
            const nextAssets = [...assets];
            decoded.assets.forEach(asset => {
              const mappedWsId = wsMap[asset.workspaceId] || activeWorkspaceId;
              nextAssets.push({
                ...asset,
                id: `asset-shared-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                workspaceId: mappedWsId
              });
            });
            const timer = setTimeout(() => {
              setWorkspaces(nextWorkspaces);
              setAssets(nextAssets);
              setShareLoadedToast(true);
              setTimeout(() => setShareLoadedToast(false), 5000);
            }, 0);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.error("Failed to parse shared configurations", err);
      } finally {
        // Clear Hash
        window.history.replaceState(null, null, ' ');
      }
    }
  }, []);

  // Effects: First-time Onboarding trigger
  useEffect(() => {
    if (!localStorage.getItem('wv_onboarding_completed')) {
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
    }
  }, []);



  // Derived Assets
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Available Tags (for Autocomplete)
  const availableTags = useMemo(() => {
    const tagsSet = new Set();
    assets.forEach(a => {
      if (a.tags) {
        a.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [assets]);

  const workspaceAssets = useMemo(() => {
    let filtered = assets.filter(a => a.workspaceId === activeWorkspaceId);
    
    // Filter by active folder if one is selected
    if (activeFolderId) {
      filtered = filtered.filter(a => a.folderId === activeFolderId);
    } else {
      // If no folder is selected, optionally we could only show root assets, 
      // but to preserve standard behavior, we'll show all assets in the workspace.
      // We will add an 'Uncategorized' virtual folder later if needed.
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.type.includes(q) || (a.tags && a.tags.toLowerCase().includes(q)));
    }

    if (activeTypeFilter !== 'All') {
      const now = new Date();
      if (activeTypeFilter === 'Colors') filtered = filtered.filter(a => a.type === 'color');
      else if (activeTypeFilter === 'SVG') filtered = filtered.filter(a => a.type === 'svg');
      else if (activeTypeFilter === 'Gradient') filtered = filtered.filter(a => a.type === 'gradient');
      else if (activeTypeFilter === 'Image') filtered = filtered.filter(a => a.type === 'image');
      else if (activeTypeFilter === 'Code') filtered = filtered.filter(a => a.type === 'code');
      else if (activeTypeFilter === 'Pinned') filtered = filtered.filter(a => a.isPinned);
      else if (activeTypeFilter === 'Modified Today') {
        filtered = filtered.filter(a => {
          if (!a.lastModified) return false;
          const diff = now - new Date(a.lastModified);
          return diff < 24 * 60 * 60 * 1000;
        });
      }
    }

    let sorted = [...filtered];
    if (sortMode === 'custom') {
      // Pinned first, then array index ordering
      sorted.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    } else if (sortMode === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortMode === 'type') {
      sorted.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortMode === 'date-newest') {
      sorted.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortMode === 'date-oldest') {
      sorted.sort((a, b) => a.id.localeCompare(b.id));
    }
    return sorted;
  }, [assets, activeWorkspaceId, searchQuery, sortMode, activeTypeFilter, activeFolderId]);

  const activeAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  // Color Math calculations (memoized)
  const colorPalettes = useMemo(() => {
    if (activeAsset?.type === 'color' && activeAsset?.value) {
      return generateTailwindShades(activeAsset.value);
    }
    return [];
  }, [activeAsset]);

  const harmonies = useMemo(() => {
    if ((activeAsset?.type === 'color' || activeAsset?.type === 'gradient') && activeAsset?.value) {
      try {
        return getHarmonies(activeAsset.value);
      } catch {
        return null;
      }
    }
    return null;
  }, [activeAsset]);

  const relatedTokens = useMemo(() => {
    if (!activeAsset) return [];
    return assets.filter(a => {
      if (a.id === activeAsset.id) return false;
      const isSameWs = a.workspaceId === activeAsset.workspaceId;
      const isSameType = a.type === activeAsset.type;
      const hasSameTag = a.tags && activeAsset.tags && a.tags.split(',').some(t => activeAsset.tags.includes(t.trim()));

      // Basic heuristic: same type, same workspace or same tags
      if (isSameType && (isSameWs || hasSameTag)) return true;
      return false;
    }).slice(0, 5);
  }, [activeAsset, assets]);

  const colorBlindness = useMemo(() => {
    if ((activeAsset?.type === 'color' || activeAsset?.type === 'gradient') && activeAsset?.value) {
      try {
        return simulateColorBlindness(activeAsset.value);
      } catch {
        return null;
      }
    }
    return null;
  }, [activeAsset]);

  // Reordering Enabled Flag
  const isReorderEnabled = sortMode === 'custom' && !searchQuery && !bulkSelectMode;

  // Actions: Copy Utility
  const triggerCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 1500);
  };

  // Actions: Workspaces

  // Actions: Create Asset
  const handleCreateAsset = (e) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetValue.trim()) return;
    if (newAssetType === 'svg' && !newAssetValue.includes('<svg')) {
      showToast('Invalid SVG token. Code must contain the <svg> tags.', 'error');
      return;
    }
    const newAsset = {
      id: generateAssetId(),
      workspaceId: activeWorkspaceId,
      type: newAssetType,
      name: newAssetName.replace(/\s+/g, ' ').trim(),
      value: newAssetValue,
      tags: newAssetTags,
      folderId: activeFolderId,
      isPinned: false,
      notes: '',
      history: [],
      lastModified: new Date().toISOString()
    };
    commitAssetsUpdate([...assets, newAsset]);
    setNewAssetName('');
    setNewAssetValue(newAssetType === 'color' ? '#005F73' : '');
    setNewAssetTags('');
    setSelectedAssetId(newAsset.id);
  };

  const handleDeleteAsset = async (id, e) => {
    if (e) e.stopPropagation();
    if (await showConfirm('Delete this design token?')) {
      commitAssetsUpdate(assets.filter(a => a.id !== id));
      if (selectedAssetId === id) setSelectedAssetId(null);
    }
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If typing in input/textarea, ignore keys
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) {
        return;
      }

      if (spotlightOpen) return;

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            // Redo
            let { stack, index } = historyRef.current;
            if (index < stack.length - 1) {
              index += 1;
              historyRef.current = { stack, index };
              setAssets(stack[index]);
            }
          } else {
            // Undo
            let { stack, index } = historyRef.current;
            if (index > 0) {
              index -= 1;
              historyRef.current = { stack, index };
              setAssets(stack[index]);
            }
          }
          return;
        } else if (e.key === 'y') {
          // Redo
          e.preventDefault();
          let { stack, index } = historyRef.current;
          if (index < stack.length - 1) {
            index += 1;
            historyRef.current = { stack, index };
            setAssets(stack[index]);
          }
          return;
        }
      }

      // Check for ?
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      const len = workspaceAssets.length;
      if (len === 0) {
        if (e.key === '/') {
          e.preventDefault();
          setSpotlightOpen(true);
          setSpotlightQuery('');
          setSpotlightSelectedIndex(0);
        }
        return;
      }

      let nextIdx;
      const currentIdx = workspaceAssets.findIndex(a => a.id === selectedAssetId);

      switch (e.key) {
        case '/':
          e.preventDefault();
          setSpotlightOpen(true);
          setSpotlightQuery('');
          setSpotlightSelectedIndex(0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % len;
          setSelectedAssetId(workspaceAssets[nextIdx].id);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextIdx = currentIdx === -1 ? len - 1 : (currentIdx - 1 + len) % len;
          setSelectedAssetId(workspaceAssets[nextIdx].id);
          break;
        case 'ArrowDown': {
          e.preventDefault();
          const cols = viewMode === 'grid' ? 4 : 1;
          nextIdx = currentIdx === -1 ? 0 : (currentIdx + cols) % len;
          if (currentIdx !== -1 && currentIdx + cols >= len) {
            nextIdx = (currentIdx + cols) % cols;
          }
          setSelectedAssetId(workspaceAssets[nextIdx].id);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const cols = viewMode === 'grid' ? 4 : 1;
          nextIdx = currentIdx === -1 ? len - 1 : (currentIdx - cols + len) % len;
          if (currentIdx !== -1 && currentIdx - cols < 0) {
            const lastRowStart = Math.floor((len - 1) / cols) * cols;
            nextIdx = lastRowStart + (currentIdx % cols);
            if (nextIdx >= len) nextIdx = len - 1;
          }
          setSelectedAssetId(workspaceAssets[nextIdx].id);
          break;
        }
        case 'Enter':
          if (currentIdx !== -1) {
            setIsEditingAsset(true);
            const active = workspaceAssets[currentIdx];
            setEditAssetName(active.name);
            setEditAssetValue(active.value);
            setEditAssetTags(active.tags || '');
            setEditAssetNotes(active.notes || '');
          } else if (len > 0) {
            setSelectedAssetId(workspaceAssets[0].id);
          }
          break;
        case 'Delete':
          if (selectedAssetId) {
            e.preventDefault();
            handleDeleteAsset(selectedAssetId, e);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedAssetId(null);
          setIsEditingAsset(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceAssets, selectedAssetId, viewMode, spotlightOpen]);

  // Save changes inside Detail Inspector Panel
  const handleSaveAssetDetails = () => {
    if (!activeAsset) return;
    if (activeAsset.type === 'svg' && !editAssetValue.includes('<svg')) {
      alert('Invalid SVG structure.');
      return;
    }

    // Version History logging
    const previousVal = activeAsset.value;
    const historyEntry = {
      timestamp: new Date().toLocaleString(),
      value: previousVal
    };
    const nextHistory = [historyEntry, ...(activeAsset.history || [])].slice(0, 5);

    commitAssetsUpdate(assets.map(a => a.id === selectedAssetId ? {
      ...a,
      name: editAssetName,
      value: editAssetValue,
      tags: editAssetTags,
      folderId: editFolderId,
      notes: editAssetNotes,
      history: nextHistory,
      lastModified: new Date().toISOString()
    } : a));
    setIsEditingAsset(false);
  };

  const restoreHistoryVersion = (val) => {
    if (!activeAsset) return;
    const currentVal = activeAsset.value;
    const historyEntry = {
      timestamp: new Date().toLocaleString(),
      value: currentVal
    };
    const nextHistory = [historyEntry, ...(activeAsset.history || [])].slice(0, 5);

    commitAssetsUpdate(assets.map(a => a.id === selectedAssetId ? {
      ...a,
      value: val,
      history: nextHistory,
      lastModified: new Date().toISOString()
    } : a));

    setEditAssetValue(val);
  };

  const togglePinAsset = (id, e) => {
    e.stopPropagation();
    commitAssetsUpdate(assets.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
  };

  const duplicateAsset = (asset, e) => {
    e.stopPropagation();
    const newAsset = { ...asset, id: generateAssetId(), name: `${asset.name} (Copy)`, isPinned: false, history: [] };
    commitAssetsUpdate([...assets, newAsset]);
  };

  // Drag and drop mechanics
  const handleDragStart = (e, index) => {
    if (!isReorderEnabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (!isReorderEnabled) return;
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    if (!isReorderEnabled || draggedIndex === null || draggedIndex === targetIndex) return;

    const sourceAsset = workspaceAssets[draggedIndex];
    const targetAsset = workspaceAssets[targetIndex];

    const newAssets = [...assets];
    const sourceGlobalIdx = assets.findIndex(a => a.id === sourceAsset.id);
    const targetGlobalIdx = assets.findIndex(a => a.id === targetAsset.id);

    const [moved] = newAssets.splice(sourceGlobalIdx, 1);
    newAssets.splice(targetGlobalIdx, 0, moved);

    commitAssetsUpdate(newAssets);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedIds.size === workspaceAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(workspaceAssets.map(a => a.id)));
    }
  };

  const handleToggleSelectAsset = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (await showConfirm(`Delete all ${selectedIds.size} selected design tokens?`)) {
      commitAssetsUpdate(assets.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      if (selectedAssetId && selectedIds.has(selectedAssetId)) {
        setSelectedAssetId(null);
      }
    }
  };

  // Import/Export
  const handleExportData = () => downloadFile(`workspace-vault-${new Date().toISOString().split('T')[0]}.json`, JSON.stringify({ workspaces, assets }, null, 2), 'application/json');

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.workspaces && data.assets) {
          setWorkspaces(data.workspaces);
          setAssets(data.assets);
          setActiveWorkspaceId(data.workspaces[0]?.id || '');
          showToast('Data imported successfully!', 'success');
        } else {
          showToast('Invalid JSON vault structure.', 'error');
        }
      } catch {
        showToast('Failed to parse the file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const exportCssVariables = () => {
    if (!activeWorkspace) return;
    const css = generateThemeCSS(workspaceAssets);
    downloadFile(`${activeWorkspace.name.toLowerCase().replace(/\s+/g, '-')}-theme.css`, css, 'text/css');
  };

  const handleZipExport = () => {
    if (!activeWorkspace || workspaceAssets.length === 0) return;
    exportZip(workspaceAssets, activeWorkspace.name);
    showToast('Bundle exported successfully!', 'success');
  };

  // Share link generator (encoded workspace configurations)
  const generateShareLink = () => {
    try {
      const payload = { workspaces, assets };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const link = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      triggerCopy(link);
      showToast('Share link generated and copied to clipboard! Anyone with this link can load your current workspace.', 'success');
    } catch {
      showToast('Failed to generate share link.', 'error');
    }
  };

  // Direct Workspace Collaboration (Share via Email)
  const shareWorkspaceWithEmail = async (workspaceId, targetEmail) => {
    if (!user) {
      showToast('You must be logged in to share workspaces by email.', 'error');
      return false;
    }

    try {
      showToast(`Looking up user ${targetEmail}...`, 'info');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', targetEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showToast('No VectorSpace user found with that email.', 'error');
        return false;
      }

      const targetUserDoc = querySnapshot.docs[0];
      const targetUid = targetUserDoc.id;

      const wsToShare = workspaces.find(w => w.id === workspaceId);
      const wsAssets = assets.filter(a => a.workspaceId === workspaceId);

      if (!wsToShare) return false;

      const sharedRef = doc(db, 'users', targetUid, 'vault', 'shared', workspaceId);
      await setDoc(sharedRef, {
        workspace: {
          ...wsToShare,
          name: `${wsToShare.name} (Shared)`
        },
        assets: wsAssets,
        sharedBy: user.email,
        sharedAt: new Date().toISOString()
      });

      showToast(`Workspace shared with ${targetEmail}!`, 'success');
      return true;
    } catch (error) {
      console.error('Share error:', error);
      showToast('Failed to share workspace. Check permissions.', 'error');
      return false;
    }
  };

  // SVG components exporters
  const generateReactComponent = (rawSvg, name) => {
    const PascalName = name.replace(/[^a-zA-Z0-9]/g, '').replace(/^\w/, c => c.toUpperCase()) || 'VectorIcon';
    let cleanSvg = rawSvg.replace(/stroke="[^"]*"/, 'stroke={strokeColor}').replace(/stroke-width="[^"]*"/, 'strokeWidth={strokeWidth}');
    return `export const ${PascalName} = ({ size = 24, strokeColor = 'currentColor', strokeWidth = ${svgStroke} }) => (\n  <svg width={size} height={size} style={{ display: 'inline-block' }}>\n    ${cleanSvg.trim()}\n  </svg>\n);`;
  };

  const generateVueComponent = (rawSvg, name) => `<!-- Vue component: ${name} -->\n<template>\n  <svg :width="size" :height="size" style="display: inline-block">\n    ${rawSvg.replace(/stroke="[^"]*"/, ':stroke="strokeColor"').replace(/stroke-width="[^"]*"/, ':stroke-width="strokeWidth"').trim()}\n  </svg>\n</template>\n<script setup>\ndefineProps({ size: { type: [Number, String], default: 24 }, strokeColor: { type: String, default: 'currentColor' }, strokeWidth: { type: [Number, String], default: ${svgStroke} }});\n</script>`;

  const generateAngularComponent = (rawSvg, name) => {
    const PascalName = name.replace(/[^a-zA-Z0-9]/g, '').replace(/^\w/, c => c.toUpperCase()) || 'VectorIcon';
    return `import { Component, Input } from '@angular/core';\n\n@Component({\n  selector: 'app-${name.toLowerCase().replace(/\s+/g, '-')}',\n  template: \`\n    <svg [attr.width]="size" [attr.height]="size" style="display: inline-block">\n      ${rawSvg.replace(/stroke="[^"]*"/, '[attr.stroke]="strokeColor"').replace(/stroke-width="[^"]*"/, '[attr.stroke-width]="strokeWidth"').trim()}\n    </svg>\n  \`\n})\nexport class ${PascalName}Component {\n  @Input() size: number | string = 24;\n  @Input() strokeColor: string = 'currentColor';\n  @Input() strokeWidth: number | string = ${svgStroke};\n}`;
  };

  const downloadSvg = (rawSvg, name) => {
    const cleanSvg = rawSvg.replace(/stroke="[^"]*"/, `stroke="${svgColor}"`).replace(/stroke-width="[^"]*"/, `stroke-width="${svgStroke}"`);
    downloadFile(`${name.toLowerCase().replace(/\s+/g, '-')}.svg`, cleanSvg, 'image/svg+xml');
  };

  // Visual Gradient Generator updates
  const applyGradientValue = () => {
    const val = gradType === 'linear'
      ? `linear-gradient(${gradAngle}deg, ${gradStart}, ${gradEnd})`
      : `radial-gradient(circle, ${gradStart}, ${gradEnd})`;

    setNewAssetValue(val);
    if (isEditingAsset) {
      setEditAssetValue(val);
    }
    setShowGradientBuilder(false);
  };

  // Preloaded Icons lists for selector
  const filteredPreloadedIcons = useMemo(() => {
    if (!iconLibrarySearch) return PRELOADED_ICONS;
    const q = iconLibrarySearch.toLowerCase();
    return PRELOADED_ICONS.filter(i => i.name.toLowerCase().includes(q) || i.tags.toLowerCase().includes(q));
  }, [iconLibrarySearch]);

  const selectPreloadedIcon = (icon) => {
    setNewAssetName(icon.name);
    setNewAssetValue(icon.svg);
    if (isEditingAsset) {
      setEditAssetName(icon.name);
      setEditAssetValue(icon.svg);
    }
    setShowIconLibrary(false);
  };

  // Spotlight cross-workspace results
  const spotlightResults = useMemo(() => {
    if (!spotlightOpen || !spotlightQuery) return [];
    const q = spotlightQuery.toLowerCase();
    return assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.type.includes(q) ||
      (a.tags && a.tags.toLowerCase().includes(q))
    );
  }, [assets, spotlightQuery, spotlightOpen]);

  // Spotlight keys
  useEffect(() => {
    if (!spotlightOpen) return;
    const handleSpotlightKeys = (e) => {
      const len = spotlightResults.length;
      if (len === 0) {
        if (e.key === 'Escape') setSpotlightOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSpotlightSelectedIndex(prev => (prev + 1) % len);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSpotlightSelectedIndex(prev => (prev - 1 + len) % len);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = spotlightResults[spotlightSelectedIndex];
        if (selected) {
          setActiveWorkspaceId(selected.workspaceId);
          setSelectedAssetId(selected.id);
          setSpotlightOpen(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSpotlightOpen(false);
      }
    };
    window.addEventListener('keydown', handleSpotlightKeys);
    return () => window.removeEventListener('keydown', handleSpotlightKeys);
  }, [spotlightOpen, spotlightResults, spotlightSelectedIndex]);

  // Snippet Generation Utility
  const generatedSnippet = useMemo(() => {
    if (!activeAsset) return '';
    const cleanName = activeAsset.name.toLowerCase().replace(/\s+/g, '-');

    switch (snippetTab) {
      case 'tailwind':
        if (activeAsset.type === 'color') return `bg-[#${activeAsset.value.replace('#', '')}] text-[#${activeAsset.value.replace('#', '')}]`;
        if (activeAsset.type === 'gradient') return `bg-gradient-to-r from-[${gradStart}] to-[${gradEnd}]`;
        if (activeAsset.type === 'shadow') return `shadow-[${activeAsset.value}]`;
        if (activeAsset.type === 'typography') return `text-[32px] font-bold font-['Outfit']`;
        if (activeAsset.type === 'image') return `bg-[url('${activeAsset.value}')]`;
        if (activeAsset.type === 'svg') return `bg-[url('data:image/svg+xml;utf8,${encodeURIComponent(activeAsset.value.replace(/stroke-width="[^"]*"/g, `stroke-width="${svgStroke}"`))}')]`;
        if (activeAsset.type === 'code') return `/* ${activeAsset.name} */\n${activeAsset.value}`;
        return 'N/A';
      case 'css':
        if (activeAsset.type === 'color') return `--color-${cleanName}: ${activeAsset.value};`;
        if (activeAsset.type === 'gradient') return `background: ${activeAsset.value};`;
        if (activeAsset.type === 'shadow') return `box-shadow: ${activeAsset.value};`;
        if (activeAsset.type === 'typography') return `font: ${activeAsset.value};`;
        if (activeAsset.type === 'image') return `background-image: url('${activeAsset.value}');`;
        if (activeAsset.type === 'svg') return `background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(activeAsset.value.replace(/stroke-width="[^"]*"/g, `stroke-width="${svgStroke}"`))}');`;
        if (activeAsset.type === 'code') return `/* ${activeAsset.name} */\n${activeAsset.value}`;
        return 'N/A';
      case 'scss':
        if (activeAsset.type === 'color') return `$color-${cleanName}: ${activeAsset.value};`;
        if (activeAsset.type === 'gradient') return `$gradient-${cleanName}: ${activeAsset.value};`;
        if (activeAsset.type === 'shadow') return `$shadow-${cleanName}: ${activeAsset.value};`;
        if (activeAsset.type === 'typography') return `$font-${cleanName}: ${activeAsset.value};`;
        if (activeAsset.type === 'image') return `$image-${cleanName}: '${activeAsset.value}';`;
        if (activeAsset.type === 'svg') return `$svg-${cleanName}: 'data:image/svg+xml;utf8,${encodeURIComponent(activeAsset.value.replace(/stroke-width="[^"]*"/g, `stroke-width="${svgStroke}"`))}';`;
        if (activeAsset.type === 'code') return `// ${activeAsset.name}\n${activeAsset.value}`;
        return 'N/A';
      case 'swift':
        if (activeAsset.type === 'color') {
          const rgb = hexToRgb(activeAsset.value);
          return `Color(red: ${(rgb.r / 255).toFixed(3)}, green: ${(rgb.g / 255).toFixed(3)}, blue: ${(rgb.b / 255).toFixed(3)})`;
        }
        if (activeAsset.type === 'shadow') {
          return `.shadow(color: Color.black.opacity(0.2), radius: 15, x: 0, y: 10)`;
        }
        if (activeAsset.type === 'typography') {
          return `.font(.custom("Outfit", size: 32).weight(.bold))`;
        }
        if (activeAsset.type === 'image') {
          return `Image("${cleanName}")`;
        }
        if (activeAsset.type === 'svg') {
          return `Image("${cleanName}") // Ensure SVG is in asset catalog`;
        }
        if (activeAsset.type === 'code') {
          return `// ${activeAsset.name}\n${activeAsset.value}`;
        }
        return 'N/A';
      default:
        return '';
    }
  }, [activeAsset, snippetTab, gradStart, gradEnd, svgStroke]);

  // Onboarding metadata configurations
  const onboardingSteps = [
    { title: 'Welcome to VectorSpace 🚀', text: 'This interactive guide will introduce you to your design tokens workspace. Tap next to begin!', select: 'header' },
    { title: 'Isolated Workspaces & Folders', text: 'Define separate systems (e.g. Identity primitives, dashboards) and nest them using dynamic Folders in the sidebar.', select: 'aside' },
    { title: 'Inject Core Design Assets', text: 'Create tokens: colors, custom gradients, SVG codes, typography specs, shadow styles, or use the AI Generator via the top toolbar!', select: 'form' },
    { title: 'Registry Operations & Sorting', text: 'Drag cards to manually reorder. Switch to List mode, use Bulk Select, and search using spotlight (/) key.', select: 'toolbar' },
    { title: 'Advanced details & Dev Sandbox', text: 'Click any card to inspect color palettes, format code snippets, optimize SVGs, reassign folders, and check components live!', select: 'details' }
  ];

  // Build Context Value
  const appContextValue = {
    workspaces, setWorkspaces,
    folders, setFolders,
    activeFolderId, setActiveFolderId,
    assets, setAssets,
    activeWorkspaceId, setActiveWorkspaceId,
    activeWorkspace,
    workspaceAssets,
    activeAsset,
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    searchQuery, setSearchQuery,
    copiedText, setCopiedText,
    viewMode, setViewMode,
    accentColor, setAccentColor,
    sortMode, setSortMode,
    bulkSelectMode, setBulkSelectMode,
    selectedIds, setSelectedIds,
    spotlightOpen, setSpotlightOpen,
    spotlightQuery, setSpotlightQuery,
    spotlightSelectedIndex, setSpotlightSelectedIndex,
    showIconLibrary, setShowIconLibrary,
    iconLibrarySearch, setIconLibrarySearch,
    showGradientBuilder, setShowGradientBuilder,
    gradStart, setGradStart,
    gradEnd, setGradEnd,
    gradAngle, setGradAngle,
    gradType, setGradType,
    showOnboarding, setShowOnboarding,
    onboardingStep, setOnboardingStep,
    newAssetName, setNewAssetName,
    newAssetType, setNewAssetType,
    newAssetValue, setNewAssetValue,
    newAssetTags, setNewAssetTags,
    selectedAssetId, setSelectedAssetId,
    svgScale, setSvgScale,
    svgColor, setSvgColor,
    svgStroke, setSvgStroke,
    contrastBg, setContrastBg,
    sandboxApplied, setSandboxApplied,
    isEditingAsset, setIsEditingAsset,
    editAssetName, setEditAssetName,
    editAssetValue, setEditAssetValue,
    editAssetTags, setEditAssetTags,
    editAssetNotes, setEditAssetNotes,
    snippetTab, setSnippetTab,
    draggedIndex, setDraggedIndex,
    isDarkMode, setIsDarkMode,
    shareLoadedToast, setShareLoadedToast,
    handleExportData,
    handleImportData,
    exportCssVariables,
    generateShareLink,
    applyGradientValue,
    selectPreloadedIcon,
    filteredPreloadedIcons,
    spotlightResults,
    generatedSnippet,
    onboardingSteps,
    colorPalettes,
    harmonies,
    colorBlindness,
    shareWorkspaceWithEmail,
    isCloudSyncing,
    activeTypeFilter, setActiveTypeFilter,
    isImageTracerOpen, setIsImageTracerOpen,
    isHelpGuideOpen, setIsHelpGuideOpen,
  };

  // Effects: Update Recent Assets
  useEffect(() => {
    if (selectedAssetId) {
      const timer = setTimeout(() => {
        setRecentAssets(prev => {
          const next = [selectedAssetId, ...prev.filter(id => id !== selectedAssetId)].slice(0, 6);
          localStorage.setItem('wv_recent_assets', JSON.stringify(next));
          return next;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedAssetId]);

  // Derived Recent Assets
  const recentAssetsData = useMemo(() => {
    return recentAssets.map(id => assets.find(a => a.id === id)).filter(Boolean);
  }, [recentAssets, assets]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginGateway />;
  }

  const handleTraceComplete = (svgString) => {
    const newId = generateAssetId();
    commitAssetsUpdate(prev => [{
      id: newId,
      workspaceId: activeWorkspaceId,
      type: 'svg',
      name: `Traced Vector ${Math.floor(Math.random() * 1000)}`,
      value: svgString,
      isPinned: false,
      lastModified: new Date().toISOString()
    }, ...prev]);
    setIsImageTracerOpen(false);
    setSelectedAssetId(newId);
    showToast('Image traced and converted to SVG!', 'success');
  };

  return (
    <AppProvider value={appContextValue}>
      <div className={`min-h-screen font-sans pattern-grid selection:bg-[#94D2BD]/40 dark:selection:bg-[var(--accent-light)] selection:text-[#1A252C] dark:selection:text-[#94D2BD] ${isDarkMode ? 'theme-transition' : ''}`}>

        {/* Dynamic Theme Colors */}
        <style>{`
        :root {
          --accent: ${accentColor};
          --accent-hover: ${accentVars.hover};
          --accent-light: ${accentVars.light};
          --accent-ring: ${accentVars.ring};
        }
      `}</style>

        {/* TOP HEADER */}
        <header id="header-tour" className="sticky top-0 z-50 h-16 px-4 md:px-6 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <VectorSpaceLogo width={34} height={34} className="hidden md:block" />
            <span className="text-sm font-black tracking-wide text-slate-800 dark:text-slate-100 hidden sm:inline-block">VectorSpace</span>
          </div>

          {/* Top toolbar */}
          <div className="flex items-center space-x-2 md:space-x-3">

            {/* Sync Status Badge */}
            {saveStatus === 'saving' && (
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/50 hidden md:flex">
                <div className="w-3 h-3 border-[1.5px] border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Syncing...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/50 hidden md:flex animate-fade-in opacity-70">
                <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Saved</span>
              </div>
            )}

            {/* Accent Color picker */}
            <label className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Custom Accent Theme Color">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase hidden md:inline tracking-wider">Accent</span>
              <span
                className="w-4 h-4 rounded-[4px] flex-shrink-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10"
                style={{ backgroundColor: accentColor }}
              />
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="sr-only"
                title="Custom Accent Theme Color"
              />
            </label>


            <button onClick={generateShareLink} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700/50 flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              <span className="hidden md:inline">Share</span>
            </button>

            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:block">Import</button>
            <button onClick={handleExportData} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:block">Export</button>
            <button onClick={() => { setOnboardingStep(0); setShowOnboarding(true); }} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all hidden lg:block">Tour</button>

            {copiedText && (
              <div className="text-xs bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 font-medium rounded-full tracking-wide shadow-sm animate-fade-in absolute right-24 top-4">
                Copied!
              </div>
            )}

            <AuthHeaderControls />

            {/* Dark Mode toggle */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[var(--accent)] transition-all active:scale-95">
              {isDarkMode ? (
                <svg key="dark" className="animate-spin-in" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg key="light" className="animate-spin-in" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </div>
        </header>

        {/* Shared configuration notification toast */}
        {shareLoadedToast && (
          <div className="fixed bottom-6 left-6 z-50 bg-[var(--accent)] text-white rounded-2xl px-5 py-4 shadow-xl border border-[#94D2BD]/40 animate-slide-in flex items-center justify-between space-x-4 max-w-sm">
            <div>
              <h4 className="font-bold text-sm">Shared configuration loaded!</h4>
              <p className="text-xs text-[#94D2BD] mt-1">Workspaces and primitive styles loaded successfully.</p>
            </div>
            <button onClick={() => setShareLoadedToast(false)} className="text-white hover:text-[#94D2BD] font-bold text-xs">Dismiss</button>
          </div>
        )}

        {/* Mobile Tab Bar for Workspaces */}
        <div className="lg:hidden w-full overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-16 z-40">
          <div className="flex px-4 py-2 space-x-2 min-w-max">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => { setActiveWorkspaceId(ws.id); setSelectedAssetId(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center space-x-1.5 ${activeWorkspaceId === ws.id
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] ring-1 ring-[var(--accent-ring)]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ws.color || '#cbd5e1' }} />
                <span>{ws.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* THREE-COLUMN GRID FRAMEWORK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)] relative">

          {/* PANEL 1: SIDEBAR (Workspaces) */}
          <Sidebar />

          {/* PANEL 2: MAIN WORKSPACE (Design Tokens) */}
          <main className={`col-span-1 ${isSidebarCollapsed ? 'lg:col-span-8' : 'lg:col-span-6'} flex flex-col gap-6 overflow-y-auto pb-10 transition-all duration-300`}>

            {/* Breadcrumb Navigation */}
            <div className="hidden lg:flex items-center text-[11px] font-bold text-slate-400 dark:text-slate-500 space-x-2 tracking-wide uppercase">
              <span>VectorSpace</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <span className="text-[var(--accent)]">{activeWorkspace?.name || 'Workspace'}</span>
              {activeAsset && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  <span className="text-slate-600 dark:text-slate-300">{activeAsset.name}</span>
                </>
              )}
            </div>

            {/* Recent Assets Rail */}
            {recentAssetsData.length > 0 && (
              <div className="flex overflow-x-auto no-scrollbar space-x-2 pb-2">
                <span className="flex-shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center pr-2 border-r border-slate-200 dark:border-slate-800">Recent</span>
                {recentAssetsData.map(asset => (
                  <button
                    key={`recent-${asset.id}`}
                    onClick={() => { setActiveWorkspaceId(asset.workspaceId); setSelectedAssetId(asset.id); }}
                    className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-lg transition-colors text-xs text-slate-600 dark:text-slate-300 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: asset.type === 'color' ? asset.value : 'var(--accent)' }}></span>
                    <span className="truncate max-w-[100px]">{asset.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div id="form-tour" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center">
                    <span className="w-3.5 h-3.5 rounded-full mr-3 shadow-inner hidden md:block" style={{ backgroundColor: activeWorkspace?.color || '#cbd5e1' }} />
                    {activeWorkspace?.name || 'No Selected Workspace'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">{activeWorkspace?.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsAIGeneratorOpen(true)}
                    className="bg-[var(--accent)] hover:opacity-90 text-white text-[10px] font-bold px-3 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1 shadow-[var(--accent-ring)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                    <span>AI Generate</span>
                  </button>
                  <div className="group relative">
                    <button className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-3 py-2 rounded-xl transition-colors shadow-sm self-start flex items-center space-x-1">
                      <span>Export</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden flex flex-col">
                      <button onClick={() => exportW3CTokens(workspaceAssets, activeWorkspace?.name || 'workspace')} className="text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700">W3C JSON</button>
                      <button onClick={exportCssVariables} className="text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700">Theme CSS</button>
                      <button onClick={handleZipExport} className="text-left px-3 py-2 text-xs font-bold text-[var(--accent)] dark:text-[#94D2BD] hover:bg-[var(--accent-light)] dark:hover:bg-[var(--accent-light)]">Bundle (ZIP)</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ASSET INJECTION CARD FORM */}
              {activeWorkspace && (
                <form onSubmit={handleCreateAsset} className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 shadow-inner transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Inject Asset Node</span>

                    <div className="flex space-x-2">
                      {/* SVG Icon Library Trigger */}
                      {newAssetType === 'svg' && (
                        <>
                          <button type="button" onClick={() => setShowIconLibrary(true)} className="text-[10px] font-extrabold text-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white px-2.5 py-1 rounded-lg transition-all">
                            Browse Preset SVGs
                          </button>
                          <button type="button" onClick={() => setIsIconSearchOpen(true)} className="text-[10px] font-extrabold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <span>Search Libraries</span>
                          </button>
                        </>
                      )}

                      {/* Gradient Builder Trigger */}
                      {newAssetType === 'gradient' && (
                        <button type="button" onClick={() => {
                          // Pre-populate if possible
                          if (newAssetValue && newAssetValue.includes('#')) {
                            const hexes = newAssetValue.match(/#[a-fA-F0-9]{6}/g);
                            if (hexes && hexes.length >= 2) {
                              setGradStart(hexes[0]);
                              setGradEnd(hexes[1]);
                            }
                          }
                          setShowGradientBuilder(true);
                        }} className="text-[10px] font-extrabold text-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white px-2.5 py-1 rounded-lg transition-all">
                          Visual Builder
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Asset Type</label>
                      <div className="relative">
                        <select
                          value={newAssetType}
                          onChange={(e) => {
                            const type = e.target.value;
                            setNewAssetType(type);
                            setNewAssetValue(type === 'color' ? '#005F73' : '');
                          }}
                          className="appearance-none w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-all shadow-sm capitalize cursor-pointer"
                        >
                          {['color', 'gradient', 'svg', 'typography', 'shadow', 'compare', 'image', 'code'].map((type) => (
                            <option key={type} value={type} className="capitalize">{type}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Token Name</label>
                      <input
                        id="new-asset-name"
                        type="text" placeholder="e.g. Primary Brand Color" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-all shadow-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Value</label>
                      {newAssetType === 'color' ? (
                        <div className="flex space-x-2">
                          <input type="color" value={newAssetValue} onChange={(e) => setNewAssetValue(e.target.value)} className="w-11 h-11 rounded-xl cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex-shrink-0" />
                          <input type="text" value={newAssetValue} onChange={(e) => setNewAssetValue(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-all shadow-sm font-mono" />
                        </div>
                      ) : newAssetType === 'compare' ? (
                        <input
                          type="text" placeholder="Before Image URL | After Image URL" value={newAssetValue} onChange={(e) => setNewAssetValue(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-all shadow-sm font-mono text-xs"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={
                            newAssetType === 'gradient' ? "linear-gradient(135deg, #f43f5e, #f59e0b)" :
                              newAssetType === 'typography' ? '700 32px Outfit' :
                                newAssetType === 'shadow' ? '0 25px 50px -12px rgba(0,0,0,0.25)' :
                                  newAssetType === 'image' ? 'https://example.com/image.jpg' :
                                    newAssetType === 'code' ? 'const x = 42;' :
                                      "<svg xmlns='http://www.w3.org/2000/svg' ...>...</svg>"
                          }
                          value={newAssetValue}
                          onChange={(e) => setNewAssetValue(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-all shadow-sm font-mono text-xs"
                        />
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Tags (Comma separated)</label>
                      <TagAutocompleteInput
                        placeholder="e.g. brand, primary, darkmode"
                        value={newAssetTags}
                        onChange={setNewAssetTags}
                        availableTags={availableTags}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl mt-5 transition-all shadow-[0_4px_14px_var(--accent-ring)] active:scale-[0.98]">
                    Add Asset Node
                  </button>
                </form>
              )}
            </div>

            {/* SEARCH, SORT, & VIEW TOOLBAR */}
            <div id="toolbar-tour" className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl backdrop-blur-md border border-slate-200 dark:border-slate-700">
              <div className="relative w-full md:max-w-xs">
                <svg className="absolute left-3.5 top-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search assets... (Press /)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                {/* Sorting Mode Dropdown */}
                <div className="relative">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="appearance-none bg-white dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl pl-3.5 pr-8 py-2 border border-slate-200 dark:border-slate-600 focus:outline-none cursor-pointer"
                  >
                    <option value="custom">Custom Order</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="type">Type Category</option>
                    <option value="date-newest">Date (Newest)</option>
                    <option value="date-oldest">Date (Oldest)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>

                {/* Bulk Actions Button */}
                <button
                  onClick={() => {
                    setBulkSelectMode(!bulkSelectMode);
                    setSelectedIds(new Set());
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${bulkSelectMode ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                >
                  Bulk Select
                </button>

                {/* Grid / List Mode */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--accent)]' : 'text-slate-400'}`} title="Grid Layout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--accent)]' : 'text-slate-400'}`} title="List Layout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Select Control Bar */}
            {bulkSelectMode && (
              <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-md animate-fade-in">
                <span className="text-xs font-semibold">{selectedIds.size} nodes selected</span>
                <div className="flex space-x-2">
                  <button onClick={handleToggleSelectAll} className="text-[10px] uppercase font-black hover:text-slate-350 px-2 py-1 rounded">
                    {selectedIds.size === workspaceAssets.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button onClick={handleBulkDelete} disabled={selectedIds.size === 0} className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-[10px] uppercase font-black px-3.5 py-1.5 rounded-xl transition-all">
                    Delete Selection
                  </button>
                </div>
              </div>
            )}

            {/* Reordering warning banner */}
            {!isReorderEnabled && !searchQuery && !bulkSelectMode && sortMode !== 'custom' && (
              <div className="text-[10px] text-center text-slate-400 font-medium py-1">
                ⚠️ Custom drag-to-reorder requires sorting mode to be "Custom Order".
              </div>
            )}

            {/* EMPTY ASSET REGISTRY */}
            {workspaceAssets.length === 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-300 dark:border-slate-700">
                <svg className="text-slate-300 dark:text-slate-650 mb-3" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Empty Registry Pool</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Inject some colors, vectors, typography, shadows, or image comparisons to populate your vault.</p>
              </div>
            )}

            {/* ASSET TILES / RENDERERS */}
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {isCloudSyncing ? (
                // Skeleton Loaders
                [...Array(viewMode === 'grid' ? 8 : 4)].map((_, i) => (
                  <SkeletonCard key={i} isList={viewMode === 'list'} />
                ))
              ) : workspaceAssets.length > 0 ? (
                workspaceAssets.map((asset, index) => {
                  const isSelected = selectedAssetId === asset.id;
                  const isChecked = selectedIds.has(asset.id);

                  let ageColor = 'bg-slate-300 dark:bg-slate-700';
                  let ageTooltip = 'No date';
                  if (asset.lastModified) {
                    const daysOld = Math.floor((new Date() - new Date(asset.lastModified)) / (1000 * 60 * 60 * 24));
                    if (daysOld < 2) ageColor = 'bg-emerald-400';
                    else if (daysOld < 7) ageColor = 'bg-amber-400';
                    else ageColor = 'bg-red-400';
                    ageTooltip = `Last edited ${daysOld === 0 ? 'today' : `${daysOld} days ago`}`;
                  }

                  return (
                    <div key={asset.id} className="relative touch-pan-y group/swipe">
                      {/* Swipe Underlay Action */}
                      <div className={`absolute inset-y-0 right-0 w-32 flex items-center justify-end pr-6 bg-red-500 rounded-2xl transition-opacity duration-200 ${swipeOffset.id === asset.id && swipeOffset.offset < -20 ? 'opacity-100' : 'opacity-0'}`}>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id, e); setSwipeOffset({ id: null, offset: 0 }); }} className="p-2 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>

                      <div
                        onTouchStart={(e) => handleTouchStart(e, asset.id)}
                        onTouchMove={(e) => handleTouchMove(e, asset.id)}
                        onTouchEnd={(e) => handleTouchEnd(e, asset.id)}
                        draggable={isReorderEnabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          if (bulkSelectMode) {
                            const next = new Set(selectedIds);
                            if (next.has(asset.id)) next.delete(asset.id);
                            else next.add(asset.id);
                            setSelectedIds(next);
                          } else {
                            setSelectedAssetId(asset.id);
                            setIsEditingAsset(false);
                          }
                        }}
                        onDoubleClick={() => {
                          if (bulkSelectMode) return;
                          setInlineEditAssetId(asset.id);
                          setInlineEditForm({ name: asset.name, value: asset.value });
                        }}
                        onBlur={(e) => {
                          if (inlineEditAssetId === asset.id && !e.currentTarget.contains(e.relatedTarget)) {
                            handleInlineSave(asset);
                          }
                        }}
                        onContextMenu={(e) => handleContextMenu(e, asset)}
                        className={`card-shine-hover group relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex animate-card-enter ${viewMode === 'list' ? 'flex-row items-center justify-between space-x-4' : 'flex-col min-h-[160px]'
                          } ${isSelected
                            ? 'bg-[var(--accent-light)] dark:bg-[var(--accent-light)] border-[var(--accent-ring)] shadow-md ring-2 ring-[var(--accent-light)]'
                            : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:shadow-[0_0_15px_var(--card-glow)] hover:border-[var(--card-glow)]'
                          } ${draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100'}`}
                        style={{
                          '--card-glow': asset.type === 'color' ? asset.value : (asset.type === 'gradient' ? 'var(--accent)' : 'var(--accent)'),
                          animationDelay: `${Math.min(index * 40, 400)}ms`,
                          transform: swipeOffset.id === asset.id ? `translateX(${swipeOffset.offset}px)` : 'translateX(0)',
                          transition: swipeOffset.id === asset.id ? 'none' : 'transform 0.2s ease-out'
                        }}
                      >

                        {/* Card header controls */}
                        <div className={`flex justify-between items-start ${viewMode === 'grid' ? 'mb-3' : 'flex-1 items-center'}`}>
                          <div className="flex items-center space-x-2 truncate pr-2 w-full">
                            {bulkSelectMode && (
                              <div onClick={(e) => { e.stopPropagation(); handleToggleSelectAsset(asset.id, e); }} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer ${isChecked ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-slate-300 dark:border-slate-600'}`}>
                                {isChecked && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                              </div>
                            )}
                            <div className="truncate w-full">
                              <h3 className={`text-xs font-black tracking-wide flex items-center truncate ${isSelected ? 'text-[#1A252C] dark:text-[#94D2BD]' : 'text-slate-800 dark:text-slate-100'}`}>
                                <div className={`w-1.5 h-1.5 mr-1.5 rounded-full ${ageColor} flex-shrink-0`} title={ageTooltip} />
                                {asset.isPinned && <span className="text-amber-500 mr-1 flex-shrink-0">★</span>}

                                {inlineEditAssetId === asset.id ? (
                                  <input
                                    autoFocus
                                    className="bg-transparent border-b border-[var(--accent)] focus:outline-none w-full px-1 text-xs text-slate-900 dark:text-white"
                                    value={inlineEditForm.name}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setInlineEditForm(f => ({ ...f, name: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleInlineSave(asset);
                                      if (e.key === 'Escape') setInlineEditAssetId(null);
                                    }}
                                  />
                                ) : (
                                  <span className="truncate">{asset.name}</span>
                                )}
                              </h3>
                              {viewMode === 'grid' && (
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full inline-block mt-1">{asset.type}</span>
                              )}
                            </div>
                          </div>

                          {/* Desktop Hover Quick Actions */}
                          {!bulkSelectMode && (
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => togglePinAsset(asset.id, e)} className={`text-slate-400 hover:text-amber-500 transition-colors bg-slate-50 dark:bg-slate-750 p-1.5 rounded-full ${asset.isPinned ? 'text-amber-500' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                              </button>
                              <button onClick={(e) => duplicateAsset(asset, e)} className="text-slate-400 hover:text-[var(--accent)] transition-colors bg-slate-50 dark:bg-slate-750 p-1.5 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id, e); }} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-750 p-1.5 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* PREVIEW CONTAINER BASED ON TYPE */}
                        {asset.type === 'color' || asset.type === 'gradient' ? (
                          <div className={`flex flex-col justify-end ${viewMode === 'list' ? 'w-48 sm:w-56' : ''}`}>
                            <div className={`w-full ${viewMode === 'list' ? 'h-6' : 'h-20 mb-2'} rounded-xl shadow-inner overflow-hidden flex ring-1 ring-black/5 dark:ring-white/10`} style={{ background: asset.value }}></div>
                            {viewMode === 'grid' && (
                              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                {inlineEditAssetId === asset.id ? (
                                  <input
                                    className="bg-transparent border-none text-[10px] text-slate-800 dark:text-slate-200 font-mono font-bold w-full focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] rounded px-1"
                                    value={inlineEditForm.value}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setInlineEditForm(f => ({ ...f, value: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleInlineSave(asset);
                                      if (e.key === 'Escape') setInlineEditAssetId(null);
                                    }}
                                  />
                                ) : (
                                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[130px]">{asset.value}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : asset.type === 'svg' ? (
                          <div className={`flex flex-col justify-end ${viewMode === 'list' ? 'w-48 sm:w-56' : ''}`}>
                            <div className={`${viewMode === 'list' ? 'w-10 h-10' : 'h-20 mb-2 w-full'} flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-350 relative overflow-hidden group/svg`}>
                              <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/20 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                              <div className={`relative z-10 transition-transform group-hover/svg:scale-105 ${viewMode === 'list' ? 'scale-75' : ''}`} dangerouslySetInnerHTML={{ __html: formatSvg(asset.value, { width: '28', height: '28' }, '1.8') }} />
                            </div>
                            {viewMode === 'grid' && (
                              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">&lt;svg&gt; vector</span>
                              </div>
                            )}
                          </div>
                        ) : asset.type === 'compare' ? (
                          <div className={`flex flex-col justify-end ${viewMode === 'list' ? 'w-48 sm:w-56' : ''}`}>
                            <div className="mb-2">
                              {asset.value && asset.value.includes('|') ? (
                                <ImageComparisonSlider beforeUrl={asset.value.split('|')[0]} afterUrl={asset.value.split('|')[1]} viewMode={viewMode} />
                              ) : (
                                <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                                  Invalid comparison URLs
                                </div>
                              )}
                            </div>
                            {viewMode === 'grid' && (
                              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">Image slider comparison</span>
                              </div>
                            )}
                          </div>
                        ) : asset.type === 'typography' ? (
                          <div className={`flex flex-col justify-end ${viewMode === 'list' ? 'w-48 sm:w-56' : ''}`}>
                            <div className={`${viewMode === 'list' ? 'h-8' : 'h-20 mb-2 w-full'} flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden relative shadow-sm`}>
                              <span className="text-slate-800 dark:text-slate-100 text-sm truncate" style={{ font: asset.value }}>Aa Design Typo</span>
                            </div>
                            {viewMode === 'grid' && (
                              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                {inlineEditAssetId === asset.id ? (
                                  <input
                                    className="bg-transparent border-none text-[10px] text-slate-800 dark:text-slate-200 font-mono font-bold w-full focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] rounded px-1"
                                    value={inlineEditForm.value}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setInlineEditForm(f => ({ ...f, value: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleInlineSave(asset);
                                      if (e.key === 'Escape') setInlineEditAssetId(null);
                                    }}
                                  />
                                ) : (
                                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[135px]">{asset.value}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : asset.type === 'image' ? (
                          <div className={`flex flex-col justify-end ${viewMode === 'list' ? 'w-48 sm:w-56' : ''}`}>
                            <div className={`${viewMode === 'list' ? 'h-8' : 'h-20 mb-2 w-full'} flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden relative shadow-sm`}>
                              <img src={asset.value} alt={asset.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                            {viewMode === 'grid' && (
                              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[135px]">Image URL</span>
                              </div>
                            )}
                          </div>
                        ) : asset.type === 'code' ? (
                          <div className={`flex flex-col justify-end ${viewMode === 'list' ? 'w-48 sm:w-56' : ''}`}>
                            <div className={`${viewMode === 'list' ? 'h-8' : 'h-20 mb-2 w-full'} flex items-center justify-start p-2 bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden relative shadow-sm`}>
                              <pre className="text-[8px] text-slate-300 font-mono text-left w-full h-full overflow-hidden whitespace-pre-wrap">{asset.value}</pre>
                            </div>
                            {viewMode === 'grid' && (
                              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[135px]">Code Snippet</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Shadow Type */
                          <div className={`flex flex-col justify-end ${viewMode === 'list' ? 'w-48 sm:w-56' : ''}`}>
                            <div className={`${viewMode === 'list' ? 'h-8' : 'h-20 mb-2 w-full'} flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-xl relative overflow-hidden`}>
                              <div className="w-16 h-8 bg-white dark:bg-slate-800 rounded-lg" style={{ boxShadow: asset.value }}></div>
                            </div>
                            {viewMode === 'grid' && (
                              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[135px]">{asset.value}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Drag Handle or Indicator */}
                        {viewMode === 'grid' && isReorderEnabled && (
                          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-48 h-48 mb-6 text-slate-300 dark:text-slate-700 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full opacity-50">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2">No Assets Found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    {searchQuery ? `No results found for "${searchQuery}".` : 'This workspace is currently empty. Inject a new asset node to start building your design system.'}
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* PANEL 3: DETAIL INSPECTOR & UTILITY SUITE */}
          <aside id="details-tour" className={`
            lg:col-span-3 lg:flex lg:flex-col lg:gap-6
            max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[100] max-lg:bg-white/95 max-lg:dark:bg-slate-900/95 max-lg:backdrop-blur-xl max-lg:rounded-t-[2rem] max-lg:shadow-[0_-20px_60px_rgba(0,0,0,0.4)] max-lg:transition-transform max-lg:duration-500 max-lg:ease-out max-lg:overflow-y-auto max-lg:max-h-[85vh] max-lg:border-t max-lg:border-slate-200 max-lg:dark:border-slate-700/50
            ${activeAsset ? 'max-lg:translate-y-0' : 'max-lg:translate-y-full'}
          `}>
            {isCloudSyncing ? (
              <SkeletonInspector />
            ) : activeAsset ? (
              <div className="relative lg:rounded-3xl lg:p-6 p-4 lg:shadow-sm space-y-6 z-0">
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl pointer-events-none -z-10 hidden lg:block"></div>

                {/* Mobile Drag Handle / Close */}
                <div className="lg:hidden flex justify-center pb-2 cursor-pointer" onClick={() => setSelectedAssetId(null)}>
                  <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                </div>

                {/* ── LARGE HERO PREVIEW ── */}
                <div
                  className="relative w-full rounded-2xl overflow-hidden animate-preview-glow"
                  style={{ '--preview-glow': activeAsset.type === 'color' ? `${activeAsset.value}55` : 'rgba(99,102,241,0.2)' }}
                >
                  {activeAsset.type === 'color' && (
                    <div className="h-28 w-full flex items-end p-4" style={{ background: `linear-gradient(135deg, ${activeAsset.value}cc, ${activeAsset.value})` }}>
                      <span className="font-mono text-xs font-black tracking-widest px-2 py-1 rounded-lg bg-black/20 backdrop-blur-sm"
                        style={{ color: activeAsset.value > '#888888' ? '#000' : '#fff' }}>
                        {activeAsset.value.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {activeAsset.type === 'gradient' && (
                    <div className="h-28 w-full" style={{ background: activeAsset.value }} />
                  )}
                  {activeAsset.type === 'svg' && (
                    <div className="h-28 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/50">
                      <div
                        className="transition-transform hover:scale-110"
                        style={{ color: 'var(--accent)' }}
                        dangerouslySetInnerHTML={{ __html: formatSvg(activeAsset.value, { width: '56', height: '56' }, svgStroke) }}
                      />
                    </div>
                  )}
                  {activeAsset.type === 'image' && (
                    <div className="h-28 w-full overflow-hidden">
                      <img src={activeAsset.value} alt={activeAsset.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                  {activeAsset.type === 'typography' && (
                    <div className="h-28 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/60 px-4">
                      <span className="text-slate-800 dark:text-slate-100 text-2xl text-center leading-tight" style={{ font: activeAsset.value }}>
                        Aa — The quick brown fox
                      </span>
                    </div>
                  )}
                  {activeAsset.type === 'shadow' && (
                    <div className="h-28 w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900/60">
                      <div className="w-28 h-14 bg-white dark:bg-slate-800 rounded-2xl" style={{ boxShadow: activeAsset.value }} />
                    </div>
                  )}
                  {activeAsset.type === 'code' && (
                    <div className="h-28 w-full overflow-hidden bg-slate-950 p-4">
                      <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap overflow-hidden">{activeAsset.value}</pre>
                    </div>
                  )}
                  {activeAsset.type === 'compare' && activeAsset.value?.includes('|') && (
                    <div className="h-28 w-full overflow-hidden">
                      <ImageComparisonSlider beforeUrl={activeAsset.value.split('|')[0]} afterUrl={activeAsset.value.split('|')[1]} viewMode="grid" />
                    </div>
                  )}
                </div>
                {/* Header Inspector */}
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700/50 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-full inline-block">{activeAsset.type} inspector</span>

                    {isEditingAsset ? (
                      <input
                        type="text"
                        value={editAssetName}
                        onChange={(e) => setEditAssetName(e.target.value)}
                        className="text-lg font-black text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border rounded px-2 py-1 mt-2 focus:outline-none w-full"
                      />
                    ) : (
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">{activeAsset.name}</h3>
                    )}
                  </div>

                  <div className="flex space-x-1.5">
                    {isEditingAsset ? (
                      <>
                        <button onClick={handleSaveAssetDetails} className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                        <button onClick={() => setIsEditingAsset(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-350 p-2 rounded-xl hover:bg-slate-300 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => {
                        setIsEditingAsset(true);
                        setEditAssetName(activeAsset.name);
                        setEditAssetValue(activeAsset.value);
                        setEditAssetTags(activeAsset.tags || '');
                        setEditAssetNotes(activeAsset.notes || '');
                        setEditFolderId(activeAsset.folderId || null);
                      }} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-250 p-2 rounded-xl text-slate-500 dark:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Value details / Copy fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Value Primitives</label>
                    <div className="p-5">
                      {isEditingAsset ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 block">Value Payload</label>
                            {(activeAsset.type === 'svg' || activeAsset.type === 'code') && (
                              <div className="flex space-x-1">
                                {codeUndoCache && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditAssetValue(codeUndoCache);
                                      setCodeUndoCache(null);
                                      showToast('Action undone', 'success');
                                    }}
                                    className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-2 py-1 rounded-md transition-colors"
                                    title="Undo last change"
                                  >
                                    Undo
                                  </button>
                                )}
                                {activeAsset.type === 'svg' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCodeUndoCache(editAssetValue);
                                      let filled = editAssetValue
                                        .replace(/fill="[^"]*"/gi, 'fill="currentColor"')
                                        .replace(/stroke="[^"]*"/gi, 'stroke="currentColor"');
                                      setEditAssetValue(filled);
                                      showToast('SVG forced to fill!', 'success');
                                    }}
                                    className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-500 hover:text-white px-2 py-1 rounded-md transition-colors"
                                    title="Force fill to currentColor"
                                  >
                                    Fill
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCodeUndoCache(editAssetValue);
                                    if (activeAsset.type === 'svg') {
                                      let cleaned = editAssetValue
                                        .replace(/fill="(?!(none|transparent|currentColor))[^"]*"/gi, 'fill="currentColor"')
                                        .replace(/stroke="(?!(none|transparent|currentColor))[^"]*"/gi, 'stroke="currentColor"')
                                        .replace(/<g[^>]*>/gi, '')
                                        .replace(/<\/g>/gi, '')
                                        .replace(/\s+id="[^"]*"/gi, '')
                                        .replace(/\s+class="[^"]*"/gi, '')
                                        .replace(/>\s+</g, '><')
                                        .trim();
                                      setEditAssetValue(cleaned);
                                      showToast('SVG code cleaned and optimized!', 'success');
                                    } else if (activeAsset.type === 'code') {
                                      let cleaned = editAssetValue.replace(/\n\s*\n/g, '\n').trim();
                                      setEditAssetValue(cleaned);
                                      showToast('Code cleaned and formatted!', 'success');
                                    }
                                  }}
                                  className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white px-2 py-1 rounded-md transition-colors border border-[var(--accent)]/20"
                                  title="Clean & optimize code"
                                >
                                  Clean & Optimize
                                </button>
                              </div>
                            )}
                          </div>
                          {activeAsset.type === 'svg' ? (
                            <textarea
                              value={editAssetValue}
                              onChange={(e) => setEditAssetValue(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-[var(--accent)] h-32"
                            />
                          ) : activeAsset.type === 'color' ? (
                            <div className="space-y-4">
                              <div className="flex space-x-2">
                                <input
                                  type="color"
                                  value={editAssetValue}
                                  onChange={(e) => setEditAssetValue(e.target.value)}
                                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                                />
                                <input
                                  type="text"
                                  value={editAssetValue}
                                  onChange={(e) => setEditAssetValue(e.target.value)}
                                  className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-[var(--accent)]"
                                />
                              </div>
                              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm">
                                <span className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Live Adjust</span>
                                <ColorSliders hexColor={editAssetValue} onChange={setEditAssetValue} />
                              </div>
                            </div>
                          ) : activeAsset.type === 'code' ? (
                            <textarea
                              value={editAssetValue}
                              onChange={(e) => setEditAssetValue(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-[var(--accent)] h-32"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editAssetValue}
                              onChange={(e) => setEditAssetValue(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-[var(--accent)]"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 block">Value Payload</label>
                            {(activeAsset.type === 'svg' || activeAsset.type === 'code') && (
                              <div className="flex space-x-1">
                                {codeUndoCache && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssets(prev => prev.map(a => a.id === activeAsset.id ? { ...a, value: codeUndoCache } : a));
                                      setCodeUndoCache(null);
                                      showToast('Action undone', 'success');
                                    }}
                                    className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-2 py-1 rounded-md transition-colors"
                                    title="Undo last change"
                                  >
                                    Undo
                                  </button>
                                )}
                                {activeAsset.type === 'svg' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCodeUndoCache(activeAsset.value);
                                      let filled = activeAsset.value
                                        .replace(/fill="[^"]*"/gi, 'fill="currentColor"')
                                        .replace(/stroke="[^"]*"/gi, 'stroke="currentColor"');
                                      setAssets(prev => prev.map(a => a.id === activeAsset.id ? { ...a, value: filled, lastModified: new Date().toISOString() } : a));
                                      showToast('SVG forced to fill!', 'success');
                                    }}
                                    className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-500 hover:text-white px-2 py-1 rounded-md transition-colors"
                                    title="Force fill to currentColor"
                                  >
                                    Fill
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCodeUndoCache(activeAsset.value);
                                    if (activeAsset.type === 'svg') {
                                      let cleaned = activeAsset.value
                                        .replace(/fill="(?!(none|transparent|currentColor))[^"]*"/gi, 'fill="currentColor"')
                                        .replace(/stroke="(?!(none|transparent|currentColor))[^"]*"/gi, 'stroke="currentColor"')
                                        .replace(/<g[^>]*>/gi, '')
                                        .replace(/<\/g>/gi, '')
                                        .replace(/\s+id="[^"]*"/gi, '')
                                        .replace(/\s+class="[^"]*"/gi, '')
                                        .replace(/>\s+</g, '><')
                                        .trim();
                                      setAssets(prev => prev.map(a => a.id === activeAsset.id ? { ...a, value: cleaned, lastModified: new Date().toISOString() } : a));
                                      showToast('SVG code cleaned and optimized!', 'success');
                                    } else if (activeAsset.type === 'code') {
                                      let cleaned = activeAsset.value.replace(/\n\s*\n/g, '\n').trim();
                                      setAssets(prev => prev.map(a => a.id === activeAsset.id ? { ...a, value: cleaned, lastModified: new Date().toISOString() } : a));
                                      showToast('Code cleaned and formatted!', 'success');
                                    }
                                  }}
                                  className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white px-2 py-1 rounded-md transition-colors border border-[var(--accent)]/20"
                                  title="Clean & optimize code"
                                >
                                  Clean & Optimize
                                </button>
                              </div>
                            )}
                          </div>
                          <div onClick={() => triggerCopy(activeAsset.value)} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-2xl cursor-pointer hover:border-[var(--accent)] font-mono text-[10px] text-slate-600 dark:text-slate-300 break-all select-all flex items-center justify-between">
                            <span className="truncate max-w-[200px]">{activeAsset.value}</span>
                            <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit tags and notes fields */}
                  {isEditingAsset && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Folder</label>
                        <select
                          value={editFolderId || ''}
                          onChange={(e) => setEditFolderId(e.target.value || null)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)] text-slate-800 dark:text-slate-100"
                        >
                          <option value="">No Folder (Root)</option>
                          {folders.filter(f => f.workspaceId === activeWorkspaceId).map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Tags</label>
                        <TagAutocompleteInput
                          value={editAssetTags}
                          onChange={setEditAssetTags}
                          availableTags={availableTags}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Asset Comments / Notes</label>
                        <textarea
                          rows={2}
                          value={editAssetNotes}
                          onChange={(e) => setEditAssetNotes(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-2 text-xs focus:outline-none"
                          placeholder="Write down any usage guidelines or documentation comments..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes Read mode */}
                  {!isEditingAsset && activeAsset.notes && (
                    <div className="bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Usage Notes</span>
                      <p className="text-xs text-slate-650 dark:text-slate-300 font-medium italic">"{activeAsset.notes}"</p>
                    </div>
                  )}
                </div>

                {/* SPECIFIC VIEW DETAILS */}
                {/* Color Details (WCAG, shades, harmonies, blindness) */}
                {(activeAsset.type === 'color' || activeAsset.type === 'gradient') && (
                  <div className="space-y-5 pt-3 border-t border-slate-200 dark:border-slate-700/50">

                    {activeAsset.type === 'color' && (
                      <>
                        {/* WCAG Contrast Ratio tool */}
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                            <span>WCAG Contrast Checker</span>
                            <button onClick={() => setContrastBg(contrastBg === '#ffffff' ? '#0f172a' : '#ffffff')} className="text-[9px] text-[var(--accent)] hover:underline">
                              Toggle Light/Dark BG
                            </button>
                          </h4>

                          <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-2xl">
                            <div className="flex items-center space-x-2">
                              <input type="color" value={contrastBg} onChange={(e) => setContrastBg(e.target.value)} className="w-6 h-6 rounded-md cursor-pointer bg-white" />
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Background vs hex color</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-lg font-black text-slate-800 dark:text-slate-150">
                                {getContrastRatio(activeAsset.value, contrastBg)} : 1
                              </span>

                              {/* Rating badges */}
                              <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                                {parseFloat(getContrastRatio(activeAsset.value, contrastBg)) >= 4.5 ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded">AA Pass</span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-350 rounded">AA Fail</span>
                                )}
                                {parseFloat(getContrastRatio(activeAsset.value, contrastBg)) >= 7.0 ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded">AAA Pass</span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-350 rounded">AAA Fail</span>
                                )}
                              </div>
                            </div>

                            {/* Mockup Text Box */}
                            <div className="h-11 rounded-xl flex items-center justify-center text-xs font-semibold px-4 transition-all" style={{ backgroundColor: contrastBg, color: activeAsset.value }}>
                              Sample Preview Text
                            </div>
                          </div>
                        </div>

                        {/* Shades Scale (Tailwind 11 levels 50-950) */}
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">11-Shade Tailwind Palette</h4>
                          <div className="grid grid-cols-11 h-8 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                            {colorPalettes.map((shade) => (
                              <div
                                key={shade.label}
                                onClick={() => {
                                  setNewAssetName(`${activeAsset.name} ${shade.label}`);
                                  setNewAssetValue(shade.hex);
                                  setNewAssetType('color');
                                  triggerCopy(shade.hex);
                                }}
                                className="h-full w-full cursor-pointer transition-transform hover:scale-110 active:scale-95 group/shade relative"
                                style={{ backgroundColor: shade.hex }}
                                title={`Shade ${shade.label}: ${shade.hex} (Click to set as active & copy)`}
                              >
                                <div className="absolute hidden group-hover/shade:flex bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded text-[8px] font-mono p-1 z-30 whitespace-nowrap">
                                  {shade.label}: {shade.hex}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Harmony palettes */}
                    {harmonies && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Harmonies & Schemes</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400">Analogous</span>
                            <div className="flex space-x-1">
                              {harmonies.analogous.map((c, i) => (
                                <span key={i} onClick={() => triggerCopy(c)} className="w-5 h-5 rounded-md cursor-pointer hover:scale-105 border border-black/5" style={{ background: c }} title={`Copy Analogous style ${c}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400">Triadic</span>
                            <div className="flex space-x-1">
                              {harmonies.triadic.map((c, i) => (
                                <span key={i} onClick={() => triggerCopy(c)} className="w-5 h-5 rounded-md cursor-pointer hover:scale-105 border border-black/5" style={{ background: c }} title={`Copy Triadic style ${c}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Color Suggestions */}
                    {activeAsset.type === 'color' && (
                      <div className="bg-gradient-to-br from-[var(--accent-light)] to-[#94D2BD]/10 border border-[var(--accent-light)] p-4 rounded-2xl relative overflow-hidden mt-4">
                        <div className="absolute -right-4 -top-4 text-[var(--accent-light)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] mb-2 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-1.5 animate-pulse"></span>
                          AI Suggested Pairs
                        </h4>
                        <div className="space-y-3 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#1A252C]/60 dark:text-[#94D2BD]/60">High Contrast UI</span>
                            <div className="flex space-x-1.5">
                              <span onClick={() => triggerCopy(accentVars.hover)} className="w-6 h-6 rounded-lg shadow-sm cursor-pointer hover:scale-105 border border-black/10" style={{ background: accentVars.hover }} title="Deep Contrast" />
                              <span onClick={() => triggerCopy(harmonies?.triadic[0] || '#ffffff')} className="w-6 h-6 rounded-lg shadow-sm cursor-pointer hover:scale-105 border border-black/10" style={{ background: harmonies?.triadic[0] || '#ffffff' }} title="Vibrant Pop" />
                              <span onClick={() => triggerCopy(contrastBg)} className="w-6 h-6 rounded-lg shadow-sm cursor-pointer hover:scale-105 border border-black/10" style={{ background: contrastBg }} title="Optimal Base" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Color Blindness simulation */}
                    {colorBlindness && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Simulated Blindness Spectrum</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                            <span className="text-[8px] font-black text-slate-450 uppercase block mb-1.5">Red-Blind</span>
                            <div className="h-6 w-full rounded-lg" style={{ background: colorBlindness.protanopia }} />
                            <span className="text-[9px] font-mono text-slate-500 mt-1 block truncate" title={colorBlindness.protanopia}>{activeAsset.type === 'gradient' ? 'Simulated' : colorBlindness.protanopia}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                            <span className="text-[8px] font-black text-slate-450 uppercase block mb-1.5">Green-Blind</span>
                            <div className="h-6 w-full rounded-lg" style={{ background: colorBlindness.deuteranopia }} />
                            <span className="text-[9px] font-mono text-slate-500 mt-1 block truncate" title={colorBlindness.deuteranopia}>{activeAsset.type === 'gradient' ? 'Simulated' : colorBlindness.deuteranopia}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                            <span className="text-[8px] font-black text-slate-450 uppercase block mb-1.5">Monochrome</span>
                            <div className="h-6 w-full rounded-lg" style={{ background: colorBlindness.achromatopsia }} />
                            <span className="text-[9px] font-mono text-slate-500 mt-1 block truncate" title={colorBlindness.achromatopsia}>{activeAsset.type === 'gradient' ? 'Simulated' : colorBlindness.achromatopsia}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SVG Vector details (scaling, stroking, component copy) */}
                {activeAsset.type === 'svg' && (
                  <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Vector Stroke Settings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                          <span>Stroke Width</span>
                          <span>{svgStroke}px</span>
                        </div>
                        <input type="range" min="0.5" max="4" step="0.5" value={svgStroke} onChange={(e) => setSvgStroke(parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>

                    {/* React/Vue/Angular codes component export panel */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Framework Components</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => triggerCopy(generateReactComponent(activeAsset.value, activeAsset.name))} className="text-[9px] font-black py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">React Component</button>
                        <button onClick={() => triggerCopy(generateVueComponent(activeAsset.value, activeAsset.name))} className="text-[9px] font-black py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">Vue SFC</button>
                        <button onClick={() => triggerCopy(generateAngularComponent(activeAsset.value, activeAsset.name))} className="text-[9px] font-black py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">Angular TS</button>
                      </div>

                      <button onClick={() => downloadSvg(activeAsset.value, activeAsset.name)} className="w-full bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all text-xs font-bold py-2 rounded-xl mt-1.5">
                        Download Raw SVG File
                      </button>
                    </div>
                  </div>
                )}

                {/* Typography Details (Whiteboard) */}
                {activeAsset.type === 'typography' && (
                  <TypographyWhiteboard fontStyle={activeAsset.value} />
                )}

                {/* LIVE CSS PREVIEW SANDBOX (mock interactive components) */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Live CSS Component Sandbox</span>

                  {/* Visual mock card */}
                  <div
                    className="p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all flex flex-col justify-between min-h-[160px] relative overflow-hidden"
                    style={{
                      boxShadow: sandboxApplied.shadowCard && activeAsset.type === 'shadow' ? activeAsset.value : '0 1px 3px rgba(0,0,0,0.05)',
                      borderColor: sandboxApplied.cardBorder && activeAsset.type === 'color' ? activeAsset.value : '',
                      backgroundColor: sandboxApplied.cardBg && activeAsset.type === 'color' ? activeAsset.value : ''
                    }}
                  >

                    {/* Decorative Header Area inside Sandbox mockup */}
                    <div className="space-y-2">
                      {activeAsset.type === 'gradient' && sandboxApplied.headerBanner ? (
                        <div className="h-6 w-full rounded-lg" style={{ background: activeAsset.value }} />
                      ) : activeAsset.type === 'compare' ? (
                        <div className="h-10 w-full rounded-lg overflow-hidden">
                          {activeAsset.value && activeAsset.value.includes('|') ? (
                            <ImageComparisonSlider beforeUrl={activeAsset.value.split('|')[0]} afterUrl={activeAsset.value.split('|')[1]} viewMode="grid" />
                          ) : (
                            <div className="h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[8px] text-slate-400">
                              Invalid compare values
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                      )}

                      <div className="flex items-center space-x-2">
                        {activeAsset.type === 'svg' && sandboxApplied.showIconBtn && (
                          <div className="text-[var(--accent)]" dangerouslySetInnerHTML={{ __html: formatSvg(activeAsset.value, { width: '18', height: '18' }, svgStroke) }} />
                        )}
                        <h4
                          className="text-xs font-black text-slate-800 dark:text-slate-100"
                          style={{
                            color: sandboxApplied.textHeading && activeAsset.type === 'color' ? activeAsset.value : '',
                            font: activeAsset.type === 'typography' ? activeAsset.value : ''
                          }}
                        >
                          Interactive Preview Card
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">This is a visual demo showcasing how this design token primitive renders on elements.</p>
                    </div>

                    <div className="flex justify-end mt-3">
                      {/* Sandbox mock button */}
                      <button
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                        style={{
                          backgroundColor: sandboxApplied.btnBg && activeAsset.type === 'color' ? activeAsset.value : (activeAsset.type === 'gradient' && sandboxApplied.btnBg ? '' : '#ef4444'), // fallback
                          background: activeAsset.type === 'gradient' && sandboxApplied.btnBg ? activeAsset.value : '',
                          color: sandboxApplied.btnText && activeAsset.type === 'color' ? activeAsset.value : '#ffffff'
                        }}
                      >
                        Action Button
                      </button>
                    </div>
                  </div>

                  {/* Sandbox dynamic application toggles */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeAsset.type === 'color' && (
                      <>
                        <button onClick={() => setSandboxApplied(prev => ({ ...prev, btnBg: !prev.btnBg }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.btnBg ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Button BG</button>
                        <button onClick={() => setSandboxApplied(prev => ({ ...prev, btnText: !prev.btnText }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.btnText ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Button Text</button>
                        <button onClick={() => setSandboxApplied(prev => ({ ...prev, textHeading: !prev.textHeading }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.textHeading ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Heading Text</button>
                        <button onClick={() => setSandboxApplied(prev => ({ ...prev, cardBorder: !prev.cardBorder }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.cardBorder ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Card Border</button>
                        <button onClick={() => setSandboxApplied(prev => ({ ...prev, cardBg: !prev.cardBg }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.cardBg ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Card Background</button>
                      </>
                    )}
                    {activeAsset.type === 'gradient' && (
                      <>
                        <button onClick={() => setSandboxApplied(prev => ({ ...prev, headerBanner: !prev.headerBanner }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.headerBanner ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Header Banner</button>
                        <button onClick={() => setSandboxApplied(prev => ({ ...prev, btnBg: !prev.btnBg }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.btnBg ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Button BG</button>
                      </>
                    )}
                    {activeAsset.type === 'svg' && (
                      <button onClick={() => setSandboxApplied(prev => ({ ...prev, showIconBtn: !prev.showIconBtn }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.showIconBtn ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Show Card Icon</button>
                    )}
                    {activeAsset.type === 'shadow' && (
                      <button onClick={() => setSandboxApplied(prev => ({ ...prev, shadowCard: !prev.shadowCard }))} className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-all ${sandboxApplied.shadowCard ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent text-slate-400'}`}>Apply Box Shadow</button>
                    )}
                  </div>
                </div>

                {/* VERSION HISTORY */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Version Timeline</span>

                  <div className="relative pl-3 space-y-4 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                    {activeAsset.history && activeAsset.history.length > 0 ? (
                      activeAsset.history.map((hist, i) => (
                        <div key={i} className="relative pl-6 flex justify-between items-center group">
                          {/* Dot marker */}
                          <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-slate-400 group-hover:bg-[var(--accent)] group-hover:scale-150 transition-all shadow-[0_0_0_3px_white] dark:shadow-[0_0_0_3px_#1e293b]" />

                          <div className="truncate pr-2">
                            <div className="flex items-center space-x-2">
                              {activeAsset.type === 'color' && (
                                <div className="w-3 h-3 rounded shadow-sm border border-slate-200 dark:border-slate-700" style={{ background: hist.value }} />
                              )}
                              <span className="font-mono text-[10px] text-slate-600 dark:text-slate-350 block truncate max-w-[130px] font-semibold">{hist.value}</span>
                            </div>
                            <span className="text-[8px] text-slate-400 font-medium mt-1 block">
                              {new Date(hist.timestamp).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <button onClick={() => restoreHistoryVersion(hist.value)} className="opacity-0 group-hover:opacity-100 bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-bold px-2 py-1 rounded-lg text-[9px] transition-all flex-shrink-0">
                            Restore
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-400 font-medium italic pl-4 relative before:content-[''] before:absolute before:left-[-2px] before:top-1.5 before:w-[6px] before:h-[6px] before:rounded-full before:bg-slate-300 dark:before:bg-slate-600">
                        No recorded history.
                      </div>
                    )}
                  </div>
                </div>

                {/* SNIPPETS GENERATOR */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Developer Snippet Generator</span>

                  {/* Tabs */}
                  <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    {['tailwind', 'css', 'scss', 'swift'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setSnippetTab(tab)}
                        className={`py-1 rounded-lg text-[9px] font-black uppercase transition-all ${snippetTab === tab ? 'bg-white dark:bg-slate-700 text-[var(--accent)] shadow-sm' : 'text-slate-400'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Copied output */}
                  <div onClick={() => triggerCopy(generatedSnippet)} className="bg-slate-950 text-slate-300 p-3 rounded-2xl font-mono text-[9px] break-all select-all relative overflow-hidden group/snippet border border-slate-800 cursor-pointer hover:border-[var(--accent)]">
                    <pre className="whitespace-pre-wrap">{generatedSnippet}</pre>
                    <div className="absolute right-2 top-2 bg-slate-800 text-white rounded p-1 opacity-0 group-hover/snippet:opacity-100 transition-opacity">
                      Copy
                    </div>
                  </div>
                </div>

                {/* Related Tokens Panel */}
                {relatedTokens.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Related Tokens</span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {relatedTokens.map(token => (
                        <button
                          key={token.id}
                          onClick={() => { setActiveWorkspaceId(token.workspaceId); setSelectedAssetId(token.id); }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700/50"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: token.type === 'color' ? token.value : 'var(--accent)' }}></span>
                          <span>{token.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 text-center text-slate-400 py-16">
                <svg className="mx-auto text-slate-300 dark:text-slate-650 mb-3" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Selected Token</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Select any design asset card in the grid registry pool to inspect detailed variants, histories, code templates, and play in the live sandbox preview.</p>
              </div>
            )}
          </aside>

        </div>

        {/* MODAL 1: PRELOADED ICON LIBRARY BROWSER */}
        {showIconLibrary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Browse Lucide Presets</h3>
                  <button onClick={() => setShowIconLibrary(false)} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                {/* Search preset icons */}
                <input
                  type="text"
                  placeholder="Search preset vectors..."
                  value={iconLibrarySearch}
                  onChange={(e) => setIconLibrarySearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-4 py-2.5 text-sm text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] mb-6"
                />

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto p-1">
                  {filteredPreloadedIcons.map(icon => (
                    <div
                      key={icon.name}
                      onClick={() => selectPreloadedIcon(icon)}
                      className="flex flex-col items-center justify-center p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:border-[var(--accent)] group transition-all"
                    >
                      <div className="text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform mb-2" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      <span className="text-[9px] font-extrabold text-slate-500 group-hover:text-[var(--accent)] text-center">{icon.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                <button onClick={() => setShowIconLibrary(false)} className="px-5 py-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: VISUAL GRADIENT BUILDER */}
        {showGradientBuilder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Visual Gradient Builder</h3>
                <button onClick={() => setShowGradientBuilder(false)} className="text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="space-y-5">

                {/* Type Select */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <button onClick={() => setGradType('linear')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${gradType === 'linear' ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--accent)]' : 'text-slate-400'}`}>Linear</button>
                  <button onClick={() => setGradType('radial')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${gradType === 'radial' ? 'bg-white dark:bg-slate-700 shadow-sm text-[var(--accent)]' : 'text-slate-400'}`}>Radial</button>
                </div>

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 block mb-1">Color 1 (Start)</label>
                    <div className="flex space-x-2">
                      <input type="color" value={gradStart} onChange={(e) => setGradStart(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer bg-white" />
                      <input type="text" value={gradStart} onChange={(e) => setGradStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-2 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 block mb-1">Color 2 (End)</label>
                    <div className="flex space-x-2">
                      <input type="color" value={gradEnd} onChange={(e) => setGradEnd(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer bg-white" />
                      <input type="text" value={gradEnd} onChange={(e) => setGradEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-2 text-xs font-mono" />
                    </div>
                  </div>
                </div>

                {/* Linear angle slider */}
                {gradType === 'linear' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span>Angle Degrees</span>
                      <span>{gradAngle}°</span>
                    </div>
                    <input type="range" min="0" max="360" value={gradAngle} onChange={(e) => setGradAngle(parseInt(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />

                    {/* Presets angles */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[{ l: 'Right', v: 90 }, { l: 'Bottom', v: 180 }, { l: 'Diag Right', v: 135 }, { l: 'Diag Left', v: 45 }].map(pr => (
                        <button key={pr.l} type="button" onClick={() => setGradAngle(pr.v)} className="text-[8px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-350 rounded border">
                          {pr.l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview Block */}
                <div>
                  <label className="text-[10px] font-bold text-slate-450 block mb-1.5">Real-time Preview</label>
                  <div
                    className="h-20 w-full rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700"
                    style={{
                      background: gradType === 'linear'
                        ? `linear-gradient(${gradAngle}deg, ${gradStart}, ${gradEnd})`
                        : `radial-gradient(circle, ${gradStart}, ${gradEnd})`
                    }}
                  />
                </div>

              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex space-x-2 justify-end">
                <button onClick={() => setShowGradientBuilder(false)} className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200">
                  Cancel
                </button>
                <button onClick={applyGradientValue} className="px-4 py-2 text-xs font-bold text-white bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-hover)]">
                  Apply Value
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: SPOTLIGHT CROSS-WORKSPACE SEARCH (/) */}
        {spotlightOpen && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-950/60 backdrop-blur-md p-4 sm:p-12 animate-fade-in">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-750 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh] mt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase">Spotlight Registry query</span>
                <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">ESC to exit</span>
              </div>

              {/* Main big input */}
              <div className="relative mb-4">
                <svg className="absolute left-4 top-4 text-slate-450" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  autoFocus
                  type="text"
                  placeholder="Query design tokens across all workspaces..."
                  value={spotlightQuery}
                  onChange={(e) => {
                    setSpotlightQuery(e.target.value);
                    setSpotlightSelectedIndex(0);
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-base text-slate-800 dark:text-slate-150 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)] transition-all font-semibold"
                />
                {/* Advanced Smart Filters */}
                <div className="flex space-x-2 mt-4 overflow-x-auto no-scrollbar">
                  {['All', 'Colors', 'SVG', 'Gradient', 'Image', 'Code', 'Pinned', 'Modified Today'].map(f => (
                    <button
                      key={f}
                      onClick={() => setActiveTypeFilter(f)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors border ${activeTypeFilter === f
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {spotlightQuery ? (
                  spotlightResults.length > 0 ? (
                    spotlightResults.map((asset, idx) => {
                      const ws = workspaces.find(w => w.id === asset.workspaceId);
                      const isSelected = idx === spotlightSelectedIndex;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => {
                            setActiveWorkspaceId(asset.workspaceId);
                            setSelectedAssetId(asset.id);
                            setSpotlightOpen(false);
                          }}
                          onMouseEnter={() => setSpotlightSelectedIndex(idx)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${isSelected
                            ? 'bg-[var(--accent-light)] dark:bg-[var(--accent-light)] border-[var(--accent-ring)] text-[#1A252C] dark:text-[#94D2BD]'
                            : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ws?.color || '#cbd5e1' }} />
                            <div className="truncate">
                              <h4 className="text-xs font-black truncate">{asset.name}</h4>
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400">{ws?.name || 'Workspace'} &bull; {asset.type}</span>
                            </div>
                          </div>
                          <span className="font-mono text-[9px] opacity-60 truncate max-w-[200px]">{asset.value}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-10">No design tokens match "{spotlightQuery}"</div>
                  )
                ) : (
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { setSpotlightOpen(false); setTimeout(() => { const el = document.getElementById('new-asset-name'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); } }, 150); }} className="flex items-center p-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:bg-[var(--accent-light)] dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 text-xs font-bold text-left">
                          <svg className="mr-2 text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          Create New Asset
                        </button>
                        <button onClick={() => { setSpotlightOpen(false); handleZipExport(); }} className="flex items-center p-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 text-xs font-bold text-left">
                          <svg className="mr-2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          Export to .ZIP
                        </button>
                      </div>
                    </div>

                    {/* Recent Assets */}
                    {recentAssetsData.length > 0 && (
                      <div>
                        <h4 className="text-[9px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest">Recent Activity</h4>
                        <div className="space-y-1">
                          {recentAssetsData.slice(0, 4).map(asset => {
                            const ws = workspaces.find(w => w.id === asset.workspaceId);
                            return (
                              <button
                                key={asset.id}
                                onClick={() => {
                                  setActiveWorkspaceId(asset.workspaceId);
                                  setSelectedAssetId(asset.id);
                                  setSpotlightOpen(false);
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                              >
                                <div className="flex items-center space-x-3 truncate">
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ws?.color || '#cbd5e1' }} />
                                  <div className="truncate text-left">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{asset.name}</h4>
                                    <span className="text-[9px] text-slate-400">{ws?.name || 'Workspace'} &bull; {asset.type}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING COACH MARK TOUR PANEL */}
        {showOnboarding && (
          <div className="fixed bottom-6 right-6 z-[150] bg-slate-900 text-white rounded-3xl p-5 shadow-2xl max-w-sm border border-slate-800 animate-slide-in">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-black text-sm text-[var(--accent)] dark:text-[#94D2BD]">{onboardingSteps[onboardingStep].title}</h4>
              <span className="text-[9px] text-slate-450 font-bold">{onboardingStep + 1} of {onboardingSteps.length}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{onboardingSteps[onboardingStep].text}</p>

            <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  localStorage.setItem('wv_onboarding_completed', 'true');
                  setShowOnboarding(false);
                }}
                className="text-[10px] font-black uppercase text-slate-450 hover:text-slate-300"
              >
                Skip Guide
              </button>
              <div className="flex space-x-2">
                {onboardingStep > 0 && (
                  <button
                    onClick={() => setOnboardingStep(prev => prev - 1)}
                    className="px-3 py-1.5 bg-slate-800 text-[10px] font-black uppercase rounded-lg hover:bg-slate-750"
                  >
                    Prev
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onboardingStep < onboardingSteps.length - 1) {
                      setOnboardingStep(prev => prev + 1);
                    } else {
                      localStorage.setItem('wv_onboarding_completed', 'true');
                      setShowOnboarding(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[10px] font-black uppercase rounded-lg shadow-md"
                >
                  {onboardingStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context Menu Portal */}
        {contextMenuState.isOpen && (
          <ContextMenu
            x={contextMenuState.x}
            y={contextMenuState.y}
            asset={contextMenuState.asset}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onClose={() => setContextMenuState(prev => ({ ...prev, isOpen: false }))}
            onAction={handleContextMenuAction}
          />
        )}

        {/* Modals */}
        <KeyboardShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
        <ImageTracerModal
          isOpen={isImageTracerOpen}
          onClose={() => setIsImageTracerOpen(false)}
          onTraceComplete={handleTraceComplete}
        />
        <IconSearchModal
          isOpen={isIconSearchOpen}
          onClose={() => setIsIconSearchOpen(false)}
          onSelectIcon={(svgText, name) => {
            setNewAssetType('svg');
            setNewAssetValue(svgText);
            setNewAssetName(name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
            // Optionally auto-submit or just let user verify and submit
          }}
        />
        <HelpGuide
          isOpen={isHelpGuideOpen}
          onClose={() => setIsHelpGuideOpen(false)}
        />

        <AIGeneratorModal
          isOpen={isAIGeneratorOpen}
          onClose={() => setIsAIGeneratorOpen(false)}
        />
      </div>
    </AppProvider>
  );
}