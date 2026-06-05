import { useState, useEffect } from 'react';

const categories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
        <line x1="9" y1="3" x2="9" y2="18"></line>
        <line x1="15" y1="6" x2="15" y2="21"></line>
      </svg>
    )
  },
  {
    id: 'file-ingestion',
    title: 'File Ingestion',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    )
  },
  {
    id: 'interface-hierarchy',
    title: 'Interface Hierarchy',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="9" rx="1"></rect>
        <rect x="14" y="3" width="7" height="5" rx="1"></rect>
        <rect x="14" y="12" width="7" height="9" rx="1"></rect>
        <rect x="3" y="16" width="7" height="5" rx="1"></rect>
      </svg>
    )
  },
  {
    id: 'capabilities',
    title: 'Capabilities',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="4" y1="21" x2="4" y2="14"></line>
        <line x1="4" y1="10" x2="4" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="3"></line>
        <line x1="20" y1="21" x2="20" y2="16"></line>
        <line x1="20" y1="12" x2="20" y2="3"></line>
        <line x1="1" y1="14" x2="7" y2="14"></line>
        <line x1="9" y1="8" x2="15" y2="8"></line>
        <line x1="17" y1="16" x2="23" y2="16"></line>
      </svg>
    )
  },
  {
    id: 'account-security',
    title: 'Account & Security',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    )
  }
];

