import { useLayoutEffect, useRef } from "react"
import Prism from 'prismjs'
import clsx from "../utils/clsx"

interface Props {
  children: string
  language?: string
  plugins?: string[]
}

export default function FormattedCode({ children, language = 'tsx', plugins = ['line-numbers'] }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    Prism.highlightElement(ref.current)
  }, [language])

  return (
    <pre className={clsx(...plugins)}>
      <code ref={ref} className={clsx('language-' + language)}>
        {children}
      </code>
    </pre>
  )
}