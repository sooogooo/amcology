import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, ArrowRight, Sparkles, Copy, Check, Lightbulb, Compass, ExternalLink } from 'lucide-react';
import { ConceptItem } from '../data/concepts';

interface ConceptPopoverProps {
  concept: ConceptItem | null;
  onClose: () => void;
  onJumpToArticle: (articleId: number, targetSection: string) => void;
}

export function ConceptPopover({ concept, onClose, onJumpToArticle }: ConceptPopoverProps) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && concept) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [concept, onClose]);

  if (!concept) return null;

  const handleCopy = () => {
    const text = `【经济学术语】${concept.term}\n【定义】${concept.definition}\n【医美产业映射】${concept.keyTakeaway}\n—— 出自《医美产业经济学》专栏`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'smith':
        return {
          badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
          dot: 'bg-amber-500'
        };
      case 'modern':
        return {
          badge: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700',
          dot: 'bg-blue-500'
        };
      case 'operation':
        return {
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
          dot: 'bg-emerald-500'
        };
      default:
        return {
          badge: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700',
          dot: 'bg-purple-500'
        };
    }
  };

  const theme = getCategoryTheme(concept.category);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg bg-stone-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-6 pt-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${theme.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                  {concept.categoryLabel}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">词条精释</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100">
                {concept.term}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              aria-label="关闭浮层"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm">
            
            {/* Economic Definition */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>经典经济学原理解析</span>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-850 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 leading-relaxed font-sans shadow-sm">
                {concept.definition}
              </div>
            </div>

            {/* Aesthetic Medicine Industry Application / Key Takeaway */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>医美产业实践映射 (Practical Takeaway)</span>
              </div>
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/70 dark:border-amber-800/60 text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                {concept.keyTakeaway}
              </div>
            </div>

            {/* Context Connection to this Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                <span>本专栏对应精读章节</span>
              </div>
              <div className="p-4 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>EP.{String(concept.articleId).padStart(2, '0')}</span>
                  <span className="truncate max-w-[240px] text-right font-medium text-zinc-600 dark:text-zinc-300">
                    {concept.targetSection}
                  </span>
                </div>
                <p className="text-xs font-serif text-zinc-700 dark:text-zinc-200 line-clamp-2 italic">
                  “{concept.snippet}”
                </p>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-stone-100/80 dark:bg-zinc-850 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">已复制释义</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制术语释义</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onJumpToArticle(concept.articleId, concept.targetSection);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold rounded-xl text-xs font-mono transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>跳转至精读章节</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
