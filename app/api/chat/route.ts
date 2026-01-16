import '@app/utils/loadEnv'
import { NextRequest, NextResponse } from 'next/server'
import {
  HumanMessage,
  mapStoredMessageToChatMessage,
} from '@langchain/core/messages'
import { randomUUID } from 'crypto'
import { getApp } from '@app/agent'
import { Message } from '@app/components/MessageBuble'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, thread_id, tools, model } = body

    if (!message) {
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
      })
    }

    let userMessage

    if (typeof message === 'string') {
      userMessage = new HumanMessage(message)
    } else if (Array.isArray(message)) {
      userMessage = new HumanMessage({
        content: message,
      })
    } else if (typeof message === 'object' && message !== null) {
      try {
        userMessage = mapStoredMessageToChatMessage(message)
      } catch {
        const content = message.content || message.kwargs?.content
        if (content) {
          userMessage = new HumanMessage(content)
        } else {
          return NextResponse.json(
            {
              error: '无效的消息格式',
              detail: '消息对象缺少 content 字段',
            },
            { status: 400 }
          )
        }
      }
    } else {
      return NextResponse.json({ error: '无效的消息格式' }, { status: 400 })
    }

    const threadId =
      typeof thread_id === 'string' && thread_id ? thread_id : randomUUID()
    const threadConfig = { configurable: { thread_id: threadId } }

    const steam = new ReadableStream({
      async start(controller) {
        try {
          const app = await getApp(model, tools)

          let completeMessage = null

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
              completeMessage = chunk
            } else if (event.event === 'on_chat_model_end') {
              // 开始调用工具
              const output = event.data?.output
              if (output?.tool_calls && output.tool_calls.length > 0) {
                const toolData =
                  JSON.stringify({
                    type: 'tool_calls',
                    tool_calls: output.tool_calls,
                  }) + '\n'
                controller.enqueue(new TextEncoder().encode(toolData))
              }
            } else if (event.event === 'on_tool_end') {
              const toolCallData =
                JSON.stringify({
                  type: 'tool_result',
                  name: event.name,
                  data: event.data,
                }) + '\n'
              controller.enqueue(new TextEncoder().encode(toolCallData))
            } else if (event.event === 'on_tool_error') {
              const toolErrorData =
                JSON.stringify({
                  type: 'tool_error',
                  name: event.name,
                  data: event.data,
                }) + '\n'
              controller.enqueue(new TextEncoder().encode(toolErrorData))
            }
          }

          const finalState = await app.getState(threadConfig)
          const allMessages = finalState?.values?.messages || []
          const serializedMessage = completeMessage
            ? JSON.parse(JSON.stringify(completeMessage))
            : null
          const serializedMessages = allMessages.map((msg: any) =>
            JSON.parse(JSON.stringify(msg))
          )

          const endData =
            JSON.stringify({
              type: 'end',
              status: 'success',
              thread_id: threadId,
              message: serializedMessage, // 发送序列化的消息对象
              messages: serializedMessages, // 发送所有序列化的消息历史
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

      const messages = state?.values?.messages || []
      const serializedMessages = messages.map((msg: any) =>
        JSON.parse(JSON.stringify(msg))
      )
      return NextResponse.json({
        thread_id,
        history: serializedMessages,
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
