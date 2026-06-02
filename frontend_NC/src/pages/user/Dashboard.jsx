import {useEffect,useState} from "react"
import {useAuth} from "../../context/AuthContext"
import {getMe} from "../../api/authApi"
import {getActiveWallet} from "../../api/walletApi"

function Dashboard(){

    const {token}=useAuth()

    const [user,setUser]=useState(null)
    const [wallet,setWallet]=useState(null)
    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        async function loadDashboard(){

            try{
                const meData=await getMe(token)
                const walletData=await getActiveWallet(token)

                if(meData.ok){
                    setUser(meData.info)
                }

                if(walletData.ok){
                    setWallet(walletData.wallet)
                }

            }finally{
                setLoading(false)
            }
        }

        loadDashboard()
    },[token])

    if(loading){
        return <div>Loading...</div>
    }

    return (
        <div>

            <h1>Dashboard</h1>

            <h2>User</h2>

            <p>Username: {user?.username}</p>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>

            <h2>Wallet</h2>

            <p>Address: {wallet?.address}</p>
            <p>Balance: {wallet?.balance}</p>
            <p>Nonce: {wallet?.nonce}</p>

            <h2>Stats</h2>

            <p>Wallet Count: {user?.wallets?.length ?? 0}</p>

        </div>
    )
}

export default Dashboard