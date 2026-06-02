export async function getMe(token){
    const res=await fetch("http://localhost:3000/me",{
        headers:{
            Authorization:token
        }
    })

    return await res.json()
}