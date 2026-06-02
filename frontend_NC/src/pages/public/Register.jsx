import {useState} from "react"

function Register(){

    const [username,setUsername]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [error,setError]=useState("")
    const [success,setSuccess]=useState("")

    async function handleSubmit(e){
        e.preventDefault()

        setError("")
        setSuccess("")

        try{
            const res=await fetch("http://localhost:3000/register",{
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

            const data=await res.json()

            if(!data.ok){
                setError(data.reason)
                return
            }

            setSuccess("Registration successful")

            setUsername("")
            setEmail("")
            setPassword("")

        }catch(e){
            setError(e.message)
        }
    }

    return(
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    value={username}
                    onChange={e=>setUsername(e.target.value)}
                    placeholder="username"
                />

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
                    Register
                </button>

            </form>

            {error&&<p>{error}</p>}
            {success&&<p>{success}</p>}

        </div>
    )
}

export default Register