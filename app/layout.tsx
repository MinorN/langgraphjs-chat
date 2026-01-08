import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'langgraph.js chat helper',
  description: '使用 langgraph.js 构建的聊天助手应用。',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
