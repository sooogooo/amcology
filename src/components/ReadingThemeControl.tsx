import React from 'react';
import { Sun, Moon, BookOpen, Maximize2, Minimize2, Search, Download, Sparkles, Mail, Calculator } from 'lucide-react';

export type ReadingTheme = 'cream' | 'dark' | 'focus';

interface ReadingThemeControlProps {
  currentTheme: ReadingTheme;
  onSelectTheme: (theme: ReadingTheme) => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onOpenSearch: () => void;
  onOpenExportBook?: () => void;
  onOpenSubscribe?: () => void;
  onOpenCalculator?: () => void;
}

export function ReadingThemeControl({
  currentTheme,
  onSelectTheme,
  isFocusMode,
  onToggleFocusMode,
  onOpenSearch,
  onOpenExportBook,
  onOpenSubscribe,
  onOpenCalculator
}: ReadingThemeControlProps) {
  const handleScrollToCalculator = () => {
    if (onOpenCalculator) {
      onOpenCalculator();
    } else {
      const el = document.getElementById('economic-calculators');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-2', 'ring-amber-500', 'transition-all');
        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2500);
      }
    }
  };

  const handleToggleMobileTheme = () => {
    onSelectTheme(currentTheme === 'dark' ? 'cream' : 'dark');
  };

  return (
    <div className="flex items-center">
      {/* Mobile-Only Clean Minimalist Theme Switcher (< sm) */}
      <div className="flex sm:hidden items-center gap-1">
        <button
          onClick={handleToggleMobileTheme}
          className="p-2 text-zinc-700 dark:text-zinc-200 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors active:scale-95 cursor-pointer border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-2xs"
          title={currentTheme === 'dark' ? '切换为亮色纸质' : '切换为暗色护眼'}
          aria-label="切换阅读主题"
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700" />
          )}
        </button>
      </div>

      {/* Desktop Rich Toolbar (>= sm) */}
      <div className="hidden sm:flex items-center gap-1.5 p-1 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 rounded-xl shadow-xs backdrop-blur-md text-xs font-mono">
        {/* Interactive Economic Calculator Button */}
        <button
          onClick={handleScrollToCalculator}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 text-amber-900 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-600/30 rounded-lg font-bold transition-all cursor-pointer"
          title="打开医美机构资本效率与 LTV 复利测算器"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span className="hidden md:inline">LTV 测算器</span>
        </button>

        {/* Subscribe Button */}
        {onOpenSubscribe && (
          <button
            onClick={onOpenSubscribe}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="订阅专栏更新与 RSS 订阅源"
          >
            <Mail className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden md:inline">订阅</span>
          </button>
        )}

        {/* Export Book Button */}
        {onOpenExportBook && (
          <button
            onClick={onOpenExportBook}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-600/30 rounded-lg font-bold transition-all cursor-pointer"
            title="导出整本精编电子书 & 学术版面 PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">导出全书</span>
          </button>
        )}

        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="搜索词条与文章 (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
          <span className="hidden md:inline">检索 (⌘K)</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />

        {/* Theme: Classic Cream */}
        <button
          onClick={() => onSelectTheme('cream')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            currentTheme === 'cream'
              ? 'bg-amber-700/10 text-amber-900 font-bold border border-amber-600/30'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
          }`}
          title="经典雅致纸质感"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">经典纸质</span>
        </button>

        {/* Theme: Dark Slate/Zinc */}
        <button
          onClick={() => onSelectTheme('dark')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            currentTheme === 'dark'
              ? 'bg-zinc-800 text-amber-400 font-bold border border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
          title="夜间暗调护眼"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">夜间深色</span>
        </button>

        {/* Focus Pure Mode Toggle */}
        <button
          onClick={onToggleFocusMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            isFocusMode
              ? 'bg-amber-600 text-white font-bold'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
          title={isFocusMode ? '退出专注纯净模式' : '开启专注纯净模式（隐藏侧栏）'}
        >
          {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden lg:inline">{isFocusMode ? '退出专注' : '专注纯净'}</span>
        </button>
      </div>
    </div>
  );
}
