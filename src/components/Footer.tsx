import React, { useState } from 'react';
import { Copy, Check, MessageSquare, ExternalLink, Mail, Rss } from 'lucide-react';

interface FooterProps {
  onOpenSubscribe?: () => void;
  onReplaySplash?: () => void;
}

export function Footer({ onOpenSubscribe, onReplaySplash }: FooterProps) {
  const [copied, setCopied] = useState(false);
  const wechatId = 'sooogooo';

  const handleCopyWeChat = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(wechatId);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = wechatId;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <footer id="app-footer" className="w-full border-t border-zinc-200 dark:border-zinc-800 mt-16 py-12 pb-28 lg:pb-14 px-4 sm:px-6 lg:px-16 text-xs text-zinc-500 dark:text-zinc-400 font-sans bg-stone-50/60 dark:bg-zinc-950/80">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Author Contact & Channels Banner Card */}
        <div 
          id="author-channels-card"
          className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          {/* Text & Contact Details */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 text-[11px] font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>作者交流与官方专栏</span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                连接作者 · 于意云
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-md">
                欢迎医美从业者、机构管理者、产业投资人及学术读者深度探讨行业前沿观察、商业模型与经济学洞见。
              </p>
            </div>

            {/* WeChat ID and Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-mono text-xs">
                <span className="text-zinc-400 dark:text-zinc-500">微信号:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{wechatId}</span>
              </div>

              <button
                id="copy-wechat-btn"
                onClick={handleCopyWeChat}
                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white active:scale-95 text-white dark:text-zinc-900 text-xs font-medium rounded-lg transition-all shadow-xs cursor-pointer"
                title="复制微信号"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span className="text-emerald-300 dark:text-emerald-600 font-bold">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制微信号</span>
                  </>
                )}
              </button>

              {onOpenSubscribe && (
                <button
                  id="open-subscribe-btn"
                  onClick={onOpenSubscribe}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-600/30 active:scale-95 text-xs font-medium rounded-lg transition-all shadow-xs cursor-pointer"
                  title="订阅专栏邮件与 RSS 推送"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>订阅邮件 & RSS</span>
                </button>
              )}
            </div>
          </div>

          {/* Dual Compact QR Codes Box: Personal WeChat & Official Account */}
          <div className="flex items-center justify-center gap-4 sm:gap-5 flex-shrink-0">
            
            {/* 1. Author Personal WeChat QR */}
            <div className="flex flex-col items-center">
              <div 
                id="wechat-personal-qr-box"
                className="p-1.5 bg-white border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xs overflow-hidden"
              >
                <img 
                  src="https://amcology.talk.stemcell.gold/talk-images/wechat-code.jpg" 
                  alt="作者微信二维码"
                  className="w-20 h-20 sm:w-[88px] sm:h-[88px] object-cover rounded-sm select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Descriptive Small Label */}
              <div className="mt-1.5 text-center space-y-0.5">
                <span className="inline-block px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded">
                  作者微信
                </span>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono scale-90 origin-top">
                  扫码添加好友
                </p>
              </div>
            </div>

            {/* Subtle Vertical Divider */}
            <div className="h-16 w-[1px] bg-zinc-200/80 dark:bg-zinc-800 my-auto"></div>

            {/* 2. Author Official Account QR */}
            <div className="flex flex-col items-center">
              <div 
                id="wechat-official-qr-box"
                className="p-1.5 bg-white border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xs overflow-hidden"
              >
                <img 
                  src="https://amcology.talk.stemcell.gold/talk-images/wechatpub-code.jpg" 
                  alt="作者微信公众号二维码"
                  className="w-20 h-20 sm:w-[88px] sm:h-[88px] object-cover rounded-sm select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Descriptive Small Label */}
              <div className="mt-1.5 text-center space-y-0.5">
                <span className="inline-block px-1.5 py-0.5 bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold rounded">
                  微信公众号
                </span>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono scale-90 origin-top">
                  扫码关注专栏
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Metadata & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-wider">医美国富论 | 医美产业经济学</span>
            </div>
            <p className="text-zinc-400 dark:text-zinc-500 text-[11px] leading-relaxed">
              用于公众健康教育与产业经济观察，不构成医疗建议，不替代面诊。
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-[11px]">
              版权所有 © 2026 于意云 ｜ All Rights Reserved
            </p>
          </div>

          <div className="space-y-1.5 text-center md:text-right text-[11px]">
            <div className="flex items-center justify-center md:justify-end gap-3">
              <a
                id="icp-beian-link"
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1 hover:underline"
              >
                <span>京ICP备20009050号-3</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>

              {onReplaySplash && (
                <button
                  onClick={onReplaySplash}
                  className="text-amber-700 dark:text-amber-400 hover:underline cursor-pointer transition-colors"
                >
                  重温开屏动效
                </button>
              )}
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              作者 于意云 ｜ @sooogooo（微信 / 公众号 / X / Facebook）
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              电子邮箱：
              <a
                id="email-contact-link"
                href="mailto:sooogooo@gmail.com"
                className="text-zinc-700 dark:text-zinc-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors hover:underline font-mono"
              >
                sooogooo@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
