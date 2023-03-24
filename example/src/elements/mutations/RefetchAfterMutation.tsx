import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function RefetchAfterMutation() {
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
    <h1>Refetch after mutation</h1>
    <p><code>useApi</code> or <code>useLazyApi</code> hook has a <code>refetch</code> method. You can use that to force the API to be refetched.</p>
  </div>
)

const code = `function Example() {
  const { loading, data, error, refetch } = api.useApi('GET_USER', {
    variables: {
      path: {
        id: 1
      }
    }
  })
  const [updateUser, { loading: updating, data: updatedData, error: updatedError }] = api.useMutationApi('UPDATE_USER', {
    variables: {
      path: {
        id: 1
      }
    },
    onCompleted: () => refetch()
  })

  return (
    <div className="space-y-2">
      <div className="border-b pb-2">
        <h6>User info</h6>
        {loading && <p>Loading user info...</p>}
        {error && <p>Error while fetching user info</p>}
        {data && <p>User info: {JSON.stringify(data)}</p>}
      </div>
      <div>
        <p>Enter user name and click update.</p>
        <form
          className="space-x-2 py-2"
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
          <button >
            Update
          </button>
        </form>
        <div className="bg-yellow-200 px-2 rounded">
          <p>Note that this is a mock API, so the results in "GET" and "PUT" are different. Have a look at devtools's network tab to see how requests are sent.</p>
        </div>
      </div>
      <div>
        {updating && <p>Updating...</p>}
        {updatedError && <p>An error occurred while updating user</p>}
        {updatedData && <p>Updated data: {JSON.stringify(updatedData)}</p>}
      </div>
    </div>
  )
}`

const Example = withApi(() => {
  const { loading, data, error, refetch } = api.useApi('GET_USER', {
    variables: {
      path: {
        id: 1
      }
    }
  })
  const [updateUser, { loading: updating, data: updatedData, error: updatedError }] = api.useMutationApi('UPDATE_USER', {
    variables: {
      path: {
        id: 1
      }
    },
    onCompleted: () => refetch()
  })

  return (
    <div className="space-y-2">
      <div className="border-b pb-2">
        <h6>User info</h6>
        {loading && <p>Loading user info...</p>}
        {error && <p>Error while fetching user info</p>}
        {data && <p>User info: {JSON.stringify(data)}</p>}
      </div>
      <div>
        <p>Enter user name and click update.</p>
        <form
          className="space-x-2 py-2"
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
          <button >
            Update
          </button>
        </form>
        <div className="bg-yellow-200 px-2 rounded">
          <p>Note that this is a mock API, so the results in "GET" and "PUT" are different. Have a look at devtools's network tab to see how requests are sent.</p>
        </div>
      </div>
      <div>
        {updating && <p>Updating...</p>}
        {updatedError && <p>An error occurred while updating user</p>}
        {updatedData && <p>Updated data: {JSON.stringify(updatedData)}</p>}
      </div>
    </div>
  )
})