import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function LazyFetch() {
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
    <h1>Lazy fetch</h1>
    <p>Manually fetch data</p>
  </div>
)

const code = `function Example() {
  const [getUser, { loading, data, error }] = api.useLazyApi('GET_USER')

  return (
    <div>
      <div>
        <p>Enter user id and click the button to fetch user</p>
        <form
          className="space-x-2"
          onSubmit={e => {
            e.preventDefault()
            getUser({
              variables: {
                path: {
                  id: e.currentTarget['user[id]'].value
                }
              }
            })
          }
        }>
          <input type='number' name='user[id]' placeholder="User ID" />
          <button>
            Get user
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h6>User info</h6>
        {loading && <p>Loading...</p>}
        {error && <p>An error occurred while fetching user. Error: {JSON.stringify(error)}</p>}
        {data && <p>User: {JSON.stringify(data)}</p>}
      </div>
    </div>
  )
}`

const Example = withApi(() => {
  const [getUser, { loading, data, error }] = api.useLazyApi('GET_USER')

  return (
    <div>
      <div>
        <p>Enter user id and click the button to fetch user</p>
        <form
          className="space-x-2"
          onSubmit={e => {
            e.preventDefault()
            getUser({
              variables: {
                path: {
                  id: e.currentTarget['user[id]'].value
                }
              }
            })
          }
        }>
          <input type='number' name='user[id]' placeholder="User ID" />
          <button>
            Get user
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h6>User info</h6>
        {loading && <p>Loading...</p>}
        {error && <p>An error occurred while fetching user. Error: {JSON.stringify(error)}</p>}
        {data && <p>User: {JSON.stringify(data)}</p>}
      </div>
    </div>
  )
})