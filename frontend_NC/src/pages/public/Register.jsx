import {useState} from "react"
import {useNavigate, Link} from "react-router-dom"

function Register(){

    const navigate = useNavigate()

    const [username,setUsername]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [error,setError]=useState("")
    const [loading,setLoading]=useState(false)

    async function handleSubmit(e){
        e.preventDefault()

        setError("")
        setLoading(true)

        try{
            const res = await fetch("http://localhost:3000/register",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    username,
                    email,
                    password,
                    role:"user"
                })
            })

            const data = await res.json()

            if(!data.ok){
                setError(data.reason || "Registration failed")
                setLoading(false)
                return
            }

            setUsername("")
            setEmail("")
            setPassword("")

            alert("REGISTERED SUCCESSFULLY")

            navigate("/login")

        }catch(e){
            setError(e.message)
        }finally{
            setLoading(false)
        }
    }

    return(
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username"/>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password"/>

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            {error && <p>{error}</p>}

            <p className="mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-pink-300 underline">
                    Login here
                </Link>
            </p>
        </div>
    )
}

export default Register