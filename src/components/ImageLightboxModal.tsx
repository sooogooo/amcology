import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Download, 
  RefreshCcw, 
  Info,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Check,
  Move
} from 'lucide-react';

export type CanvasTone = 'white' | 'ivory' | 'slate' | 'dark' | 'checkerboard';

export interface LightboxImageItem {
  src?: string;
  svgNode?: React.ReactNode;
  alt?: string;
  title?: string;
  caption?: string;
  category?: string;
  initialTone?: CanvasTone;
}

interface ImageLightboxContextType {
  openLightbox: (item: LightboxImageItem) => void;
  closeLightbox: () => void;
  isOpen: boolean;
}

const ImageLightboxContext = createContext<ImageLightboxContextType | null>(null);

export function useImageLightbox() {
  const ctx = useContext(ImageLightboxContext);
  if (!ctx) {
    throw new Error('useImageLightbox must be used within an ImageLightboxProvider');
  }
  return ctx;
}

const TONE_CONFIGS: Record<CanvasTone, {
  id: CanvasTone;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotColor: string;
  desc: string;
}> = {
  white: {
    id: 'white',
    label: '学术纯白',
    bgClass: 'bg-[#ffffff]',
    textClass: 'text-zinc-900',
    borderClass: 'border-zinc-300 shadow-2xl shadow-zinc-950/20',
    dotColor: '#ffffff',
    desc: '高对比度纯白纸张，极佳图表文字清晰度（推荐）'
  },
  ivory: {
    id: 'ivory',
    label: '羊皮纸米黄',
    bgClass: 'bg-[#f7f3e8]',
    textClass: 'text-stone-900',
    borderClass: 'border-amber-200/80 shadow-2xl shadow-amber-950/15',
    dotColor: '#f7f3e8',
    desc: '温润柔光护眼纸色，适合长时间研读'
  },
  slate: {
    id: 'slate',
    label: '轻奢浅灰',
    bgClass: 'bg-[#edf2f7]',
    textClass: 'text-slate-900',
    borderClass: 'border-slate-300 shadow-2xl shadow-slate-950/15',
    dotColor: '#edf2f7',
    desc: '中性现代灰底，均衡展现各种色谱'
  },
  dark: {
    id: 'dark',
    label: '展厅深灰',
    bgClass: 'bg-[#18181b]',
    textClass: 'text-zinc-100',
    borderClass: 'border-zinc-700 shadow-2xl shadow-black/60',
    dotColor: '#18181b',
    desc: '深邃暗色底板，适合明亮高反差摄影图'
  },
  checkerboard: {
    id: 'checkerboard',
    label: '透明网格',
    bgClass: 'bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-100',
    textClass: 'text-zinc-900',
    borderClass: 'border-zinc-300 shadow-2xl',
    dotColor: '#a1a1aa',
    desc: '透明通道透视图格，适合查看矢量边缘与透明PNG'
  },
};

