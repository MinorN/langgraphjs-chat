import { calcTool } from '../tools/calc.tool'
import { weatherTool } from '../tools/weather.tool'
import { currentTimeTool } from '../tools/currentTime.tool'
import { searchTool } from '../tools/search.tool'
import { ToolConfig } from '../types/tool.types'

export type { ToolConfig }

export const toolsConfig: Record<string, ToolConfig<any>> = {
  calculator: calcTool,
  weather: weatherTool,
  current_time: currentTimeTool,
  search: searchTool,
}

// 环境配置
export interface EnvironmentConfig {
  development: {
    enabledTools: string[]
    debugMode: boolean
  }
  production: {
    enabledTools: string[]
    debugMode: boolean
  }
  test: {
    enabledTools: string[]
    debugMode: boolean
  }
}

export const environmentConfig: EnvironmentConfig = {
  development: {
    enabledTools: ['calculator', 'weather', 'current_time', 'search'],
    debugMode: true,
  },
  production: {
    enabledTools: ['calculator', 'weather', 'current_time', 'search'],
    debugMode: false,
  },
  test: {
    enabledTools: ['calculator', 'current_time'],
    debugMode: true,
  },
}

// 获取当前环境配置
export function getCurrentEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development'
  return (
    environmentConfig[env as keyof EnvironmentConfig] ||
    environmentConfig.development
  )
}

// 获取启用的工具配置
export function getEnabledToolsConfig(): Record<string, ToolConfig> {
  const envConfig = getCurrentEnvironmentConfig()
  const enabledTools: Record<string, ToolConfig> = {}

  for (const toolName of envConfig.enabledTools) {
    const toolConfig = toolsConfig[toolName]
    if (toolConfig && toolConfig.enabled) {
      enabledTools[toolName] = toolConfig
    }
  }

  return enabledTools
}

export function validateToolConfig(config: ToolConfig): boolean {
  return !!(
    config.name &&
    config.description &&
    config.schema &&
    typeof config.handler === 'function' &&
    typeof config.enabled === 'boolean'
  )
}

// 动态添加工具配置
export function addToolConfig<T = Record<string, unknown>>(
  name: string,
  config: Omit<ToolConfig<T>, 'name'>
) {
  const fullConfig: ToolConfig<T> = {
    name,
    ...config,
  }

  if (!validateToolConfig(fullConfig)) {
    throw new Error(`Invalid tool configuration for ${name}`)
  }

  toolsConfig[name] = fullConfig as ToolConfig
}

// 禁用工具
export function disableTool(name: string) {
  if (toolsConfig[name]) {
    toolsConfig[name].enabled = false
  }
}

// 启用工具
export function enableTool(name: string) {
  if (toolsConfig[name]) {
    toolsConfig[name].enabled = true
  }
}
