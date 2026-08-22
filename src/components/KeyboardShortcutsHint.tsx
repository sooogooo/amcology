import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, X, Sparkles, Command, ArrowRight, CornerDownLeft, Search, Moon, BookOpen } from 'lucide-react';

interface KeyboardShortcutsHintProps {
  onNextArticle: () => void;
  onPrevArticle: () => void;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onCycleTheme: () => void;
  isModalOpen?: boolean;
  onToggleModal?: () => void;
}

export function KeyboardShortcutsHint({
  onNextArticle,
  onPrevArticle,
  onToggleSidebar,
  onOpenSearch,
  onCycleTheme,
  isModalOpen,
  onToggleModal,
}: KeyboardShortcutsHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const showModal = isModalOpen !== undefined ? isModalOpen : isOpen;
  const setShowModal = onToggleModal ? onToggleModal : () => setIsOpen(prev => !prev);

  const shortcuts = [
    { key: 'J', action: '下一篇长文 (Next Episode)', desc: '按序推进至下一章深度拆解' },
    { key: 'K', action: '上一篇长文 (Prev Episode)', desc: '回溯上一章核心论点' },
    { key: 'M', action: '切换专栏目录 (Toggle Menu)', desc: '快速展开/折叠 12 讲目录与阅读进度' },
    { key: '/', action: '全局概念检索 (Search)', desc: '支持 ⌘K 或单键 / 检索全文与词典' },
    { key: 'T', action: '切换阅读主题 (Theme)', desc: '循环切换米白、纯白、羊皮纸与暗夜黑' },
    { key: 'Space', action: '跳过开屏 / 极速启动', desc: '在 SplashScreen 时瞬时进入正文' },
    { key: '?', action: '快捷键说明书 (Shortcuts)', desc: '打开或关闭本交互快捷指令浮层' },
    { key: 'Esc', action: '关闭浮层与弹窗 (Close)', desc: '快速退出当前激活的浮层面板' },
  ];

  return (
    <>
      {/* Floating Bottom Minimal Keycaps Bar (Desktop/Tablet) */}
      <div className="fixed bottom-4 right-6 z-40 hidden md:flex items-center gap-2">
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 rounded-full shadow-lg backdrop-blur-md text-[11px] font-mono text-zinc-600 dark:text-zinc-400 select-none"
            >
              {/* J Key */}
              <button
                onClick={onNextArticle}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
                title="下一篇 (J)"
              >
                <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:border-amber-500 shadow-2xs">
                  J
                </kbd>
                <span className="hidden lg:inline text-[10px]">下一篇</span>
              </button>

              <span className="text-zinc-300 dark:text-zinc-700">·</span>

              {/* K Key */}
              <button
                onClick={onPrevArticle}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
                title="上一篇 (K)"
              >
                <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:border-amber-500 shadow-2xs">
                  K
                </kbd>
                <span className="hidden lg:inline text-[10px]">上一篇</span>
              </button>

              <span className="text-zinc-300 dark:text-zinc-700">·</span>

              {/* M Key */}
              <button
                onClick={onToggleSidebar}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
                title="目录 (M)"
              >
                <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:border-amber-500 shadow-2xs">
                  M
                </kbd>
                <span className="hidden lg:inline text-[10px]">目录</span>
              </button>

              <span className="text-zinc-300 dark:text-zinc-700">·</span>

              {/* Search Key */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
                title="搜索 (/)"
              >
                <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:border-amber-500 shadow-2xs">
                  /
                </kbd>
                <span className="hidden lg:inline text-[10px]">搜索</span>
              </button>

              <span className="text-zinc-300 dark:text-zinc-700">·</span>

              {/* Full Help Modal Trigger */}
              <button
                onClick={() => setShowModal()}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
                title="全部快捷键 (?)"
              >
                <kbd className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 rounded text-[10px] font-bold shadow-2xs">
                  ?
                </kbd>
                <span className="hidden xl:inline text-[10px]">快捷键</span>
              </button>

              {/* Minimize bar button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="ml-1 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition-colors"
                title="收起提示条"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            title="展开快捷键提示"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Comprehensive Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={() => setShowModal()} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-lg bg-stone-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-500/20">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100">
                      全站极客快捷键指南 (Keyboard Cheatsheet)
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      无需鼠标 · 毫秒级流式沉浸阅读
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal()}
                  className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcut Table */}
              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto font-sans">
                {shortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-4 transition-colors hover:border-amber-500/40"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {item.action}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {item.desc}
                      </div>
                    </div>

                    <kbd className="flex-shrink-0 px-2.5 py-1 bg-stone-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 shadow-2xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-stone-100/80 dark:bg-zinc-850 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>提示：按 ESC 即可随时退出当前浮层</span>
                <button
                  onClick={() => setShowModal()}
                  className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold font-mono transition-transform active:scale-95 cursor-pointer"
                >
                  我知道了 (Esc)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
