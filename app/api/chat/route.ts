import '@app/utils/loadEnv'
import { NextRequest, NextResponse } from 'next/server'
import { HumanMessage } from '@langchain/core/messages'
import { randomUUID } from 'crypto'
import { getApp } from '@app/agent'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let message: string
    let thread_id: string | undefined
    let tools: string[] | undefined
    let model: string | undefined
    const images: File[] = []

    if (contentType?.includes('multipart/form-data')) {
      // 有图片
      const formData = await request.formData()
      message = formData.get('message') as string
      thread_id = formData.get('thread_id') as string

      const toolsStr = formData.get('tools') as string
      if (toolsStr) {
        try {
          tools = JSON.parse(toolsStr)
        } catch (error) {
          console.error('解析 tools 字符串失败:', error)
        }
      }
      model = formData.get('model') as string
      let i = 0
      while (formData.get(`image_${i}`)) {
        images.push(formData.get(`image_${i}`) as File)
        i++
      }
    } else {
      // 没有上传图片
      const body = await request.json()
      message = body.message
      thread_id = body.thread_id
      tools = body.tools
      model = body.model
    }

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
      })
    }

    const userMessage = new HumanMessage(message)
    const threadId =
      typeof thread_id === 'string' && thread_id ? thread_id : randomUUID()
    const threadConfig = { configurable: { thread_id: threadId } }

    const steam = new ReadableStream({
      async start(controller) {
        try {
          const app = await getApp(model, tools)
          for await (const event of app.streamEvents(
            { messages: [userMessage] },
            { version: 'v2', ...threadConfig }
          )) {
            if (event.event === 'on_chat_model_stream') {
              const chunk = event.data?.chunk
              if (chunk?.content) {
                const data =
                  JSON.stringify({
                    type: 'chunk',
                    content: chunk.content,
                  }) + '\n'
                controller.enqueue(new TextEncoder().encode(data))
              }
            }
          }
          const endData =
            JSON.stringify({
              type: 'end',
              status: 'success',
              thread_id: threadId,
            }) + '\n'
          controller.enqueue(new TextEncoder().encode(endData))
          controller.close()
        } catch (error) {
          console.error('流式聊天错误:', error)
          const errorData =
            JSON.stringify({
              type: 'end',
              status: 'error',
              message: '聊天过程中发生错误',
            }) + '\n'
          controller.enqueue(new TextEncoder().encode(errorData))
          controller.close()
        }
      },
    })
    return new Response(steam, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('聊天 API 错误:', error)
    return NextResponse.json(
      {
        error: '服务器内部错误',
        response: '抱歉，处理你的请求时出现了问题。请稍后重试。',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // 判断是否为历史记录请求
  const { searchParams } = new URL(request.url)
  const thread_id = searchParams.get('thread_id')
  if (thread_id) {
    try {
      // 获取应用实例
      const app = await getApp()

      // 通过graph.getState获取历史
      const state = await app.getState({
        configurable: { thread_id },
      })
      return NextResponse.json({
        thread_id,
        history: state?.values?.messages || [],
      })
    } catch (e) {
      return NextResponse.json(
        { error: '获取历史记录失败', detail: String(e) },
        { status: 500 }
      )
    }
  }
  // 默认返回API信息
  return NextResponse.json({
    message: 'LangGraph 聊天 API 正在运行',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat (流式响应)',
      history: 'GET /api/chat?thread_id=xxx (获取历史记录)',
    },
  })
}
