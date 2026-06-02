export async function getActiveWallet(token){
    const res=await fetch("http://localhost:3000/me/wallets/active",{
        headers:{
            Authorization:token
        }
    })

    return await res.json()
}

export async function getAllWallets(token){
    const res=await fetch("http://localhost:3000/me/wallets/all",{
        headers:{
            Authorization:token
        }
    })
    return await res.json()
}

export async function setActiveWallet(token,address){
    const res=await fetch("http://localhost:3000/me/wallets/active",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:token
        },
        body:JSON.stringify({address})
    })
    return await res.json()
}

export async function createWallet(token,initialBalance){
    const res=await fetch("http://localhost:3000/me/wallets",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:token
        },
        body:JSON.stringify({initialBalance})
    })
    return await res.json()
}