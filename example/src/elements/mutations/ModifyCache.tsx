import api from "../../api"
import ExampleLayout from "../../components/ExampleLayout"
import withApi from "../../components/withApi"

export default function ModifyCache() {
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
    <h1>Modify cache</h1>
    <p>Instead of actually calling the server, you can modify cache to update data of other APIs. This can be done with <code>mutate</code> method in <code>onCompleted</code> hook of <code>useMutationApi</code>.This can be useful when we are handling get and update in separated components</p>
  </div>
)

const code = `function EditUser() {
  const [updateUser, { loading, data, error }] = api.useMutationApi('UPDATE_USER', {
    variables: {
      path: {
        id: 1
      }
    },
    onCompleted: ({ data, mutate }) => {
      mutate('GET_USER', { path: { id: 1} }, user => ({
        ...user,
        ...data
      }) as User)
    }
  })

  return (
    <div>
      <div>
        <p>Enter user name and click update.</p>
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
          <input type='text' name='user[name]' placeholder="John Doe"/>
          <button>
            Update
          </button>
        </form>
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
      <div className="border-b border-gray-200 pb-2">
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
      <div className="border-b border-gray-200 pb-2">
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
    onCompleted: ({ data, mutate }) => {
      mutate('GET_USER', { path: { id: 1} }, user => ({
        ...user,
        ...data
      }) as User)
    }
  })

  return (
    <div>
      <div>
        <p>Enter user name and click update.</p>
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
          <input type='text' name='user[name]' placeholder="John Doe"/>
          <button>
            Update
          </button>
        </form>
      </div>
      <div>
        {loading && <p>Updating...</p>}
        {error && <p>An error occurred while updating user</p>}
        {data && <p>Updated data: {JSON.stringify(data)}</p>}
      </div>
    </div>
  )
}