export function ImageLightboxProvider({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = useState<LightboxImageItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [showToneMenu, setShowToneMenu] = useState<boolean>(false);
  
  // Default to white canvas for optimal contrast with dark SVG text & diagrams
  const [canvasTone, setCanvasTone] = useState<CanvasTone>(() => {
    const saved = localStorage.getItem('amcology_lightbox_tone');
    return (saved as CanvasTone) || 'white';
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasPlateRef = useRef<HTMLDivElement | null>(null);

  // Touch gesture states for mobile pinch-to-zoom & double-tap
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    lastTouchX: number;
    lastTouchY: number;
    lastTapTime: number;
  }>({
    initialDist: 0,
    initialZoom: 1,
    lastTouchX: 0,
    lastTouchY: 0,
    lastTapTime: 0,
  });

  // Lock background scroll when lightbox is opened to prevent layout jumps
  useEffect(() => {
    if (activeItem) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      const originalOverscroll = document.body.style.overscrollBehavior;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.body.style.overscrollBehavior = originalOverscroll;
      };
    }
  }, [activeItem]);

  const openLightbox = useCallback((item: LightboxImageItem) => {
    setActiveItem(item);
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setShowInfo(true);
    if (item.initialTone) {
      setCanvasTone(item.initialTone);
    } else {
      const saved = localStorage.getItem('amcology_lightbox_tone');
      setCanvasTone((saved as CanvasTone) || 'white');
    }
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveItem(null);
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setShowToneMenu(false);
  }, []);

  const handleSelectTone = (tone: CanvasTone) => {
    setCanvasTone(tone);
    localStorage.setItem('amcology_lightbox_tone', tone);
    setShowToneMenu(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(Number((prev + 0.3).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(Number((prev - 0.3).toFixed(2)), 0.6);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    if (activeItem?.src) {
      try {
        const response = await fetch(activeItem.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeItem.title || 'amcology-academic-diagram'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch {
        window.open(activeItem.src, '_blank');
      }
    } else if (activeItem?.svgNode) {
      try {
        const svgElement = canvasPlateRef.current?.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const a = document.createElement('a');
          a.href = svgUrl;
          a.download = `${activeItem.title || 'amcology-academic-schematic'}.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(svgUrl);
        }
      } catch (err) {
        console.error('Failed to export SVG', err);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!activeItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotate();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo(prev => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        const tones: CanvasTone[] = ['white', 'ivory', 'slate', 'dark', 'checkerboard'];
        setCanvasTone(curr => {
          const nextIdx = (tones.indexOf(curr) + 1) % tones.length;
          const nextTone = tones[nextIdx];
          localStorage.setItem('amcology_lightbox_tone', nextTone);
          return nextTone;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, closeLightbox]);

  // Desktop Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(Number((prev + 0.15).toFixed(2)), 4));
    } else {
      setZoomLevel(prev => {
        const next = Math.max(Number((prev - 0.15).toFixed(2)), 0.6);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click / double tap toggle zoom
  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2.2);
    }
  };

  // Mobile Touch Gestures (Pinch-to-zoom, Pan, Double-tap)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2-finger pinch start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStateRef.current.initialDist = dist;
      touchStateRef.current.initialZoom = zoomLevel;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      
      // Double-tap detection
      if (now - touchStateRef.current.lastTapTime < 300) {
        handleDoubleClick();
        touchStateRef.current.lastTapTime = 0;
        return;
      }
      touchStateRef.current.lastTapTime = now;

      // 1-finger pan start
      touchStateRef.current.lastTouchX = touch.clientX;
      touchStateRef.current.lastTouchY = touch.clientY;
      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2-finger pinch zooming
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      if (touchStateRef.current.initialDist > 0) {
        const factor = dist / touchStateRef.current.initialDist;
        const newZoom = Math.min(Math.max(touchStateRef.current.initialZoom * factor, 0.6), 4);
        setZoomLevel(Number(newZoom.toFixed(2)));
      }
    } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      // 1-finger pan
      e.preventDefault();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStateRef.current.initialDist = 0;
  };

  const currentToneConfig = TONE_CONFIGS[canvasTone] || TONE_CONFIGS.white;

  return (
    <ImageLightboxContext.Provider value={{ openLightbox, closeLightbox, isOpen: !!activeItem }}>
      {children}

      <AnimatePresence>
        {activeItem && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[999] flex flex-col justify-between backdrop-blur-md bg-zinc-950/90 select-none overflow-hidden font-sans text-zinc-100 transition-colors"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            id="image-lightbox-overlay"
          >
            {/* Top Toolbar */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-50 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-zinc-950/95 via-zinc-950/80 to-transparent border-b border-white/10"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                <div className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-100 font-serif truncate">
                    {activeItem.title || '医美产业经济学 · 学术图谱与高保真图解'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activeItem.category && (
                      <span className="text-[10px] sm:text-[11px] font-mono text-amber-400 font-medium">
                        {activeItem.category}
                      </span>
                    )}
                    <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400">
                      • 底板模式: <strong className="text-zinc-200">{currentToneConfig.label}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Action Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Background Tone Switcher Menu Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowToneMenu(prev => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 rounded-full text-xs font-mono transition-all cursor-pointer shadow-lg active:scale-95"
                    title="切换图解背景底色 (B) - 解决黑底看不清文字问题"
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline font-sans font-medium">{currentToneConfig.label}</span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" 
                      style={{ backgroundColor: currentToneConfig.dotColor }}
                    />
                  </button>

                  {/* Tone Options Dropdown Popover */}
                  <AnimatePresence>
                    {showToneMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 p-2 bg-zinc-900/95 border border-zinc-700/90 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 space-y-1 font-sans"
                      >
                        <div className="px-2.5 py-1.5 text-[11px] font-mono text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
                          <span>选择画布纸张底色</span>
                          <span className="text-[9px] text-amber-400">快捷键 B</span>
                        </div>

                        {(Object.keys(TONE_CONFIGS) as CanvasTone[]).map((tKey) => {
                          const config = TONE_CONFIGS[tKey];
                          const isSelected = canvasTone === tKey;
                          return (
                            <button
                              key={tKey}
                              onClick={() => handleSelectTone(tKey)}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' 
                                  : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-3.5 h-3.5 rounded-md border border-zinc-600 shadow-xs" 
                                  style={{ backgroundColor: config.dotColor }}
                                />
                                <span>{config.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            </button>
                          );
                        })}

                        <div className="pt-1.5 px-2 text-[10px] text-zinc-400 leading-tight">
                          💡 建议使用「学术纯白」或「羊皮纸米黄」以获得黑字图解最佳对比度
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Zoom Level Pill */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-900/90 border border-zinc-700/80 rounded-full px-1.5 sm:px-2 py-1 text-xs font-mono">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 hover:text-amber-400 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                    title="缩小 (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-1.5 sm:px-2 py-0.5 text-[11px] hover:text-amber-400 transition-colors cursor-pointer"
                    title="重置缩放 (0)"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 hover:text-amber-400 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                    title="放大 (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rotate button */}
                <button
                  onClick={handleRotate}
                  className="hidden xs:inline-flex p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-amber-400 rounded-full transition-colors cursor-pointer"
                  title="顺时针旋转 90° (R)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Fullscreen toggle */}
                <button
                  onClick={handleToggleFullscreen}
                  className="hidden md:inline-flex p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-amber-400 rounded-full transition-colors cursor-pointer"
                  title="全屏切换"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Download image/svg */}
                <button
                  onClick={handleDownload}
                  className="p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-amber-400 rounded-full transition-colors cursor-pointer"
                  title="保存/下载高清图表"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Close Lightbox */}
                <button
                  onClick={closeLightbox}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-full transition-colors cursor-pointer ml-1"
                  title="关闭窗口 (Esc)"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.div>

            {/* Quick Canvas Tone Bar (Direct 1-Click Toolbar under Header) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="relative z-40 px-3 sm:px-4 py-1.5 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between text-xs border-b border-white/5"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 mr-1 flex-shrink-0">
                  <Palette className="w-3 h-3 text-amber-400" />
                  <span>底板纸色:</span>
                </span>
                {(Object.keys(TONE_CONFIGS) as CanvasTone[]).map((tKey) => {
                  const cfg = TONE_CONFIGS[tKey];
                  const active = canvasTone === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => handleSelectTone(tKey)}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all flex-shrink-0 cursor-pointer ${
                        active
                          ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-400/60 shadow-sm'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-2xs" 
                        style={{ backgroundColor: cfg.dotColor }}
                      />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="sm:hidden flex items-center gap-1 text-[10px] font-mono text-zinc-400 flex-shrink-0 pl-2">
                <span>双指捏合缩放</span>
              </div>
            </motion.div>

            {/* Center Viewing Stage */}
            <div 
              className={`flex-1 relative flex items-center justify-center p-3 sm:p-8 overflow-hidden touch-none ${
                zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
              }`}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1]
                }}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                  transformOrigin: 'center center',
                }}
                className="max-w-full max-h-full flex items-center justify-center pointer-events-auto"
              >
                {activeItem.src ? (
                  /* Image Mode: Mounted on the user-selected high-contrast Paper Mat */
                  <div 
                    ref={canvasPlateRef}
                    className={`p-3 sm:p-6 rounded-2xl border transition-colors duration-200 ${currentToneConfig.bgClass} ${currentToneConfig.borderClass}`}
                  >
                    <img
                      ref={imageRef}
                      src={activeItem.src}
                      alt={activeItem.alt || activeItem.title || '放大图像'}
                      className="max-w-[85vw] max-h-[68vh] object-contain rounded-xl transition-all"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  </div>
                ) : activeItem.svgNode ? (
                  /* SVG / Diagram Mode: Mounted on high-contrast Academic White/Selected Paper Plate */
                  <div 
                    ref={canvasPlateRef}
                    className={`p-4 sm:p-8 rounded-2xl border max-w-[94vw] max-h-[76vh] overflow-auto transition-colors duration-200 ${currentToneConfig.bgClass} ${currentToneConfig.textClass} ${currentToneConfig.borderClass}`}
                  >
                    <div className="w-full flex items-center justify-center min-w-[320px]">
                      {activeItem.svgNode}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </div>

            {/* Bottom Caption & Shortcut Helper Bar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-50 p-3 sm:p-4 bg-gradient-to-t from-zinc-950/95 via-zinc-950/80 to-transparent border-t border-white/10"
            >
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
                {/* Image Caption Description */}
                {showInfo && activeItem.caption && (
                  <div className="text-xs text-zinc-200 font-sans leading-relaxed bg-zinc-900/90 border border-zinc-700/80 px-3.5 py-2 rounded-xl backdrop-blur-md max-w-2xl text-center sm:text-left shadow-lg">
                    <span className="font-bold text-amber-400 font-mono mr-1.5">💡 学术图解导读:</span>
                    {activeItem.caption}
                  </div>
                )}

                {/* Keyboard and Gesture Hints */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] font-mono text-zinc-400">
                  <span className="px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded hidden xs:inline-block">
                    双指捏合 / 滚轮缩放
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded">
                    双击快速放大
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded hidden sm:inline-block">
                    B键: 切换底色
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded">
                    ESC: 退出
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ImageLightboxContext.Provider>
  );
}

// Reusable component for zoomable images with enlarged touch target & smooth event handling
export function ZoomableImage({
  src,
  alt,
  title,
  caption,
  category,
  className = '',
  aspectRatio,
  initialTone = 'white',
}: {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  category?: string;
  className?: string;
  aspectRatio?: string;
  initialTone?: CanvasTone;
}) {
  const { openLightbox } = useImageLightbox();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openLightbox({ src, alt, title, caption, category, initialTone });
  };

  return (
    <div 
      className={`group relative overflow-hidden cursor-zoom-in rounded-xl transition-all p-1 -m-1 sm:p-0 sm:m-0 select-none ${className}`}
      onClick={handleClick}
      title="点击放大查看高保真大图"
    >
      <img
        src={src}
        alt={alt || title || '医美产业经济学图解'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103 rounded-lg"
        referrerPolicy="no-referrer"
        loading="lazy"
        draggable={false}
      />
      {/* Zoom Hover Badge with enlarged touch area */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 active:bg-black/35 transition-colors flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/90 text-amber-300 rounded-full text-xs font-mono font-bold shadow-xl border border-amber-500/30">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>点击放大</span>
        </div>
      </div>
    </div>
  );
}
