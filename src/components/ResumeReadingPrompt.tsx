import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, ArrowRight, X, Sparkles, Clock, History } from 'lucide-react';
import { ReadingHistoryItem } from '../utils/readingHistory';

interface ResumeReadingPromptProps {
  history: ReadingHistoryItem | null;
  isVisible: boolean;
  onResume: () => void;
  onDismiss: () => void;
}

export function ResumeReadingPrompt({
  history,
  isVisible,
  onResume,
  onDismiss,
}: ResumeReadingPromptProps) {
  if (!isVisible || !history) return null;

  const episodeStr = `EP.${String(history.articleId).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-16 right-4 sm:right-8 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-white/95 dark:bg-zinc-900/95 border border-amber-400/80 dark:border-amber-500/60 rounded-2xl shadow-2xl backdrop-blur-md p-4 text-zinc-800 dark:text-zinc-100"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-500/20 flex-shrink-0 mt-0.5">
              <History className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {episodeStr}
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-serif">
                  检测到上次阅读进度 ({Math.round(history.progressPercent)}%)
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1 font-sans">
                {history.articleTitle}
              </p>
              <p className="text-[11px] text-zinc-400 font-mono">
                是否直接跳转至上次阅读点？
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
            title="关闭提示"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            留在顶部
          </button>

          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold rounded-xl text-xs font-mono transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>恢复阅读位置</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