export default function HelpGuide({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('getting-started');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-start">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="relative w-full max-w-4xl bg-[#FFFFFF] h-full shadow-2xl flex flex-col animate-[slideInLeft_0.3s_ease-out] z-10"
        style={{ animationName: 'slideInLeft' }}
      >
        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeInHelp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#94D2BD]/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#1A252C]">VectorSpace Help Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-[var(--accent)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-label="Close Help Guide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Navigation */}
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 p-3 md:p-6 flex-shrink-0">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 md:mb-4 px-2 hidden md:block">Knowledge Base</h3>
            <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 md:gap-2 pb-1.5 md:pb-0 hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex-shrink-0 whitespace-nowrap md:w-full text-left px-3 py-2 md:px-4 md:py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2.5 ${activeTab === cat.id
                      ? 'bg-[#94D2BD] text-[var(--accent)] shadow-sm transform scale-[1.02]'
                      : 'text-[#4A5560] hover:bg-gray-100 hover:text-[#1A252C]'
                    }`}
                >
                  <span className={activeTab === cat.id ? 'text-[var(--accent)]' : 'text-[#4A5560]'}>
                    {cat.icon}
                  </span>
                  <span className="text-xs md:text-sm">{cat.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto bg-[#FFFFFF]">

            {activeTab === 'getting-started' && (
              <div className="space-y-6 md:space-y-8 animate-[fadeInHelp_0.3s_ease-out]" style={{ animationName: 'fadeInHelp' }}>
                <h3 className="text-xl md:text-2xl font-extrabold text-[#1A252C] flex items-center gap-3">
                  <span className="text-[var(--accent)] flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                      <line x1="9" y1="3" x2="9" y2="18"></line>
                      <line x1="15" y1="6" x2="15" y2="21"></line>
                    </svg>
                  </span>
                  Getting Started
                </h3>
                <ul className="space-y-4 md:space-y-6 list-none text-[#4A5560] leading-relaxed text-sm md:text-base">
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span>VectorSpace initialization loads directly onto an infinite coordinate grid canvas, allowing frictionless canvas navigation and rendering of custom designs.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span>Navigate the workspace canvas using middle-mouse-click drag, or spacebar combined with left-click drag to pan the viewport smoothly without shifting individual layout elements.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'file-ingestion' && (
              <div className="space-y-6 md:space-y-8 animate-[fadeInHelp_0.3s_ease-out]" style={{ animationName: 'fadeInHelp' }}>
                <h3 className="text-xl md:text-2xl font-extrabold text-[#1A252C] flex items-center gap-3">
                  <span className="text-[var(--accent)] flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </span>
                  File Ingestion
                </h3>
                <ul className="space-y-4 md:space-y-6 list-none text-[#4A5560] leading-relaxed text-sm md:text-base">
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span>Bypass traditional file dialog structures completely with the optimized drag-and-drop landing system for immediate token uploads.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span>Drag pixel image templates (PNG, JPEG format) directly from local file directories onto the active window areas.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span>Watch the file container transition from Sage Green to Deep Teal during active drag events, indicating that the capture target is active. File rendering compiles in milliseconds.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'interface-hierarchy' && (
              <div className="space-y-6 md:space-y-8 animate-[fadeInHelp_0.3s_ease-out]" style={{ animationName: 'fadeInHelp' }}>
                <h3 className="text-xl md:text-2xl font-extrabold text-[#1A252C] flex items-center gap-3">
                  <span className="text-[var(--accent)] flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                      <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                      <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                      <rect x="3" y="16" width="7" height="5" rx="1"></rect>
                    </svg>
                  </span>
                  Interface Hierarchy
                </h3>
                <ul className="space-y-4 md:space-y-6 list-none text-[#4A5560] leading-relaxed text-sm md:text-base">
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span><strong>Left Sidebar Controller:</strong> Houses project workspaces, infinite nested folders, custom token category filters, primary buttons, and the system log-out mechanism. The sidebar can be expanded or collapsed to maximize screen real estate.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span><strong>Top Header Bar:</strong> Features workspace pathing trackers (such as showing the directory hierarchy), local data synchronization badges, custom accent theme inputs, import/export buttons, dark mode selectors, and user authentication statuses.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span><strong>Middle Dashboard Panel:</strong> Holds active design cards, recent files, and code containers. Enables inline editing, swiping gestures, and details updates for individual assets.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span><strong>Right Workspace Inspector:</strong> Triggers detailed preview inspectors for color shade palettes, WCAG contrast checkers, color harmonies, color blindness simulators, typography pairs, and image comparisons.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'capabilities' && (
              <div className="space-y-6 md:space-y-8 animate-[fadeInHelp_0.3s_ease-out]" style={{ animationName: 'fadeInHelp' }}>
                <h3 className="text-xl md:text-2xl font-extrabold text-[#1A252C] flex items-center gap-3">
                  <span className="text-[var(--accent)] flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="21" x2="4" y2="14"></line>
                      <line x1="4" y1="10" x2="4" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12" y2="3"></line>
                      <line x1="20" y1="21" x2="20" y2="16"></line>
                      <line x1="20" y1="12" x2="20" y2="3"></line>
                      <line x1="1" y1="14" x2="7" y2="14"></line>
                      <line x1="9" y1="8" x2="15" y2="8"></line>
                      <line x1="17" y1="16" x2="23" y2="16"></line>
                    </svg>
                  </span>
                  Capabilities
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">1. Workspace Isolation</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Configure custom project environments. Manage color styles, SVG files, gradients, shadows, and image assets securely separated by context or client parameters.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">2. Color Primitives & Sliders</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Create solid colors in HEX, RGB, and HSL spaces. Leverage interactive slide controllers to fine-tune red, green, blue, hue, saturation, and lightness attributes in real time.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">3. Tailwind Shade Scale Generation</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Convert single solid colors into mathematically distributed 11-step shading scales spanning from weight 50 to weight 950, matching standard frameworks.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">4. WCAG Contrast & YIQ Analytics</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Evaluate color combinations against standard accessibility guidelines. The tool applies YIQ relative luminance calculations to output contrast ratios and guarantee WCAG AA and AAA compliance.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">5. Color Harmonies</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Instantly calculate matching color schemes in complementary (180-degree shift), triadic (three equally spaced colors), and analogous (adjacent colors on the color wheel) alignments.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">6. Color Blindness Simulators</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Preview color assets in simulated states of Protanopia (red deficiency), Deuteranopia (green deficiency), and Tritanopia (blue deficiency) to verify cross-visual accessibility.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">7. Image-to-SVG Converter</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Process local raster formats (PNG, JPEG) using client-side image parsing libraries to trace outline coordinates and return copyable, lightweight, fully scalable SVG vector paths.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">8. Typography Sandbox</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Configure custom text pairings. Adjust leading (line-height), tracking (letter-spacing), weight values, and check responsive scale layouts dynamically.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">9. Preview Sandbox & Code Formatting</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Inspect and compare visual modifications, format code snippets automatically, and clean/optimize SVG paths directly from the Value Payload panel.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">10. AI Asset Generator Simulation</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Instantly synthesize HTML code snippets, SVG icons, and color palettes from raw text prompts. Features a side-by-side live visual preview alongside the raw code payload, with one-click saving to your active workspace folder.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1A252C] text-base mb-2">11. Digital Token Export Engine</h4>
                    <p className="text-[#4A5560] text-sm leading-relaxed">
                      Extract project details seamlessly. Export workspaces as standard W3C Design Tokens JSON, auto-generate ready-to-paste CSS Variable style documents, or download ZIP archives packed with vector configurations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account-security' && (
              <div className="space-y-6 md:space-y-8 animate-[fadeInHelp_0.3s_ease-out]" style={{ animationName: 'fadeInHelp' }}>
                <h3 className="text-xl md:text-2xl font-extrabold text-[#1A252C] flex items-center gap-3">
                  <span className="text-[var(--accent)] flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  Account & Security
                </h3>
                <ul className="space-y-4 md:space-y-6 list-none text-[#4A5560] leading-relaxed text-sm md:text-base">
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span>Sessions persist locally inside sandboxed browser workspace storage, securing system data across tab loads and refreshing operations.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 items-start">
                    <span className="text-[var(--accent)] mt-1.5 text-lg leading-none flex-shrink-0">•</span>
                    <span>To guarantee compliance and security, selecting Log Out from the left sidebar collapses the session state and wipes the active storage tokens completely.</span>
                  </li>
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
