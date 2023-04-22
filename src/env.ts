import type { Model } from "./types"

/**
 * 用于创建 .env.example 文件，不要直接填写敏感信息。
 * 以 CLIENT_ 开头的变量会暴露给前端
 */
export const defaultEnv = {
  CLIENT_GLOBAL_SETTINGS: {
    enterToSend: true
  },
  CLIENT_SESSION_SETTINGS: {
    // 0-2
    title: "",
    saveSession: true,
    APITemperature: 0.6,
    continuousDialogue: false,
    APIModel: "gpt-3.5-turbo" as Model
  },
  CLIENT_DEFAULT_MESSAGE: `使用Tips:
  - Shift + Enter 换行。开头输入 / 或者 空格 搜索 Prompt 预设。方向键↑可编辑最近一次提问。点击顶部名称滚动到顶部，点击输入框滚动到底部。
- 在输入框里输入 两个/ 或者 两个空格 可以切换对话，搜索历史消息。
- 不是连续且相关的对话请点击清除按钮开始新的对话，否则你的token会消耗的特别快。
- 关注公众号【AI 不懂人类的本质】可以获取免费token
- 有任何问题请进群反馈，或者通过邮件联系我们： hzk@cherryml.com 
- 在下方开始对话吧
`,
  CLIENT_MAX_INPUT_TOKENS: {
    "gpt-3.5-turbo": 4 * 1024,
    "gpt-4": 8 * 1024,
    "gpt-4-32k": 32 * 1024
  } as Record<Model, number>,
  API_BASE_URL: "http://175.24.183.219:8089",
  OPENAI_API_BASE_URL: "api.openai.com",
  OPENAI_API_KEY: "",
  TIMEOUT: 30000,
  PASSWORD: "",
  SEND_KEY: "",
  SEND_CHANNEL: 9,
  NO_GFW: false
}

export type SessionSettings = typeof defaultEnv.CLIENT_SESSION_SETTINGS
