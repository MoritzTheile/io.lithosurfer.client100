export type JWTToken = { id_token: string }

export type LoginVM = {
  username: string
  password: string
  rememberMe?: boolean
}

export type UserDTO = {
  id?: number
  login?: string
  firstName?: string
  lastName?: string
  email?: string
  activated?: boolean
  authorities?: string[]
  imageUrl?: string
  createdBy?: string
  createdDate?: string
  lastModifiedBy?: string
  lastModifiedDate?: string
  langKey?: string
}

