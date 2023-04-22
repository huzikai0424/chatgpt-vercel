import { defaultEnv } from "~/env"
const urlBase = process.env.API_BASE_URL || defaultEnv.API_BASE_URL
const headers = {
  "x-token": "af5eccc5-2d80-474f-86fc-634aabe60f0c",
  "Content-Type": "application/json"
}

enum RequestMethod {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
  DELETE = "DELETE"
}

async function request(
  path: string,
  method: RequestMethod,
  params: Record<string, any> = {}
) {
  let url = urlBase + path
  if (method === "GET" && params) {
    const queryString = Object.keys(params)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&")
    url += `?${queryString}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: method !== "GET" ? JSON.stringify(params) : undefined
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()
  return data
}

interface IBillingRules {
  base: number
  tokens: number
  /** 倍率 */
  multiplier: number
}
interface ICreateToken {
  /** 使用额度 */
  limit: number
  /** 计费 ID */
  billing: number
  /** 生成数量 */
  batch: number
}
interface ITokenUsed {
  token: string
  tokens: number
}

interface ICalcMassage {
  token: string
  messages: any[]
}
export const createBilling = (params: IBillingRules) =>
  request("/v1/api/billing/", RequestMethod.POST, params)

export const createToken = (params: ICreateToken) =>
  request("/v1/api/token/", RequestMethod.GET, params)

export const verifyToken = (params: { token: string }) =>
  request("/v1/api/token/verify", RequestMethod.POST, params)

export const UpdateTokenUsed = (params: ITokenUsed) =>
  request("/v1/api/token/used", RequestMethod.POST, params)

export const getTokenUsage = (params: { token: string }) =>
  request("/v1/api/token/usage", RequestMethod.GET, params)

export const tokenMessages = (params: ICalcMassage) =>
  request("/v1/api/token/messages2", RequestMethod.POST, params)
