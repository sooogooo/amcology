import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Send, ThumbsUp, Sparkles, User, ShieldCheck, Tag, HelpCircle, Check, Reply, Flame, Clock, AlertCircle } from 'lucide-react';
import { Article } from '../data/articles';

interface Comment {
  id: string;
  articleId: number;
  authorName: string;
  role: '机构主理人' | '临床医师' | '医疗投资人' | '运营主管' | '高阶求美者';
  content: string;
  createdAt: string;
  likes: number;
  isFeatured?: boolean;
}

interface DiscussionSectionProps {
  article: Article;
}

const SUBMIT_COOLDOWN_SEC = 15;
const LAST_SUBMIT_KEY = 'amcology_discussion_last_ts';
const LAST_SUBMIT_TEXT_KEY = 'amcology_discussion_last_content';

// Curated provocative discussion prompts for each article
const DISCUSSION_PROMPTS: Record<number, { prompt: string; background: string }> = {
  1: {
    prompt: '深度流水线化是否会削弱求美者对主诊医生的情感依赖？如何平衡“标准化交付”与“个人IP信任”？',
    background: '《国富论》指出分工提升效率，但医疗交付具有强情感属性。'
  },
  2: {
    prompt: '机构规模扩大后，如何防范“管理科层膨胀”蚕食掉分工带来的边际效率提升？',
    background: '当机构跨越 5 家连锁时，总部协同成本与信息衰减往往成为新瓶颈。'
  },
  3: {
    prompt: '光电、注射与整外三大板块中，哪个业务线最先会诞生全国性的标准化超级平台？',
    background: '三大品类的分工深化度、设备依赖性与医生手艺依赖各不相同。'
  },
  4: {
    prompt: '在公域低价破冰的内卷环境下，中小品质机构如何设计自己的“高品质信号发送机制”？',
    background: '阿克洛夫柠檬模型表明，当消费者无法甄别质量时，平均定价将逼退优质供给。'
  },
  5: {
    prompt: '作为典型的信任品（Credence Goods），机构应如何把“看不见的安全风控”转化为可感知的信誉资产？',
    background: '消费者即使在治疗结束后也难以精准评估医生的解剖规避与院感控制。'
  },
  6: {
    prompt: '取消现场咨询师、实行“医咨一体化”，在当前商业环境下究竟是乌托邦还是必然趋势？',
    background: '探讨委托-代理冲突在不同客单价和机构类型中的实际解法。'
  },
  7: {
    prompt: '公域投流 CAC 持续攀升的今天，将营销预算转向私域分工和交付 SOP 的临界点在哪里？',
    background: '单次买量模型与复利留存模型在第 2~3 年的现金流分水岭探讨。'
  },
  8: {
    prompt: '上游药械厂商的超额利润会否随着国产品牌崛起和集采预期被逐步拉平？定价权会向谁转移？',
    background: '分析垄断竞争格局演进与中游渠道话语权的变化。'
  },
  9: {
    prompt: '十万级高定抗衰项目中，“审美溢价”与“医生解剖人力”应占多大比重才具备长线复购生命力？',
    background: '解构高客单项目的价值构成与消费者心理账户。'
  },
  10: {
    prompt: '科斯交易费用视角下，医美机构何时应该自建麻醉与检验中心，何时应该接入共享医疗网络？',
    background: '探索企业组织边界与区域协同网络的动态平衡。'
  },
  11: {
    prompt: '重资产大院模式与轻资产社区抗衰连锁，在未来 3-5 年的资本周期中谁能跑出更优的 ROIC？',
    background: '重资产抗周期能力与轻资产复制速度的资本博弈。'
  },
  12: {
    prompt: '生成式 AI 与精准 3D 骨相模拟，将率先替代咨询面诊环节，还是赋能医生实现超级个体化？',
    background: '探讨技术奇点对医美生产力与分配关系的重塑。'
  }
};

