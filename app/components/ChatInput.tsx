'use client'

import { useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void // 发送消息的回调函数
  disabled?: boolean // 是否禁用输入(发送中时禁用)
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('') // 输入框内容
  const textareaRef = useRef<HTMLTextAreaElement>(null) // 文本框引用

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight + 2, 120) + 'px'
    }
  }
  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustTextareaHeight()
  }

  return (
    <>
      <div className="w-full p-8 border-t border-divider">
        <div className="flex items-center gap-4">
          <textarea
            value={input}
            ref={textareaRef}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="border-b-2 border-alchemy-gold outline-none italic resize-none w-full custom-scrollbar text-lg"
            rows={1}
            disabled={disabled}
            style={{ maxHeight: '120px' }}
            placeholder="输入你的消息... (支持 Shift+Enter 换行)"
          ></textarea>
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`relative w-10 h-10 flex items-center justify-center transition-all duration-500 group opacity-50 grayscale cursor-not-allowed ${
              input.trim() && !disabled
                ? 'opacity-100 grayscale-0 cursor-pointer'
                : ''
            }`}
          >
            <div className="absolute inset-0 border-2 border-dashed border-[#b8860b]/40 rounded-full animate-[spin_10s_linear_infinite] group-hover:border-[#b8860b] group-hover:animate-[spin_4s_linear_infinite]"></div>
            <div className="absolute inset-1.5 rounded-full border-2 border-[#b8860b] bg-[#8b0000] shadow-[0_0_15px_rgba(139,0,0,0.3)] flex items-center justify-center transition-all">
              <div className="text-[#f4e4bc] font-bold text-sm transition-all">
                <span className="relative z-10">印</span>
              </div>
              <div className="absolute inset-1 border border-[#f4e4bc]/10 rounded-full"></div>
            </div>
            <div className="absolute -inset-1 bg-[#ffd700]/20 rounded-full blur-xl opacity-0 transition-opacity duration-500"></div>
          </button>
        </div>
      </div>
    </>
  )
}
