const fn = async () => {
  const rawRes = await fetch(`https://openai.1rmb.tk/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer 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`
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "你好"
        },
        {
          role: "assistant",
          content: "你好！有什么我可以帮助你的吗？"
        },
        {
          role: "user",
          content: "今天是什么日子"
        },
        {
          role: "assistant",
          content:
            "我很抱歉，作为一个语言模型，我没有实时的时间和日期功能。请您查看您的设备或者搜索引擎来获取今天的日期。"
        },
        {
          role: "user",
          content: "那今天发生过什么事情吗"
        }
      ],
      temperature: 0.6,
      stream: false
    })
  })
  const result = await rawRes.json()
  console.log(result)
}

fn()
