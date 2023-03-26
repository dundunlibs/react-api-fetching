import { useState } from "react"
import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function CacheData() {

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
      <h1>Cache data</h1>
      <p>After an API is fetched, it's response will be automatically cached, so that next time we can reuse it, no need to call to the server again</p>
    </div>
  )
}

const code = `function UserList() {
  const { loading, data, error } = api.useApi('GET_USERS')

  return (
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
  )
}

function Example() {
  const [count, setCount] = useState(0)

  return (
    <div className="space-y-4">
      <div>
        <p>Click "Show more" to open new "List of users". The request is only called once in the first time, next time it will use the cached data</p>
        <button
          className="mt-2"
          onClick={() => setCount(count + 1)}
        >
          Show more
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...new Array(count)].map((_, i) => (
          <UserList key={i} />
        ))}
      </div>
    </div>
  )
}`

const Example = withApi(() => {
  const [count, setCount] = useState(0)

  return (
    <div className="space-y-4">
      <div>
        <p>Click "Show more" to open new "List of users". The request is only called once in the first time, next time it will use the cached data</p>
        <button
          className="mt-2"
          onClick={() => setCount(count + 1)}
        >
          Show more
        </button>
      </div>
      <div className="grid gap-4 grid-cols-2">
        {[...new Array(count)].map((_, i) => (
          <UserList key={i} />
        ))}
      </div>
    </div>
  )
})

function UserList() {
  const { loading, data, error } = api.useApi('GET_USERS')

  return (
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
  )
}