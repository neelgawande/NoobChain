import {useState} from "react"
import {useAuth} from "../../context/AuthContext"

function Login(){

    const {login}=useAuth()

    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [error,setError]=useState("")

    async function handleSubmit(e){
        e.preventDefault()

        setError("")

        try{
            const res=await fetch("http://localhost:3000/login",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email,
                    password
                })
            })

            const data=await res.json()

            if(!data.ok){
                setError(data.reason)
                return
            }

            login(data.token,data.user)

            console.log("logged in",data.user)

        }catch(e){
            setError(e.message)
        }
    }

    return(
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="email"
                />

                <input
                    type="password"
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                    placeholder="password"
                />

                <button type="submit">
                    Login
                </button>
            </form>

            {error&&<p>{error}</p>}
        </div>
    )
}

export default Login