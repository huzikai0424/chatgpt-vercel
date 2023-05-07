import type { ParsedEvent, ReconnectInterval } from "eventsource-parser"
import { createParser } from "eventsource-parser"
import type { ChatMessage, Model } from "~/types"
import { splitKeys, randomKey, fetchWithTimeout } from "~/utils"
import { defaultEnv } from "~/env"
import type { APIEvent } from "solid-start/api"
import { verifyToken, tokenMessages } from "~/utils/api"
type MODEL = "gpt-3.5-turbo" | "gpt-4"

export const config = {
  runtime: "edge",
  /**
   * https://vercel.com/docs/concepts/edge-network/regions#region-list
   * disable hongkong
   * only for vercel
   */
  regions: [
    "arn1",
    "bom1",
    "bru1",
    "cdg1",
    "cle1",
    "cpt1a",
    "dub1",
    "fra1",
    "gru1",
    "hnd1",
    "iad1",
    "icn1",
    "kix1",
    "lhr1",
    "pdx1",
    "sfo1",
    "sin1",
    "syd1"
  ]
}

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
const OPENAI_API_KEY_PLUS = process.env.OPENAI_API_KEY_PLUS || ""

export const baseURL =
  process.env.NO_GFW !== "false"
    ? defaultEnv.OPENAI_API_BASE_URL
    : (
        process.env.OPENAI_API_BASE_URL || defaultEnv.OPENAI_API_BASE_URL
      ).replace(/^https?:\/\//, "")

// + 作用是将字符串转换为数字
const timeout = isNaN(+process.env.TIMEOUT!)
  ? defaultEnv.TIMEOUT
  : +process.env.TIMEOUT!

export async function POST({ request }: APIEvent) {
  try {
    const body: {
      messages: ChatMessage[]
      temperature: number
      model: Model
      secretToken: string
    } = await request.json()
    const { messages, temperature, model, secretToken } = body
    if (!secretToken) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Token不存在，请在下方设置Token"
          }
        }),
        { status: 400 }
      )
    } else {
      try {
        const res = await verifyToken({
          token: secretToken
        })
        if (![0, 2].includes(res?.data?.status)) {
          return new Response(
            JSON.stringify({
              error: {
                message: "Token无效或额度已用完"
              }
            }),
            { status: 400 }
          )
        }
        if ((model as MODEL) === "gpt-4" && res?.data?.status === 2) {
          return new Response(
            JSON.stringify({
              error: {
                message: "余额不足，不能使用gpt4"
              }
            }),
            { status: 400 }
          )
        }
      } catch (error) {
        console.error(error)
        return new Response(
          JSON.stringify({
            error: {
              message: "Api 调用失败，请联系管理员。"
            }
          }),
          { status: 400 }
        )
      }
    }
    if (!messages) {
      return new Response(
        JSON.stringify({
          error: {
            message: "No input text."
          }
        }),
        { status: 400 }
      )
    }
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const rawRes = await fetchWithTimeout(
      `https://${baseURL}/v1/chat/completions`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            model === "gpt-3.5-turbo" ? OPENAI_API_KEY : OPENAI_API_KEY_PLUS
          }`
        },
        timeout,
        method: "POST",
        body: JSON.stringify({
          model: model,
          messages: messages.map(k => ({ role: k.role, content: k.content })),
          temperature,
          stream: true
        })
      }
    ).catch((err: { message: any }) => {
      return new Response(
        JSON.stringify({
          error: {
            message: err.message
          }
        }),
        { status: 500 }
      )
    })
    if (!rawRes.ok) {
      return new Response(rawRes.body, {
        status: rawRes.status,
        statusText: rawRes.statusText
      })
    }

    const stream = new ReadableStream({
      async start(controller) {
        let answer = ""
        const streamParser = async (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === "event") {
            const data = event.data
            if (data === "[DONE]") {
              const messages = [
                ...body.messages,
                {
                  role: "assistant",
                  content: answer
                }
              ]
              try {
                await tokenMessages({
                  messages,
                  model,
                  token: body.secretToken
                })
              } catch (error) {
                console.error(error)
              }
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const text = json.choices[0].delta?.content || ""
              answer += text
              const queue = encoder.encode(text)
              controller.enqueue(queue)
            } catch (e) {
              controller.error(e)
            }
          }
        }
        const parser = createParser(streamParser)
        for await (const chunk of rawRes.body as any) {
          parser.feed(decoder.decode(chunk))
        }
      }
    })

    return new Response(stream)
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: {
          message: err.message
        }
      }),
      { status: 400 }
    )
  }
}

type Billing = {
  key: string
  rate: number
  totalGranted: number
  totalUsed: number
  totalAvailable: number
}

export async function fetchBilling(key: string): Promise<Billing> {
  function formatDate(date: any) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  try {
    const now = new Date()
    const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // 设置API请求URL和请求头
    const urlSubscription =
      "https://api.openai.com/v1/dashboard/billing/subscription" // 查是否订阅
    const urlUsage = `https://api.openai.com/v1/dashboard/billing/usage?start_date=${formatDate(
      startDate
    )}&end_date=${formatDate(endDate)}` // 查使用量
    const headers = {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    }

    // 获取API限额
    const subscriptionData = await fetch(urlSubscription, { headers }).then(r =>
      r.json()
    )
    if (subscriptionData.error?.message)
      throw new Error(subscriptionData.error.message)
    const totalGranted = subscriptionData.hard_limit_usd
    // 获取已使用量
    const usageData = await fetch(urlUsage, { headers }).then(r => r.json())
    const totalUsed = usageData.total_usage / 100
    // 计算剩余额度
    const totalAvailable = totalGranted - totalUsed
    return {
      totalGranted,
      totalUsed,
      totalAvailable,
      key,
      rate: totalAvailable / totalGranted
    }
  } catch (e) {
    console.error(e)
    return {
      key,
      rate: 0,
      totalGranted: 0,
      totalUsed: 0,
      totalAvailable: 0
    }
  }
}

export async function genBillingsTable(billings: Billing[]) {
  const table = billings
    .sort((m, n) => (m.totalGranted === 0 ? -1 : n.rate - m.rate))
    .map((k, i) => {
      if (k.totalGranted === 0)
        return `| ${k.key.slice(0, 8)} | 不可用 | —— | —— |`
      return `| ${k.key.slice(0, 8)} | ${k.totalAvailable.toFixed(4)}(${(
        k.rate * 100
      ).toFixed(1)}%) | ${k.totalUsed.toFixed(4)} | ${k.totalGranted} |`
    })
    .join("\n")

  return `| Key  | 剩余 | 已用 | 总额度 |
| ---- | ---- | ---- | ------ |
${table}
`
}
