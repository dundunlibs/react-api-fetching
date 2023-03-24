interface Api {
  path: string
  method: string
}

interface Variables {
  path?: Record<string | number, string>
  query?: string | string[][] | Record<string, string> | URLSearchParams
  body?: any
}

const baseUrl = 'https://nextjs-api-routes-rest.vercel.app'

export default async function fetcher(api: Api, variables: Variables) {
  const { path, method } = api
  const url = new URL(path, baseUrl)

  if (variables.path) {
    for (const [key, value] of Object.entries(variables.path)) {
      url.pathname = url.pathname.replace(`:${key}`, value)
    }
  }

  if (variables.query) {
    url.search = new URLSearchParams(variables.query).toString()
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      ...(variables.body && {
        'Content-Type': 'application/json'
      })
    },
    ...(variables.body && {
      body: JSON.stringify(variables.body)
    })
  })

  return await res.json()
}