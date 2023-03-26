import { createAPIs } from 'react-api-fetching'

export const APIs = {
  GET_USERS: {
    path: '/api/users',
    method: 'get'
  },
  GET_USER: {
    path: '/api/user/:id',
    method: 'get'
  },
  UPDATE_USER: {
    path: '/api/user/:id',
    method: 'put'
  }
}

export default createAPIs<typeof APIs, ApiData>(APIs)