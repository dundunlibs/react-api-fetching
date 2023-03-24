import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function RedundantRequests() {
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
    <h1>Reduce redundant requests</h1>
    <p>Open <code>devtools</code> and you can see, even through we are calling 2 same API at the same time, only 1 request is sent to the server</p>
  </div>
)

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
  return (
    <div className="grid grid-cols-2">
      <UserList />
      <UserList />
    </div>
  )
}`

const Example = withApi(() => (
  <div className="grid grid-cols-2">
    <UserList />
    <UserList />
  </div>
))

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