import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function RevalidateAfterMutation() {
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
    <h1>Revalidate after mutation</h1>
    <p>Instead of using <code>useApi</code> or <code>useLazyApi</code> refetch method, you can use <code>revalidate</code> method in <code>onCompleted</code> hook of <code>useMutationApi</code>.This can be useful when we are handling get and update in separated components</p>
  </div>
)

const code = `function EditUser() {
  const [updateUser, { loading, data, error }] = api.useMutationApi('UPDATE_USER', {
    variables: {
      path: {
        id: 1
      }
    },
    onCompleted: async ({ revalidate }) => {
      await revalidate('GET_USER', { path: { id: 1} })
    }
  })

  return (
    <div>
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
          <input type='text' name='user[name]' placeholder="John Doe"/>
          <button>
            Update
          </button>
        </form>
        <div className="bg-yellow-200 px-2 rounded">
          <p>Note that this is a mock API, so the results in "GET" and "PUT" are different. Have a look at devtools's network tab to see how requests are sent.</p>
        </div>
      </div>
      <div>
        {loading && <p>Updating...</p>}
        {error && <p>An error occurred while updating user</p>}
        {data && <p>Updated data: {JSON.stringify(data)}</p>}
      </div>
    </div>
  )
}

function Example() {
  const { loading, data, error } = api.useApi('GET_USER', {
    variables: {
      path: {
        id: 1
      }
    }
  })

  return (
    <div className="space-y-2">
      <div className="border-b pb-2">
        <h6>User info</h6>
        {loading && <p>Loading user info...</p>}
        {error && <p>Error while fetching user info</p>}
        {data && <p>User info: {JSON.stringify(data)}</p>}
      </div>
      <EditUser />
    </div>
  )
}`

const Example = withApi(() => {
  const { loading, data, error } = api.useApi('GET_USER', {
    variables: {
      path: {
        id: 1
      }
    }
  })

  return (
    <div className="space-y-2">
      <div className="border-b pb-2">
        <h6>User info</h6>
        {loading && <p>Loading user info...</p>}
        {error && <p>Error while fetching user info</p>}
        {data && <p>User info: {JSON.stringify(data)}</p>}
      </div>
      <EditUser />
    </div>
  )
})

function EditUser() {
  const [updateUser, { loading, data, error }] = api.useMutationApi('UPDATE_USER', {
    variables: {
      path: {
        id: 1
      }
    },
    onCompleted: async ({ revalidate }) => {
      await revalidate('GET_USER', { path: { id: 1} })
    }
  })

  return (
    <div>
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
          <input type='text' name='user[name]' placeholder="John Doe"/>
          <button>
            Update
          </button>
        </form>
        <div className="bg-yellow-200 px-2 rounded">
          <p>Note that this is a mock API, so the results in "GET" and "PUT" are different. Have a look at devtools's network tab to see how requests are sent.</p>
        </div>
      </div>
      <div>
        {loading && <p>Updating...</p>}
        {error && <p>An error occurred while updating user</p>}
        {data && <p>Updated data: {JSON.stringify(data)}</p>}
      </div>
    </div>
  )
}
