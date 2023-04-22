// @ts-nocheck
import Header from "~/components/Header"
import type { JSXElement } from "solid-js"
import { createEffect } from "solid-js"

export default function ({ children }: { children: JSXElement }) {
  createEffect(() => {
    var _hmt = _hmt || []
    ;(function () {
      var hm = document.createElement("script")
      hm.src = "https://hm.baidu.com/hm.js?0126be208bf24bbd4e125e7a0fcdaf45"
      var s = document.getElementsByTagName("script")[0]
      s.parentNode.insertBefore(hm, s)
    })()
  })
  return (
    <div id="root" class="sm:pt-8em py-2em before">
      <Header />
      {children}
    </div>
  )
}
