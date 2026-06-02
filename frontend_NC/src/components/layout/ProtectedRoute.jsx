import {Navigate} from "react-router-dom"
import {useAuth} from "../../context/AuthContext"

function ProtectedRoute({children}){

    const {loading,isAuthenticated}=useAuth()

    if(loading){
        return <div>Loading...</div>
    }

    if(!isAuthenticated){
        return <Navigate to="/login" replace/>
    }

    return children
}

export default ProtectedRoute