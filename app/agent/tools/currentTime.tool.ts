import { z } from 'zod'
import { ToolConfig } from '../types/tool.types'
import dayjs from 'dayjs'

export const currentTimeTool: ToolConfig = {
  name: 'current_time',
  description: '获取当前时间和日期',
  enabled: true,
  schema: z.object({}),
  handler: async () => {
    const now = dayjs()
    return `当前时间: ${now.format('YYYY年MM月DD日 HH:mm:ss')}`
  },
}
