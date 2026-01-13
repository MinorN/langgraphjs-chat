'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import ToolSelector, { Tool } from './ToolSelector'
import ModelSelector, { Model } from './ModelSelector'
import { Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

interface ChatInputProps {
  onSend: (
    message: string,
    selectedTools?: string[],
    selectedModel?: string,
    images?: File[]
  ) => void // 发送消息的回调函数
  disabled?: boolean // 是否禁用输入(发送中时禁用)
  availableTools?: Tool[] // 可用工具列表
  availableModels?: Model[]
  currentModel?: string // 当前选中的模型
  onModelChange?: (modelId: string) => void // 模型切换回调
}

export interface ChatInputHandle {
  setInput: (value: string) => void
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  (
    {
      onSend,
      disabled = false,
      availableModels = [],
      availableTools = [],
      currentModel = '',
      onModelChange,
    },
    ref
  ) => {
    const [input, setInput] = useState('') // 输入框内容
    const [selectedTools, setSelectedTools] = useState<string[]>([]) // 选中的工具
    const [uploadedImages, setUploadedImages] = useState<File[]>([]) // 上传的图片文件
    const [imagePreviews, setImagePreviews] = useState<string[]>([]) // 图片预览 URL 列表
    const textareaRef = useRef<HTMLTextAreaElement>(null) // 文本框引用
    const fileInputRef = useRef<HTMLInputElement>(null) // 文件输入引用

    // 动态计算输入框高度
    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight + 2, 120) + 'px'
      }
    }

    // 切换工具选择
    const handleToolToggle = (toolId: string) => {
      setSelectedTools((pre) =>
        pre.includes(toolId)
          ? pre.filter((id) => id !== toolId)
          : [...pre, toolId]
      )
    }

    // 发送消息
    const handleSend = () => {
      if ((!input.trim() && uploadedImages.length === 0) || disabled) return
      onSend(
        input,
        selectedTools.length > 0 ? selectedTools : undefined,
        currentModel,
        uploadedImages.length > 0 ? uploadedImages : undefined
      )
      clearImages()
      setInput('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
    }

    // 打开文件上传
    const handleAddClick = () => {
      fileInputRef.current?.click()
    }
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const imageFiles = files.filter((file) => file.type.startsWith('image/'))

      if (imageFiles.length > 0) {
        setUploadedImages((prev) => [...prev, ...imageFiles])

        // 创建预览 URL
        const newPreviews = imageFiles.map((file) => URL.createObjectURL(file))
        setImagePreviews((prev) => [...prev, ...newPreviews])
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const removeImage = (index: number) => {
      URL.revokeObjectURL(imagePreviews[index])
      setUploadedImages((prev) => prev.filter((_, i) => i !== index))
      setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    }

    // 清空所有图片
    const clearImages = () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setUploadedImages([])
      setImagePreviews([])
    }

    useEffect(() => {
      adjustTextareaHeight()
    }, [input])

    useEffect(() => {
      return () => {
        imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      }
    }, [imagePreviews])

    return (
      <>
        <div className="w-full p-6 border-t border-divider bg-paper-dark/60 rounded-br-lg">
          {imagePreviews.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="w-16 h-16 relative group">
                  <Image
                    src={preview}
                    alt={`preview-${index}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    className="absolute -top-1.5 -right-1.5 bg-[#8b0000] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center mb-3.5 gap-2">
            {availableModels.length > 0 && onModelChange && (
              <ModelSelector
                selectedModel={currentModel}
                onModelChange={onModelChange}
                models={availableModels}
              />
            )}
            {availableTools.length > 0 && (
              <ToolSelector
                tools={availableTools}
                selectedTools={selectedTools}
                onToolToggle={handleToolToggle}
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            ></input>
            <button
              className="p-2 text-alchemy-gold hover:bg-alchemy-gold hover:text-paper rounded-full transition-all relative cursor-pointer"
              onClick={handleAddClick}
            >
              <ImageIcon className="w-5 h-5" />
              <span
                className={`absolute top-0 right-0 bg-seal-red text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce ${
                  uploadedImages.length === 0 ? 'hidden' : ''
                }`}
              >
                {uploadedImages.length}
              </span>
            </button>
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
)

ChatInput.displayName = 'ChatInput'
