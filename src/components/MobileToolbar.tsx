import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Share2, Search, Calculator } from 'lucide-react';
import { articles } from '../data/articles';

interface MobileToolbarProps {
  activeArticleId: number;
  onSelectArticle: (id: number) => void;
  onOpenSidebar: () => void;
  onOpenShare: () => void;
  onOpenSearch?: () => void;
}

export function MobileToolbar({
  activeArticleId,
  onSelectArticle,
  onOpenSidebar,
  onOpenShare,
  onOpenSearch,
}: MobileToolbarProps) {
  const currentIndex = articles.findIndex((a) => a.id === activeArticleId);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  const scrollToCalculator = () => {
    const el = document.getElementById('economic-calculators');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-amber-500', 'transition-all');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2500);
    }
  };

  return (
    <nav 
      aria-label="Mobile Navigation Toolbar" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-zinc-800 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg transition-transform"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {/* Catalog Button */}
        <button
          onClick={onOpenSidebar}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors cursor-pointer"
          aria-label="打开目录"
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">目录</span>
        </button>

        {/* Calculator Button */}
        <button
          onClick={scrollToCalculator}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-amber-800 dark:text-amber-400 hover:bg-amber-500/10 active:bg-amber-500/20 transition-colors cursor-pointer"
          aria-label="LTV 测算器"
        >
          <Calculator className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">测算器</span>
        </button>

        {/* Search Modal Trigger Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors cursor-pointer"
            aria-label="全局搜索"
          >
            <Search className="w-4 h-4 mb-0.5 text-zinc-500 dark:text-zinc-400" />
            <span className="text-[10px] font-medium tracking-tight">检索</span>
          </button>
        )}

        {/* Previous Article Button */}
        <button
          onClick={() => prevArticle && onSelectArticle(prevArticle.id)}
          disabled={!prevArticle}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="上一篇"
        >
          <ChevronLeft className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">上一篇</span>
        </button>

        {/* Next Article Button */}
        <button
          onClick={() => nextArticle && onSelectArticle(nextArticle.id)}
          disabled={!nextArticle}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 active:bg-zinc-200 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="下一篇"
        >
          <ChevronRight className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">下一篇</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-amber-700/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 hover:bg-amber-700/20 active:bg-amber-700/30 transition-colors cursor-pointer"
          aria-label="分享"
        >
          <div className="relative">
            <Share2 className="w-4 h-4 mb-0.5 text-amber-700 dark:text-amber-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 tracking-tight">分享</span>
        </button>
      </div>
    </nav>
  );
}
