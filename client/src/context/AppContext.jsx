import React, { createContext, useState } from 'react'

// Application-level context. Start small and expand as features are added.
export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  )
}
