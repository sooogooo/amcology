import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Check, Sparkles, RefreshCw, Layers, ShieldCheck, FileText, Bookmark } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Article } from '../data/articles';

interface AcademicCoverModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

export function AcademicCoverModal({ article, isOpen, onClose }: AcademicCoverModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'monograph' | 'blueprint' | 'minimalist'>('monograph');
  const coverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const episodeStr = `EP.${String(article.id).padStart(2, '0')}`;
  
  // Extract main title parts
  const titleParts = article.title.match(/(医美产业经济学\s+\d+)\s+(.*)/);
  const mainTitleText = titleParts ? titleParts[2] : article.title;

  const handleDownloadImage = async () => {
    if (!coverRef.current) return;
    setIsGenerating(true);
    try {
      // Use html2canvas to capture the academic cover element
      const canvas = await html2canvas(coverRef.current, {
        scale: 3, // High-DPI for crystal clear print & retina quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `医美产业经济学-EP${String(article.id).padStart(2, '0')}-学术研报封面.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Failed to generate cover image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    if (!coverRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(coverRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } else {
            // Fallback download if clipboard item is not supported
            handleDownloadImage();
          }
        } catch (e) {
          console.warn('Clipboard write error fallback:', e);
          handleDownloadImage();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy cover image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl bg-stone-100 dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Modal Header */}
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/70 dark:bg-zinc-850/70 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100">
                  学术研报风格封面生成器
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Academic Monograph & Research Cover · html2canvas 高清光栅化
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Style Tabs Switcher */}
          <div className="px-6 pt-3 pb-1 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 bg-stone-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">风格版式:</span>
              <button
                onClick={() => setSelectedTheme('monograph')}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  selectedTheme === 'monograph'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800'
                }`}
              >
                典雅研报 (Classic)
              </button>
              <button
                onClick={() => setSelectedTheme('blueprint')}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  selectedTheme === 'blueprint'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800'
                }`}
              >
                深邃蓝图 (Blueprint)
              </button>
              <button
                onClick={() => setSelectedTheme('minimalist')}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  selectedTheme === 'minimalist'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800'
                }`}
              >
                极简数理 (Mathematical)
              </button>
            </div>
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 hidden sm:inline">
              300 DPI 超清渲染
            </span>
          </div>

          {/* Render & Preview Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-stone-200/60 dark:bg-zinc-950/60 flex-1">
            
            {/* --- The Academic Report Cover DOM Element (Captured by html2canvas) --- */}
            <div
              ref={coverRef}
              id="academic-report-cover-capture"
              className={`w-[360px] sm:w-[420px] min-h-[580px] sm:min-h-[620px] p-8 rounded-2xl shadow-xl relative flex flex-col justify-between select-none overflow-hidden transition-all duration-300 ${
                selectedTheme === 'monograph'
                  ? 'bg-[#fcfaf7] text-zinc-900 border border-zinc-300'
                  : selectedTheme === 'blueprint'
                  ? 'bg-[#0f172a] text-slate-100 border border-slate-700'
                  : 'bg-white text-zinc-950 border border-zinc-300'
              }`}
              style={{
                fontFamily: '"Noto Serif SC", serif, Georgia, Cambria',
              }}
            >
              {/* Geometric Minimalist Elements & Line Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                {selectedTheme === 'monograph' && (
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern-mono" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#d6cfc7" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern-mono)" />
                    {/* Minimalist Precision Circles */}
                    <circle cx="85%" cy="15%" r="80" fill="none" stroke="#b45309" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                    <circle cx="85%" cy="15%" r="110" fill="none" stroke="#b45309" strokeWidth="0.5" opacity="0.3" />
                    <line x1="0" y1="120" x2="100%" y2="120" stroke="#b45309" strokeWidth="0.75" opacity="0.4" />
                    <line x1="60" y1="0" x2="60" y2="100%" stroke="#d6cfc7" strokeWidth="0.5" />
                  </svg>
                )}

                {selectedTheme === 'blueprint' && (
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern-blue" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern-blue)" />
                    <circle cx="50%" cy="50%" r="160" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="6 6" opacity="0.25" />
                    <circle cx="50%" cy="50%" r="200" fill="none" stroke="#818cf8" strokeWidth="0.5" opacity="0.2" />
                    <line x1="20" y1="20" x2="400" y2="600" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2" />
                  </svg>
                )}

                {selectedTheme === 'minimalist' && (
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#e4e4e7" strokeWidth="1" />
                    <line x1="90%" y1="0" x2="90%" y2="100%" stroke="#e4e4e7" strokeWidth="1" />
                    <circle cx="20" cy="20" r="4" fill="#18181b" />
                    <circle cx="400" cy="20" r="4" fill="#18181b" />
                    <circle cx="20" cy="600" r="4" fill="#18181b" />
                    <circle cx="400" cy="600" r="4" fill="#18181b" />
                    <rect x="60" y="80" width="300" height="460" fill="none" stroke="#18181b" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.15" />
                  </svg>
                )}
              </div>

              {/* Cover Top Header: Academic Header & Meta */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-current/20">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-widest font-bold uppercase px-2 py-0.5 rounded border border-current/30">
                      AMCOLOGY RESEARCH
                    </span>
                    <span className="font-mono text-[10px] opacity-70">
                      ISSN 2026-8809
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {episodeStr}
                  </span>
                </div>

                <div className="font-mono text-[11px] tracking-widest text-zinc-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span>{article.moduleName} ｜ 斯密经济学范式</span>
                </div>
              </div>

              {/* Cover Center: Large Typography Title & Key Thesis */}
              <div className="relative z-10 my-6 space-y-5">
                <div className="space-y-2">
                  <div className="font-mono text-xs text-zinc-400 dark:text-slate-500 tracking-wider">
                    MONOGRAPH SERIES / 医美产业经济学
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight tracking-tight">
                    {mainTitleText}
                  </h1>
                </div>

                {/* Elegant Geometric Accent Line with Crosshairs */}
                <div className="flex items-center gap-2 py-1">
                  <div className="h-[2px] w-12 bg-amber-600" />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <div className="h-[1px] flex-1 bg-current/20" />
                  <span className="font-mono text-[9px] opacity-50">§ 1776</span>
                </div>

                {/* Key Theoretical Abstract Quote */}
                <div className="p-4 rounded-xl border border-current/15 bg-black/5 dark:bg-white/5 backdrop-blur-2xs space-y-2">
                  <div className="text-[10px] font-mono tracking-widest text-amber-700 dark:text-amber-400 uppercase font-bold">
                    [ 核心经济学命题 ]
                  </div>
                  <p className="text-xs sm:text-sm italic leading-relaxed opacity-90 font-serif">
                    “{article.quote}”
                  </p>
                </div>
              </div>

              {/* Cover Bottom Footer: Author, QR Code & Institutional Signature */}
              <div className="relative z-10 border-t pt-4 border-current/20 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono opacity-60 uppercase">AUTHOR & RESEARCHER</div>
                    <div className="text-xs sm:text-sm font-serif font-bold tracking-wide">
                      于意云 <span className="font-mono font-normal opacity-70 text-[11px]">(Yu Yiyun / @sooogooo)</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 dark:text-slate-400">
                      超级医美 · 产业经济学专栏
                    </div>
                  </div>

                  {/* Author WeChat Official Account QR Code */}
                  <div className="flex items-center gap-2 p-1.5 rounded-xl border border-current/15 bg-white/60 dark:bg-black/20 shadow-2xs">
                    <img
                      src="https://amcology.talk.stemcell.gold/talk-images/wechatpub-code.jpg"
                      alt="作者微信公众号二维码"
                      className="w-12 h-12 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left font-sans pr-1">
                      <div className="text-[10px] font-bold text-zinc-900 dark:text-slate-100 whitespace-nowrap">
                        微信公众号
                      </div>
                      <div className="text-[9px] font-mono opacity-70 whitespace-nowrap">
                        扫码阅读专栏
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono opacity-60 pt-1 border-t border-current/10">
                  <span>CLASSICAL ECONOMICS × AESTHETIC SURGERY</span>
                  <span>amcology.talk.stemcell.gold</span>
                </div>
              </div>

            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 py-4 bg-white/90 dark:bg-zinc-850 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>纯前端超清 Canvas 光栅渲染，适配海报分发与学术留存</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyImage}
                disabled={isGenerating}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-mono font-medium border border-zinc-300 dark:border-zinc-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">已复制图像到剪贴板</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>复制研报封面</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isGenerating}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold rounded-xl text-xs font-mono transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>生成高清海报中...</span>
                  </>
                ) : downloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已保存至相册</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>保存高清封面 (PNG)</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
