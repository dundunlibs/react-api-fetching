---
sidebar_position: 1
---

# Getting Started

Let's have a look on **react-api-fetching** in less than 5 minutes.

## Installation

<!-- Get started by **creating a new site**.

Or **try Docusaurus immediately** with **[docusaurus.new](https://docusaurus.new)**.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 16.14 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies. -->

Inside your React project directory, run:
```bash
# npm
npm install react-api-fetching

# yarn
yarn add react-api-fetching

# pnpm
pnpm add react-api-fetching
```

## Quick Start

In order to use **react-api-fetching**, we need to define a **fetcher** function and our **APIs set**.
### Create fetcher function
The fetcher function requires two parameters `apiConfig` and `variables` (these parameters can be dynamically defined based on your needs as they do not follow any specific rule). The return value can be either a data or an error.

In this example we will assume that `apiConfig` and `variables` follow the following types:
```ts
interface ApiConfig {
  path: string
  method: string
}

interface Variables {
  path?: Record<string, string | number>
  search?: any
  body?: any
}

const baseUrl = /* your baseUrl */

export async function fetcher (apiConfig: ApiConfig, variables: Variables) {
  const { path, method } = apiConfig
  const url = new URL(path, baseUrl)

  if ('path' in variables) {
    for (const [key, value] of Object.entries(variables.body)) {
      url.pathname = url.pathname.replace(`:${key}`, value)
    }
  }

  if ('search' in variables) {
    url.searchParams = new URLSearchParams(variables.search)
  }

  const res = await fetch(url.toString(), {
    method: method,
    ...('body' in variables && {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(variables.body)
    })
  })

  if (res.ok) return await res.json()

  throw new Error("Failed to fetch data.")
}
```

### Define APIs set
Now we will define our **APIs set** based on the `apiConfig`'s type.

```ts
import { createAPIs } from 'react-api-fetching'

export const Api = createAPIs({
  USERS: {
    path: '/api/users',
    method: 'GET',
  },
  UPDATE_USER: {
    path: '/api/users/:id',
    method: 'PUT',
  }
})
```

### Fetch data
After defined **fetcher** function and **APIs set**, now is the time we use it inside React code.

```tsx
import { fetcher } from 'your-fetcher'
import { Api } from 'your-api'

export default function App() {
  return (
    <Api.Provider config={{ fetcher }}>
      <Users />
      <EditUser />
    </Api.Provider>
  )
}

function Users() {
  const { loading, data, error } = Api.useApi('USERS', {
    variables: /* Optional. This is the fetcher's variables */
  })

  return /* your code */
}

function EditUser() {
  const [updateUser, { loading, data, error }] = Api.useMutationApi('UPDATE_USER')

  const handleUpdateUser = async () => {
    const { data, error } = await updateUser({
      variables: { /* This is also the fetcher's variables */
        path: {
          id: /* user's id */
        },
        body: /* user's body */
      }
    })
  }

  return /* your code */
}
```

That's all. Enjoy your coding!

<!-- ## Start your site

Run the development server:

```bash
cd my-website
npm run start
```

The `cd` command changes the directory you're working with. In order to work with your newly created Docusaurus site, you'll need to navigate the terminal there.

The `npm run start` command builds your website locally and serves it through a development server, ready for you to view at http://localhost:3000/.

Open `docs/intro.md` (this page) and edit some lines: the site **reloads automatically** and displays your changes. -->
