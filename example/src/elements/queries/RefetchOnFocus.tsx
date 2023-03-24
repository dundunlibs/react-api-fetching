import { useEffect, useState } from "react"
import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function RefetchOnFocus() {
  return (
    <ExampleLayout
      Header={Header}
      code={code}
      Example={Example}
    />
  )
}

function Header() {
  return (
    <div>
      <h1>Refetch on focus</h1>
      <p>After your API is cached, we can trigger refetch it automatically using custom <code>useFocused</code> hook. Basically, when <code>useFocused</code> changes it's state from false to true, the API will be refetched automatically.</p>
    </div>
  )
}

const code = `const useFocused = () => {
  const [visibility, setVisibility] = useState<DocumentVisibilityState>('visible')

  useEffect(() => {
    const hdr = () => setVisibility(document.visibilityState)
    document.addEventListener('visibilitychange', hdr)
    return () => document.removeEventListener('visibilitychange', hdr)
  }, [])

  return visibility === 'visible'
}

function Example() {
  const { loading, data, error } = api.useApi('GET_USERS')

  return (
    <div>
      <p className="mb-2">Try open a new tab then come back, you will see all your active APIs will be refetched automatically.</p>
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
  )
}

function App() {
  return (
    <api.Provider config={{ fetcher, useFocused }}>
      <Example />
    </api.Provider>
  )
}`

const useFocused = () => {
  const [visibility, setVisibility] = useState<DocumentVisibilityState>('visible')

  useEffect(() => {
    const hdr = () => setVisibility(document.visibilityState)
    document.addEventListener('visibilitychange', hdr)
    return () => document.removeEventListener('visibilitychange', hdr)
  }, [])

  return visibility === 'visible'
}

const Example = withApi(() => {
  const { loading, data, error } = api.useApi('GET_USERS')

  return (
    <div>
      <p className="mb-2">Try open a new tab then come back, you will see all your active APIs will be refetched automatically.</p>
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
  )
}, {
  useFocused
})