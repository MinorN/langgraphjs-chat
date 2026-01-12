import { ChatOpenAI } from '@langchain/openai'

export function createModel(modelId?: string): ChatOpenAI {
  const modelName = modelId || process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo'
  console.log('创建模型实例:', modelName)
  return new ChatOpenAI({
    model: modelName,
    temperature: 0.7,
    streaming: true, // 启用流式响应
  })
}
