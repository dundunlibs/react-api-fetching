import { useState } from "react"
import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function CallbackHooks() {
  return (
    <ExampleLayout
      Header={Header}
      code={code}
      Example={Example}
    />
  )
}

const Header = () => (
  <div>
    <h1>Callback hooks</h1>
    <p>Use can use `onFetch` (before fetch) or `onCompleted` (after fetch) hooks to execute some of your code</p>
  </div>
)

const code = `function Example() {
  const [logs, setLogs] = useState<{ time: number, message: string }[]>([])
  const { loading, data, error } = api.useApi('GET_USERS', {
    onFetch: () => setLogs(logs => [...logs, { time: Date.now(), message: 'Start fetch data' }]),
    onCompleted: ({ data }) => setLogs(logs => [...logs, { time: Date.now(), message: 'Finish fetch data. Result: ' + JSON.stringify(data)}])
  })

  return (
    <div className="grid grid-cols-2">
      <div>
        <h6>List of users</h6>
        {loading && <p>Loading...</p>}
        {error && <p>An error occurred while fetching users</p>}
        {data && (
          <ul>
            {data.map(user => (
              <li key={user.id}>
                {user.id}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h6>Logs</h6>
        <ul>
          {logs.map((log, i) => (
            <li key={i}>
              [{log.time}] {log.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}`

const Example = withApi(() => {
  const [logs, setLogs] = useState<{ time: number, message: string }[]>([])
  const { loading, data, error } = api.useApi('GET_USERS', {
    onFetch: () => setLogs(logs => [...logs, { time: Date.now(), message: 'Start fetch data' }]),
    onCompleted: ({ data }) => setLogs(logs => [...logs, { time: Date.now(), message: 'Finish fetch data. Result: ' + JSON.stringify(data)}])
  })

  return (
    <div className="grid grid-cols-2">
      <div>
        <h6>List of users</h6>
        {loading && <p>Loading...</p>}
        {error && <p>An error occurred while fetching users</p>}
        {data && (
          <ul>
            {data.map(user => (
              <li key={user.id}>
                {user.id}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h6>Logs</h6>
        <ul>
          {logs.map((log, i) => (
            <li key={i}>
              [{log.time}] {log.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})