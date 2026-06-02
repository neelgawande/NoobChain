import { createContext, useContext, useEffect, useState } from "react"

const AuthContext=createContext()

export function AuthProvider({children}){
    const [token,setToken]=useState(localStorage.getItem("token"))
    const [user,setUser]=useState(null)
    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        async function loadUser(){
            if(!token){
                setUser(null)
                setLoading(false)
                return
            }
            try{
                const res=await fetch("http://localhost:3000/me",{
                    headers:{
                        Authorization:token
                    }
                })
                const data=await res.json()
                if(data.ok===false){
                    localStorage.removeItem("token")
                    setToken(null)
                    setUser(null)
                }else{
                    setUser(data)
                }
            }catch{
                setUser(null)
            }

            setLoading(false)
        }
        loadUser()
    },[token])
    
    function login(token,user){
        localStorage.setItem("token",token)
        setToken(token)
        setUser(user)
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
            isAuthenticated:!!token
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    return useContext(AuthContext)
}