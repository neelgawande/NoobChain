import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()

export function AuthProvider({children}){

    const [token,setToken] = useState(localStorage.getItem("token"))
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)

    useEffect(()=>{

        let isMounted = true

        async function loadUser(){

            if(!token){
                if(isMounted){
                    setUser(null)
                    setLoading(false)
                }
                return
            }

            try{

                const res = await fetch("http://localhost:3000/me",{
                    headers:{Authorization:token}
                })

                const data = await res.json()

                if(!data?.ok){
                    localStorage.removeItem("token")
                    if(isMounted){
                        setToken(null)
                        setUser(null)
                        setLoading(false)
                    }
                    return
                }

                if(isMounted){
                    setUser(data.info)
                }

            }catch{
                localStorage.removeItem("token")
                if(isMounted){
                    setToken(null)
                    setUser(null)
                }
            }finally{
                if(isMounted){
                    setLoading(false)
                }
            }
        }

        loadUser()

        return ()=>{ isMounted = false }

    },[token])

    function login(newToken,userData){
        localStorage.setItem("token",newToken)
        setToken(newToken)
        setUser(userData)
    }

    function logout(){
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{
            token,
            user,
            loading,
            login,
            logout,

            // FIX: proper auth signal
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    return useContext(AuthContext)
}