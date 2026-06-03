import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function ProtectedAdminRoute({ children }){

    const { user, loading } = useAuth()

    if(loading){
        return <div className="text-zinc-400">Loading...</div>
    }

    const role = user?.role

    const allowed = role === "admin" || role === "god"

    if(!allowed){
        return <Navigate to="/" replace />
    }

    return children
}