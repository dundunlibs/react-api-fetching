import { useState } from "react"
import FormattedCode from "./FormattedCode"

interface Props {
  Header: React.ComponentType
  code: string
  Example: React.ComponentType
}

export default function ExampleLayout({ Header, code, Example }: Props) {
  const [count, setCount] = useState(0)

  return (
    <div className="mb-80">
      <Header />
      <div className="mt-4">
        <FormattedCode>
          {code}
        </FormattedCode>
      </div>
      <div className="bg-gray-200 h-px my-6" />
      <button className="mb-4"
        onClick={() => setCount(count + 1)}
      >
        {count > 0 ? 'Re-run' : 'Run' } example
      </button>
      {count > 0 && <Example key={count} />}
    </div>
  )
}