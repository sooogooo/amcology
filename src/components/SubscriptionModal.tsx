import React, { useState } from 'react';
import { X, Mail, Rss, Check, Sparkles, Bell, ArrowRight, Copy, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { articles } from '../data/articles';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'instant' | 'digest'>('instant');
  const [role, setRole] = useState('机构主理人');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCopiedRss, setIsCopiedRss] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      const existingSubs = JSON.parse(localStorage.getItem('med_econ_subscriptions') || '[]');
      existingSubs.push({
        email,
        frequency,
        role,
        date: new Date().toISOString()
      });
      localStorage.setItem('med_econ_subscriptions', JSON.stringify(existingSubs));
    } catch {
      // ignore
    }

    setIsSubmitted(true);
  };

  // Generate RSS Feed XML
  const generateRSSFeed = () => {
    const siteUrl = window.location.origin;
    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>医美产业经济学 · 于意云</title>
  <link>${siteUrl}</link>
  <description>以《国富论》分工演进、信息契约与边际成本为底层逻辑的医美产业深度剖析专栏</description>
  <language>zh-CN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
  ${articles.map(art => `
  <item>
    <title><![CDATA[第${art.id}讲 ${art.title}]]></title>
    <link>${siteUrl}/#article-${art.id}</link>
    <guid isPermaLink="false">med-econ-art-${art.id}</guid>
    <description><![CDATA[【${art.moduleName}】${art.quote}]]></description>
    <category>${art.moduleName}</category>
    <author>于意云</author>
  </item>`).join('\n  ')}
</channel>
</rss>`;

    return rssXml;
  };

  const handleCopyRssUrl = () => {
    const rssUrl = `${window.location.origin}/rss.xml`;
    navigator.clipboard.writeText(rssUrl).then(() => {
      setIsCopiedRss(true);
      setTimeout(() => setIsCopiedRss(false), 3000);
    });
  };

  const handleDownloadRss = () => {
    const rssContent = generateRSSFeed();
    const blob = new Blob([rssContent], { type: 'application/rss+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'med-aesthetics-economics-rss.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded-2xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-black text-zinc-900 dark:text-zinc-100">
              专栏订阅与推送 · Email & RSS
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              第一时间获取最新长文更新、产业模型测算与学术合集
            </p>
          </div>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              专栏订阅成功！
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
              我们已将您的订阅邮箱 <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{email}</span> 录入通知名单，每当有新专题发表或重要数据模型更新时将第一时间给您推送邮件。
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-xl cursor-pointer"
            >
              完成并返回阅读
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Email Form */}
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1.5 font-bold uppercase">
                  您的常用电子邮箱 / EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="your-name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Frequency Preference */}
              <div>
                <label className="block text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1.5 font-bold uppercase">
                  推送频率偏好 / CADENCE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency('instant')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      frequency === 'instant'
                        ? 'border-amber-600 bg-amber-500/10 text-zinc-900 dark:text-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold">单篇即时推送</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">每逢新讲义发表即发</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFrequency('digest')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      frequency === 'digest'
                        ? 'border-amber-600 bg-amber-500/10 text-zinc-900 dark:text-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold">月度精编合集</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">每月一次精编综述</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                <span>确认免费订阅专栏更新</span>
              </button>
            </form>

            {/* RSS Feed Section */}
            <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  <Rss className="w-3.5 h-3.5 text-amber-600" />
                  <span>RSS 订阅源 / RSS 2.0 FEED</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">NetNewsWire / Feedly</span>
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                <span className="truncate">{window.location.origin}/rss.xml</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={handleCopyRssUrl}
                    className="p-1.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="复制 RSS 订阅链接"
                  >
                    {isCopiedRss ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleDownloadRss}
                    className="p-1.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="下载 RSS XML 文件"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* WeChat Channels & QR Codes */}
            <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800">
              <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center justify-between">
                <span>或直接扫码关注微信官方专栏</span>
                <span className="text-[10px] text-zinc-400 font-normal">微信长按 / 扫码</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl">
                <div className="flex flex-col items-center text-center p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 rounded-xl">
                  <img 
                    src="https://amcology.talk.stemcell.gold/talk-images/wechatpub-code.jpg" 
                    alt="微信公众号" 
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-md"
                    referrerPolicy="no-referrer"
                  />
                  <span className="mt-1.5 text-[11px] font-bold text-zinc-800 dark:text-zinc-200">微信公众号</span>
                  <span className="text-[9px] text-zinc-400 font-mono">第一时间追踪文章</span>
                </div>

                <div className="flex flex-col items-center text-center p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 rounded-xl">
                  <img 
                    src="https://amcology.talk.stemcell.gold/talk-images/wechat-code.jpg" 
                    alt="作者微信" 
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-md"
                    referrerPolicy="no-referrer"
                  />
                  <span className="mt-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-400">作者微信</span>
                  <span className="text-[9px] text-zinc-400 font-mono">添加作者深度交流</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>无垃圾广告 · 随时可退订 · 尊重从业者隐私</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
