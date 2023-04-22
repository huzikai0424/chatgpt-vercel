import { getTokenUsage } from "~/utils/api"
import url from "url"
import type { APIEvent} from "solid-start/api"
import { json } from "solid-start/api"

export async function GET({ request, params }: APIEvent) {
  const { query } = url.parse(request.url, true)
  const token = query?.token as string
  const result = await getTokenUsage({ token })
  return json(result)
}
