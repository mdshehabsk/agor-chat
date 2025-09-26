'use client'

import useUserState from "@/state/useUserState"
import SignIn from "./Signin"
import Connection from "./Connection"

const AuthCheck = () => {
  const { token, userId } = useUserState()

  // Consider the user authenticated only if both token and userId exist
  const isAuthenticated = Boolean(token && userId)

  return (
    <div>
      {isAuthenticated ? <Connection /> : <SignIn />}
    </div>
  )
}

export default AuthCheck
