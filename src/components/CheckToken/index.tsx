import {
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  on
} from "solid-js"
import styles from "./style.module.css"
const { isDisabled } = styles
const errorMessage: {
  [key: number]: string
} = {
  1: "token不存在",
  3: "额度已用完",
  4: "token被封禁"
}
export default () => {
  let input: any
  const [showModel, setShowModel] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>()
  const [usage, setUsage] = createSignal<any>()

  createEffect(
    on(
      () => showModel(),
      () => {
        if (showModel()) {
          input.value = localStorage.getItem("secretToken")
        }
      }
    )
  )

  onMount(() => {
    const secretToken = localStorage.getItem("secretToken")
    if (!secretToken) {
      setShowModel(true)
    } else {
      if (input && input.value) {
        input.value = secretToken
      }
    }
  })

  const auth = () => {
    const value = input.value
    if (value.length === 0) {
      return
    }
    setIsLoading(true)
    if (value.length !== 32) {
      setError("Token输入有误")
    } else {
      fetch("https://gpt.yokonsan.com/v1/api/token/verify", {
        method: "POST",
        headers: {
          "x-token": "af5eccc5-2d80-474f-86fc-634aabe60f0c",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: value
        })
      })
        .then(async res => {
          const result = await res.json()
          if ([0, 2].includes(result?.data?.status)) {
            localStorage.setItem("secretToken", value)
            setShowModel(false)
            setError(null)
          } else {
            const error = errorMessage[result?.data?.status]
            setError(error || "未知错误")
          }
        })
        .catch(err => {
          console.error(err)
          setError(err || "未知错误")
        })
    }
  }
  const getUsage = async () => {
    const secretToken =
      (input && input.value) || localStorage.getItem("secretToken")
    if (secretToken && secretToken.length === 32) {
      try {
        const result = await fetch(
          `https://gpt.yokonsan.com/v1/api/token/usage?token=${secretToken}`,
          {
            headers: {
              "x-token": "af5eccc5-2d80-474f-86fc-634aabe60f0c",
              "Content-Type": "application/json"
            }
          }
        )
        const res = await result.json()
        if ([0, 2].includes(res?.data?.status)) {
          setUsage(res.data)
          setError(error || "未知错误")
        } else {
          const error = errorMessage[res?.data?.status]
          setError(error)
        }
      } catch (error) {
        console.error(error)
      }
    } else {
      setError("Token输入有误")
    }
  }
  return (
    <Show
      when={showModel()}
      fallback={
        <span onClick={() => setShowModel(true)} class={styles.fallback}>
          Token设置
        </span>
      }
    >
      <div class={styles.model_root}>
        <div class={styles.mask} />
        <div class={styles.model_container}>
          <div class={styles.model_dialog}>
            <div class={styles.title}>请输入你的Token</div>
            <p class={styles.desc}>
              使用GPT3.5-Turbo需要输入Token才能继续使用。
            </p>
            <p class={styles.desc}>
              你可以从公众号免费获取体验次数或
              <a
                style={{ color: "#10a37f" }}
                href="https://faka.yokonsan.com"
                target="_blank"
              >
                直接购买
              </a>
            </p>
            <div>
              <img class={styles.qrcode} src="/qrcode.jpg" alt="qrcode" />
              <div class={styles.desc}>【AI不懂生命本质】</div>
              <div class={styles.desc}>关注微信公众号，获取使用code</div>
            </div>
            <div class={styles.input_box}>
              <span class={styles.label}>Token:</span>
              <input
                ref={input}
                maxLength={32}
                class={styles.input}
                placeholder="输入你的32位token"
              ></input>
            </div>
            <Show when={error()}>
              <span class={styles.error}>{error()}</span>
            </Show>
            <div class={styles["usage-info"]}>
              可用额度：
              <span>
                <Show when={usage()}>
                  ￥{usage().used}/￥{usage().limit}
                </Show>
                <span onClick={getUsage} class={styles.update}>
                  点我更新
                </span>
              </span>
            </div>
            <div class={styles.action}>
              <div class={styles.leftArea}>
                <a class={styles.leftMain} href="https://ai.yokonsan.com">
                  回到主站
                </a>
              </div>
              <div>
                <div
                  class={styles.cancel}
                  onClick={() => {
                    setShowModel(false)
                    setError(null)
                  }}
                >
                  下次一定
                </div>
                <div
                  classList={{
                    isDisabled: isLoading()
                  }}
                  class={styles.confirm}
                  onClick={auth}
                >
                  确定
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
