import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function BasicFetch() {
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
      <h1>Basic fetch</h1>
      <p>Automatically fetch data when component is mounted.</p>
    </div>
  )
}

const code = `function Example() {
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
}`

const Example = withApi(() => {
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
})