import { X, Search, Sparkles, Download, BookOpen, Mail, Calculator } from 'lucide-react';
import React from 'react';
import { Article, articles } from '../data/articles';

interface SidebarProps {
  activeArticleId: number;
  onSelectArticle: (id: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenSearch?: () => void;
  onOpenExportBook?: () => void;
  onOpenSubscribe?: () => void;
  onReplaySplash?: () => void;
}

export function Sidebar({ activeArticleId, onSelectArticle, isOpen, setIsOpen, onOpenSearch, onOpenExportBook, onOpenSubscribe, onReplaySplash }: SidebarProps) {
  // Group articles by module
  const groupedArticles = articles.reduce((acc, article) => {
    const key = article.moduleName;
    if (!acc[key]) {
      acc[key] = {
        name: key,
        desc: article.moduleDesc,
        articles: [],
      };
    }
    acc[key].articles.push(article);
    return acc;
  }, {} as Record<string, { name: string; desc: string; articles: Article[] }>);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/60 z-40 lg:hidden transition-opacity backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:w-80 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-shrink-0 p-6 sm:p-8 flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img 
                src="https://amcology.talk.stemcell.gold/talk-images/amcology.png" 
                alt="Amcology Logo" 
                className="h-8 w-auto object-contain max-w-[120px]" 
                referrerPolicy="no-referrer"
              />
              <p className="text-[10px] font-bold tracking-[0.2em] text-amber-700 dark:text-amber-500 uppercase font-mono">Long-term Asset</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif leading-tight font-black text-zinc-900 dark:text-zinc-100">医美产业<br/>经济学</h1>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic">读《国富论》，重新理解医美行业。从财富规律到美丽消费。</p>
            
            {/* Quick Search Shortcut Button in Sidebar */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="mt-4 w-full flex items-center justify-between px-3 py-2 bg-stone-100 dark:bg-zinc-800/80 hover:bg-stone-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
                  <span>检索词条与章节...</span>
                </div>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded text-[10px] text-zinc-400 dark:text-zinc-300">⌘K</kbd>
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 -mr-3 -mt-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-7 no-scrollbar">
          {Object.values(groupedArticles).map((group, idx) => (
            <div key={group.name} className="space-y-3">
              <div className="px-2">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1.5 mb-1.5 font-mono">
                  {group.name} / ROADMAP
                </p>
              </div>
              <ul className="space-y-2 pr-1">
                {group.articles.map((article) => {
                  const titleMatch = article.title.match(/(医美产业经济学\s+\d+)\s+(.*)/);
                  const displayTitle = titleMatch ? titleMatch[2] : article.title;
                  const isActive = activeArticleId === article.id;
                  
                  return (
                    <li key={article.id}>
                      <button
                        onClick={() => {
                          onSelectArticle(article.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left flex items-start gap-3 py-2 px-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/10 dark:bg-amber-500/20 text-zinc-900 dark:text-zinc-100 font-bold'
                            : 'opacity-70 hover:opacity-100 hover:bg-stone-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className={`font-serif text-base ${isActive ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-zinc-300 dark:text-zinc-600'}`}>
                          {String(article.id).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className={`text-xs sm:text-sm leading-snug ${isActive ? 'font-bold text-zinc-900 dark:text-zinc-100' : 'font-medium text-zinc-700 dark:text-zinc-300'}`}>
                            {displayTitle}
                          </h3>
                          {isActive && (
                            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-1 italic font-mono">{article.moduleDesc}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Export Full Book & Subscribe & Calculator Actions in Sidebar */}
        <div className="p-4 pt-2 pb-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <button
            onClick={() => {
              setIsOpen(false);
              const el = document.getElementById('economic-calculators');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                el.classList.add('ring-2', 'ring-amber-500', 'transition-all');
                setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2500);
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-serif font-bold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>资本效率 & LTV 测算器</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">工具</span>
          </button>

          {onOpenExportBook && (
            <button
              onClick={onOpenExportBook}
              className="w-full flex items-center justify-between px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-serif font-bold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>导出学术研报 / 知识库</span>
              </div>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">PDF/MD</span>
            </button>
          )}

          {onOpenSubscribe && (
            <button
              onClick={onOpenSubscribe}
              className="w-full flex items-center justify-between px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-600/30 rounded-xl text-xs font-serif font-bold text-amber-900 dark:text-amber-300 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>订阅专栏更新 (Email/RSS)</span>
              </div>
              <span className="text-[10px] font-mono font-normal text-amber-700 dark:text-amber-400">免费</span>
            </button>
          )}

          {onReplaySplash && (
            <button
              onClick={() => {
                setIsOpen(false);
                onReplaySplash();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-[11px] font-mono text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>重温开屏金句闪动</span>
              </div>
              <span className="text-[9px] text-zinc-400">动效</span>
            </button>
          )}
        </div>

        <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-zinc-400">
          <div className="text-[9px] font-mono tracking-wider">ADAM SMITH × MED-AESTHETICS</div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-zinc-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-zinc-700"></div>
          </div>
        </div>
      </aside>
    </>
  );
}
