interface User {
  id: number
  name: string
}

interface ApiData {
  GET_USERS:  Pick<User, 'id'>[]
  GET_USER:  User
  UPDATE_USER:  User
}
