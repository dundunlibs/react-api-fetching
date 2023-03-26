import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function BasicMutation() {
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
    <h1>Basic mutation</h1>
    <p>Just a basic mutation</p>
  </div>
)

const code = `function Example() {
  const [updateUser, { loading, data, error }] = api.useMutationApi('UPDATE_USER', {
    variables: {
      path: {
        id: 1
      }
    }
  })

  return (
    <div>
      <div>
        <p>Enter user name and click update</p>
        <form
          className="space-x-2"
          onSubmit={e => {
            e.preventDefault()
            updateUser({
              variables: {
                body: {
                  name: e.currentTarget['user[name]'].value
                }
              }
            })
          }}
        >
          <input type='text' name='user[name]' placeholder="John Doe" />
          <button>
            Update
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h6>Result</h6>
        {loading && <p>Loading...</p>}
        {error && <p>An error occurred while updating user</p>}
        {data && <p>User: {JSON.stringify(data)}</p>}
      </div>
    </div>
  )
}`

const Example = withApi(() => {
  const [updateUser, { loading, data, error }] = api.useMutationApi('UPDATE_USER', {
    variables: {
      path: {
        id: 1
      }
    }
  })

  return (
    <div>
      <div>
        <p>Enter user name and click update</p>
        <form
          className="space-x-2"
          onSubmit={e => {
            e.preventDefault()
            updateUser({
              variables: {
                body: {
                  name: e.currentTarget['user[name]'].value
                }
              }
            })
          }}
        >
          <input type='text' name='user[name]' placeholder="John Doe" />
          <button>
            Update
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h6>Result</h6>
        {loading && <p>Loading...</p>}
        {error && <p>An error occurred while updating user</p>}
        {data && <p>User: {JSON.stringify(data)}</p>}
      </div>
    </div>
  )
})