const ROLES: Comment['role'][] = ['机构主理人', '临床医师', '医疗投资人', '运营主管', '高阶求美者'];

export function DiscussionSection({ article }: DiscussionSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Comment['role']>('机构主理人');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'likes' | 'newest'>('likes');

  // Load real user comments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`med_econ_comments_${article.id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Comment[];
        // Filter out any previous fictional/mock comments if present
        const realComments = parsed.filter(c => !c.id.startsWith('c1-') && !c.id.startsWith('c4-') && !c.id.startsWith('c9-'));
        setComments(realComments);
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    }
  }, [article.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedContent = newComment.trim();
    if (!trimmedContent) return;

    // 1. Anti-spam / Duplicate Content check in local storage & existing comments
    try {
      const lastTsStr = localStorage.getItem(LAST_SUBMIT_KEY);
      const lastContent = localStorage.getItem(LAST_SUBMIT_TEXT_KEY);

      if (lastTsStr) {
        const lastTs = parseInt(lastTsStr, 10);
        const elapsedSec = (Date.now() - lastTs) / 1000;
        if (elapsedSec < SUBMIT_COOLDOWN_SEC) {
          const remain = Math.ceil(SUBMIT_COOLDOWN_SEC - elapsedSec);
          setSubmitError(`发言过于频繁：请稍候 ${remain} 秒后再发表新的深度思考，防止重复提交。`);
          return;
        }
      }

      if (lastContent && lastContent.trim() === trimmedContent) {
        setSubmitError('检测到重复提交：您刚刚已发表过相同内容的见解。');
        return;
      }

      const duplicateInArticle = comments.some(c => c.content.trim() === trimmedContent);
      if (duplicateInArticle) {
        setSubmitError('本章节已存在相同表述的探讨，请结合实际场景补充更多一手洞察。');
        return;
      }
    } catch (err) {
      console.warn('Storage check error', err);
    }

    const name = authorName.trim() || '匿名从业者';
    const commentItem: Comment = {
      id: `user-${Date.now()}`,
      articleId: article.id,
      authorName: name,
      role: selectedRole,
      content: trimmedContent,
      createdAt: '刚刚',
      likes: 1,
    };

    const updated = [commentItem, ...comments];
    setComments(updated);
    setNewComment('');
    setHasSubmitted(true);
    setSubmitError(null);

    try {
      localStorage.setItem(`med_econ_comments_${article.id}`, JSON.stringify(updated));
      localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
      localStorage.setItem(LAST_SUBMIT_TEXT_KEY, trimmedContent);
    } catch (err) {
      console.warn('Storage error', err);
    }

    setTimeout(() => setHasSubmitted(false), 4000);
  };

  const handleLike = (id: string) => {
    const updated = comments.map(c => {
      if (c.id === id) return { ...c, likes: c.likes + 1 };
      return c;
    });
    setComments(updated);
    try {
      localStorage.setItem(`med_econ_comments_${article.id}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Storage error', err);
    }
  };

  const currentPrompt = DISCUSSION_PROMPTS[article.id] || {
    prompt: '本讲核心论点在实际商业交付中面临哪些落地挑战与机遇？',
    background: '欢迎从机构管理、临床一线或求美者视角分享真实观察与思考。'
  };

  // Sort comments by likes or newest
  const sortedComments = useMemo(() => {
    const copy = [...comments];
    if (sortBy === 'likes') {
      return copy.sort((a, b) => b.likes - a.likes || b.id.localeCompare(a.id));
    }
    return copy.sort((a, b) => b.id.localeCompare(a.id));
  }, [comments, sortBy]);

  const filteredComments = filterRole === 'all' 
    ? sortedComments 
    : sortedComments.filter(c => c.role === filterRole);

  return (
    <section 
      id="discussion-section" 
      className="my-8 sm:my-14 bg-stone-50/90 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xs transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4 sm:pb-6 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[10px] sm:text-xs font-mono font-bold rounded-full mb-1.5 sm:mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>DISCUSSION & INSIGHTS</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-serif font-black text-zinc-900 dark:text-zinc-100">
            读者思辨与产业探讨
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
            探讨《第 {article.id} 讲》中的核心经济学逻辑在商业实践中的推演
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl self-start sm:self-auto text-xs font-mono">
          <span className="text-zinc-500 text-[11px] sm:text-xs">已收录：</span>
          <span className="font-bold text-amber-700 dark:text-amber-400 text-[11px] sm:text-xs">{comments.length} 篇</span>
        </div>
      </div>

      {/* Featured Debatable Topic Prompt Card */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-l-amber-600 border-y border-r border-zinc-200/80 dark:border-zinc-800 rounded-r-xl sm:rounded-r-2xl space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-amber-900 dark:text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>本期核心思辨议题 / CORE PROMPT</span>
        </div>
        <h3 className="text-sm sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          “{currentPrompt.prompt}”
        </h3>
        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
          {currentPrompt.background}
        </p>
      </div>

      {/* Input Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 sm:mb-10 space-y-3.5 sm:space-y-4 bg-white dark:bg-zinc-850 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 flex-nowrap -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
            <span className="text-[11px] font-mono text-zinc-400 flex-shrink-0">视角：</span>
            {ROLES.map(role => (
              <button
                type="button"
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  selectedRole === role
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="署名 / 机构职务 (选填)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-stone-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-600"
          />
        </div>

        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="分享您在机构运营、临床实操或产业投资中的一手观察与思辨见解..."
          className="w-full text-xs sm:text-sm p-3 sm:p-3.5 bg-stone-50/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 leading-relaxed resize-none"
        />

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] sm:text-[11px] text-zinc-400 truncate max-w-[180px] sm:max-w-none">
            理性探讨，沉淀真知灼见
          </span>

          <button
            type="submit"
            disabled={!newComment.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>发表见解</span>
          </button>
        </div>

        {submitError && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/80 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {hasSubmitted && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>见解已成功发表并在本文底部收录！感谢您为医美产业沉淀真知。</span>
          </div>
        )}
      </form>

      {/* Filter and Sorting Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200/80 dark:border-zinc-800 text-xs font-mono">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-zinc-400 flex-shrink-0">视角：</span>
          <button
            onClick={() => setFilterRole('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
              filterRole === 'all'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            全部 ({comments.length})
          </button>
          {ROLES.map(r => {
            const count = comments.filter(c => c.role === r).length;
            if (count === 0) return null;
            return (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
                  filterRole === r
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {r} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Controls (Likes vs Newest) */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-stone-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setSortBy('likes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              sortBy === 'likes'
                ? 'bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-400 font-bold shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="按获得赞同与启发数优先排序"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>按点赞数优先</span>
          </button>

          <button
            onClick={() => setSortBy('newest')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              sortBy === 'newest'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="按时间倒序查看最新探讨"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>按最新发表</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-850 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-mono">
            暂无留言探讨，欢迎率先发表您对本讲产业逻辑的思考与一手见解！
          </div>
        ) : (
          filteredComments.map(comment => (
            <div 
              key={comment.id}
              className={`p-5 rounded-2xl border transition-all ${
                comment.isFeatured
                  ? 'bg-white dark:bg-zinc-850 border-amber-600/40 shadow-xs'
                  : 'bg-white dark:bg-zinc-850 border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 text-xs font-bold">
                    {comment.authorName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {comment.authorName}
                      </span>
                      <span className="px-2 py-0.5 bg-stone-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono rounded-md">
                        {comment.role}
                      </span>
                      {comment.isFeatured && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[10px] font-mono font-bold rounded">
                          精选从业者见解
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-zinc-400">
                  {comment.createdAt}
                </span>
              </div>

              {/* Comment Content */}
              <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans pl-8">
                {comment.content}
              </p>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 pl-8 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span>医美产业经济学读者思辨</span>
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-zinc-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>有启发 ({comment.likes})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </section>
  );
}
