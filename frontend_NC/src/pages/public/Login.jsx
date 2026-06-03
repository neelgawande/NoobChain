import {useState} from "react"
import {useAuth} from "../../context/AuthContext"
import {useNavigate, Link} from "react-router-dom"

function Login(){

    const {login} = useAuth()
    const navigate = useNavigate()

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const [loading,setLoading] = useState(false)

    async function handleSubmit(e){
        e.preventDefault()

        setError("")
        setLoading(true)

        try{
            const res = await fetch("http://localhost:3000/login",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({email,password})
            })

            const data = await res.json()

            if(!data.ok){
                setError(data.reason || "Login failed")
                setLoading(false)
                return
            }

            const meRes = await fetch("http://localhost:3000/me",{
                headers:{Authorization:data.token}
            })

            const meData = await meRes.json()

            if(!meData.ok){
                setError("Failed to load user after login")
                setLoading(false)
                return
            }

            login(data.token,meData.info)
            navigate("/")

        }catch(e){
            setError(e.message)
        }finally{
            setLoading(false)
        }
    }

    return(
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password"/>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {error && <p>{error}</p>}

            <p className="mt-4">
                Don’t have an account?{" "}
                <Link to="/register" className="text-pink-300 underline">
                    Register here
                </Link>
            </p>
        </div>
    )
}

export default Login