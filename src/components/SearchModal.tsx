import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, BookOpen, Sparkles, ArrowRight, X, Hash, Flame } from 'lucide-react';
import { articles, Article } from '../data/articles';
import { economicConcepts, ConceptItem } from '../data/concepts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (articleId: number, targetHeading?: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelectArticle }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'concepts' | 'articles'>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global hotkey: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter concepts
  const filteredConcepts = useMemo(() => {
    if (!query.trim()) return economicConcepts;
    const q = query.toLowerCase();
    return economicConcepts.filter(c => 
      c.term.toLowerCase().includes(q) ||
      c.definition.toLowerCase().includes(q) ||
      c.keyTakeaway.toLowerCase().includes(q) ||
      c.categoryLabel.toLowerCase().includes(q)
    );
  }, [query]);

  // Filter articles & section paragraphs
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return articles.slice(0, 5).map(a => ({
        article: a,
        matchType: 'title' as const,
        matchedHeading: undefined,
        snippet: a.quote
      }));
    }

    const q = query.toLowerCase();
    const results: {
      article: Article;
      matchType: 'title' | 'quote' | 'section';
      matchedHeading?: string;
      snippet: string;
    }[] = [];

    articles.forEach(article => {
      if (article.title.toLowerCase().includes(q)) {
        results.push({
          article,
          matchType: 'title',
          snippet: article.quote
        });
        return;
      }

      if (article.quote.toLowerCase().includes(q)) {
        results.push({
          article,
          matchType: 'quote',
          snippet: article.quote
        });
        return;
      }

      // Match in sections
      for (const section of article.sections) {
        if (section.heading.toLowerCase().includes(q)) {
          results.push({
            article,
            matchType: 'section',
            matchedHeading: section.heading,
            snippet: section.paragraphs[0] || article.quote
          });
          break;
        }

        const matchedParagraph = section.paragraphs.find(p => p.toLowerCase().includes(q));
        if (matchedParagraph) {
          const idx = matchedParagraph.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 30);
          const end = Math.min(matchedParagraph.length, idx + 70);
          const snippetText = (start > 0 ? '...' : '') + matchedParagraph.substring(start, end) + (end < matchedParagraph.length ? '...' : '');

          results.push({
            article,
            matchType: 'section',
            matchedHeading: section.heading,
            snippet: snippetText
          });
          break;
        }
      }
    });

    return results;
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-60 flex items-start justify-center p-3 sm:p-6 md:p-12 bg-zinc-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/90 gap-3">
          <Search className="w-5 h-5 text-amber-700 dark:text-amber-500 flex-shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、经济学词条（如：分工、看不见的手、方差、LTV、无形资产）..."
            className="flex-1 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 text-zinc-500 text-[10px] font-mono rounded">
            <span>ESC</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              全部 ({filteredConcepts.length + searchResults.length})
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'concepts'
                  ? 'bg-amber-700 text-white font-bold'
                  : 'text-zinc-500 hover:text-amber-800 dark:hover:text-amber-400'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>经济学词典 ({filteredConcepts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              专题篇目 ({searchResults.length})
            </button>
          </div>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">点击即可直接跳转段落</span>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {/* 1. Economic Concepts Section */}
          {(activeTab === 'all' || activeTab === 'concepts') && filteredConcepts.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase font-mono tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>经济学概念与核心词条 / ECONOMIC GLOSSARY</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {filteredConcepts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectArticle(c.articleId, c.targetSection);
                      onClose();
                    }}
                    className="p-3 bg-stone-50/80 dark:bg-zinc-800/60 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-amber-600/40 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                            {c.term}
                          </h4>
                          <span className="px-1.5 py-0.2 bg-stone-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono rounded">
                            {c.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {c.definition}
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-mono mt-1">
                          💡 医美洞见：{c.keyTakeaway}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 font-mono flex-shrink-0">
                        <span>跳转段落</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>见于：{c.articleTitle}</span>
                      <span>{c.targetSection}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Matched Articles and Sections */}
          {(activeTab === 'all' || activeTab === 'articles') && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase font-mono tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>专栏篇目与段落索引 / EPISODE & PARAGRAPHS</span>
              </div>

              {searchResults.length === 0 && filteredConcepts.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm text-zinc-500 font-serif">未找到与 “{query}” 相关的章节或词条</p>
                  <p className="text-xs text-zinc-400">试试搜索：分工、斯密、价值、方差、LTV、获客成本</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectArticle(res.article.id, res.matchedHeading);
                        onClose();
                      }}
                      className="p-3 bg-white dark:bg-zinc-800/40 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-mono font-bold rounded">
                              EP.{String(res.article.id).padStart(2, '0')}
                            </span>
                            <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-zinc-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                              {res.article.title}
                            </h4>
                          </div>
                          {res.matchedHeading && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                              <Hash className="w-3 h-3" />
                              <span>{res.matchedHeading}</span>
                            </div>
                          )}
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {res.snippet}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>超级医美 | 医美产业经济学 全文索引引擎</span>
          <div className="flex items-center gap-2">
            <span>支持快捷键 <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">⌘</kbd> <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">K</kbd> 随时唤起</span>
          </div>
        </div>
      </div>
    </div>
  );
}
