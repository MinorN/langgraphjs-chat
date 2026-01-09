'use client'
import { Compass, ShieldCheck, BookOpen, Flame } from 'lucide-react'
export default function EmptyState() {
  const cards = [
    {
      title: '探索方位',
      tip: '询问元素转换或秘教历史',
      icon: <Compass className="w-5 h-5 text-alchemy-gold" />,
    },
    {
      title: '等价交换',
      tip: '尊重古老知识的逻辑与边界',
      icon: <ShieldCheck className="w-5 h-5 text-alchemy-gold" />,
    },
    {
      title: '记录真理',
      tip: '所有灵感都将被打字机封存',
      icon: <BookOpen className="w-5 h-5 text-alchemy-gold" />,
    },
  ]
  return (
    <div className="h-full p-10 text-center">
      <div className="max-w-xl mx-auto">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-alchemy-gold/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-seal-red border-4 border-alchemy-gold rounded-full flex items-center justify-center shadow-2xl text-[#ffd700]">
            <Flame className="animate-bounce w-12 h-12" />
          </div>
        </div>
        <div className="text-4xl font-bold tracking-[0.3em] uppercase italic text-text-main">
          新的研究契约
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-alchemy-gold to-transparent w-full my-6"></div>
        <div className="text-text-tip italic leading-relaxed">
          你正站在真理的门廊前。每一段炼金术的旅程都始于对未知的敬畏与对等价交换原则的践行。在此卷轴上留下的每一笔墨迹，都将引导星辰轨迹的变化。
        </div>
        <div className="flex items-center justify-center mt-8 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex items-center flex-col py-4 px-12 border border-alchemy-gold/20 rounded-sm bg-paper-dark/50 gap-2"
            >
              <div>{card.icon}</div>
              <div className="text-xs font-bold tracking-widest uppercase">
                {card.title}
              </div>
              <div className="text-[10px] text-text-tip italic">{card.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
