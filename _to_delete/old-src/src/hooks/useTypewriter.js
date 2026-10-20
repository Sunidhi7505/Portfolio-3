import { useEffect, useState } from 'react'

/** Cycles through `words` with a typing / deleting effect. With reduced motion it shows the first word statically. */
export function useTypewriter(words, { reduced = false, typeMs = 70, deleteMs = 38, holdMs = 1500 } = {}) {
  const [text, setText] = useState(reduced ? words[0] : '')

  useEffect(() => {
    if (reduced) { setText(words[0]); return undefined }
    let i = 0
    let char = 0
    let deleting = false
    let timer
    const tick = () => {
      const word = words[i]
      if (!deleting) {
        char += 1
        setText(word.slice(0, char))
        if (char === word.length) { deleting = true; timer = setTimeout(tick, holdMs); return }
        timer = setTimeout(tick, typeMs)
      } else {
        char -= 1
        setText(word.slice(0, char))
        if (char === 0) { deleting = false; i = (i + 1) % words.length; timer = setTimeout(tick, 320); return }
        timer = setTimeout(tick, deleteMs)
      }
    }
    timer = setTimeout(tick, 600)
    return () => clearTimeout(timer)
  }, [words, reduced, typeMs, deleteMs, holdMs])

  return text
}
