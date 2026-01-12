import { DynamicStructuredTool } from '@langchain/core/tools'
import { toolsConfig } from '../config/tools.config'
import type { ToolConfig } from '../types/tool.types'

export function convertToLangChainTool(
  toolsConfig: ToolConfig
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: toolsConfig.name,
    description: toolsConfig.description,
    schema: toolsConfig.schema,
    func: async (input: any) => {
      try {
        console.log(`调用工具: ${toolsConfig.name}，参数:`, input)
        const result = await toolsConfig.handler(input)
        console.log(`工具 ${toolsConfig.name} 返回结果:`, result)
        return result
      } catch (error) {
        console.error(`工具 ${toolsConfig.name} 执行失败:`, error)
        return `工具执行失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      }
    },
  })
}

export function createLangChainTools(
  toolIds?: string[]
): DynamicStructuredTool[] {
  if (!toolIds || toolIds.length === 0) {
    console.log('未选择任何工具')
    return []
  }

  const tools: DynamicStructuredTool[] = []
  for (const toolId of toolIds) {
    const toolConfig = toolsConfig[toolId]

    if (!toolConfig) {
      console.warn(`工具配置不存在: ${toolId}`)
      continue
    }

    if (!toolConfig.enabled) {
      console.warn(`工具未启用: ${toolId}`)
      continue
    }

    tools.push(convertToLangChainTool(toolConfig))
    console.log(`已添加工具: ${toolConfig.name}`)
  }

  console.log(`总共创建了 ${tools.length} 个工具`)
  return tools
}
