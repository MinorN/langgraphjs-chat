import { z } from 'zod'

// 工具配置接口
export interface ToolConfig<T = Record<string, unknown>> {
  name: string
  description: string
  enabled: boolean
  schema: z.ZodSchema
  handler: (params?: T) => Promise<string> | string
  options?: Record<string, unknown>
}

export interface ToolCall {
  id: string
  name: string
  args: Record<string, any>
  output?: any
  error?: string
}
