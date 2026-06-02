import {useEffect,useState} from "react"
import {useAuth} from "../../context/AuthContext"
import {getAllWallets,getActiveWallet,setActiveWallet as setActiveWalletApi} from "../../api/walletApi"

function Wallets(){
    const {token}=useAuth()

    const [wallets,setWallets]=useState([])
    const [activeWallet,setActiveWallet]=useState(null)
    const [loading,setLoading]=useState(true)
    const [initialBalance,setInitialBalance]=useState("")

    async function loadWallets(){
        try{
            const walletsData=await getAllWallets(token)
            const activeData=await getActiveWallet(token)

            if(walletsData.ok){
                setWallets(walletsData.wallets)
            }

            if(activeData.ok){
                setActiveWallet(activeData.wallet)
            }
        }catch(e){
            console.error(e)
        }finally{
            setLoading(false)
        }
    }

    async function handleSetActive(address){
        try{
            const result=await setActiveWalletApi(token,address)

            if(!result.ok){
                return
            }

            await loadWallets()
        }catch(e){
            console.error(e)
        }
    }

    async function handleCreateWallet(){
        try{
            const result=await createWallet(
                token,
                Number(initialBalance)||0
            )

            if(!result.ok){
                return
            }

            setInitialBalance("")

            await loadWallets()
        }catch(e){
            console.error(e)
        }
    }

    useEffect(()=>{
        loadWallets()
    },[token])

    if(loading){
        return <div>Loading...</div>
    }

    return(
        <div>

            <h1>Wallets</h1>

            <h2>Active Wallet</h2>

            {activeWallet&&(
                <div>
                    <p>Address: {activeWallet.address}</p>
                    <p>Balance: {activeWallet.balance}</p>
                    <p>Nonce: {activeWallet.nonce}</p>
                </div>
            )}

            <h2>All Wallets</h2>

            {wallets.map(wallet=>(
                <div key={wallet.address}>
                    <p>Address: {wallet.address}</p>
                    <p>Balance: {wallet.balance}</p>
                    <p>Nonce: {wallet.nonce}</p>

                    {activeWallet?.address===wallet.address
                        ? <p>Currently Active</p>
                        : <button onClick={()=>handleSetActive(wallet.address)}>Set Active</button>
                    }

                    <hr/>
                </div>
            ))}

        </div>
    )
}

export default Wallets