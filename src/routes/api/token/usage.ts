// @ts-nocheck
import { getTokenUsage } from "~/utils/api"
import type { APIEvent } from "solid-start/api"
import { json } from "solid-start/api"
function getQueryParams(url: string) {
  const queryString = url.split("?")[1]
  const query = {}

  if (queryString) {
    const keyValuePairs = queryString.split("&")
    for (let i = 0; i < keyValuePairs.length; i++) {
      const keyValuePair = keyValuePairs[i].split("=")
      const key = decodeURIComponent(keyValuePair[0])
      const value = decodeURIComponent(keyValuePair[1]) || ""
      if (query[key]) {
        query[key] = Array.isArray(query[key]) ? query[key] : [query[key]]
        query[key].push(value)
      } else {
        query[key] = value
      }
    }
  }

  return query
}

export async function GET({ request, params }: APIEvent) {
  const { token } = getQueryParams(request.url)
  const result = await getTokenUsage({ token })
  return json(result)
}
