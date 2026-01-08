'use client'
import { Loader2 } from 'lucide-react'

export default function LoadingIndicator() {
  return (
    <>
      <div className="flex flex-col items-start animate-pulse">
        <div className="bg-transparent italic text-alchemy-gold flex items-center gap-2 text-sm">
          <Loader2 size={14} className="animate-spin" />
          <span>正在调配真理之泉...</span>
        </div>
      </div>
    </>
  )
}
