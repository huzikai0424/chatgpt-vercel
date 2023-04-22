import { verifyToken } from "~/utils/api"
import url from "url"
import type { APIEvent} from "solid-start/api"
import { json } from "solid-start/api"

export async function POST({ request }: APIEvent) {
  const { token } = await request.json()
  const result = await verifyToken({ token })
  return json(result)
}
