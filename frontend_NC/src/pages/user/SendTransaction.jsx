import {useEffect,useState} from "react"
import {useAuth} from "../../context/AuthContext"
import {getActiveWallet} from "../../api/walletApi"

function SendTransaction(){

    const {token}=useAuth()

    const [activeWallet,setActiveWallet]=useState(null)
    const [to,setTo]=useState("")
    const [amount,setAmount]=useState("")
    const [loading,setLoading]=useState(false)
    const [result,setResult]=useState(null)
    const [error,setError]=useState("")

    async function loadActiveWallet(){
        try{
            const res=await getActiveWallet(token)

            if(res.ok){
                setActiveWallet(res.wallet)
            }
        }catch(e){
            console.error(e)
        }
    }

    useEffect(()=>{
        loadActiveWallet()
    },[token])

    async function handleSend(e){
        e.preventDefault()

        try{
            setLoading(true)
            setError("")
            setResult(null)

            const res=await fetch("http://localhost:3000/tx",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:token
                },
                body:JSON.stringify({
                    from:activeWallet.address,
                    to,
                    amount:Number(amount),
                    privateKey:activeWallet.privateKey
                })
            })

            const data=await res.json()

            if(!data.ok){
                setError(data.reason||"Transaction failed")
                return
            }

            setResult(data)
            setTo("")
            setAmount("")

        }catch(e){
            setError(e.message)
        }finally{
            setLoading(false)
        }
    }

    if(!activeWallet){
        return <div>Loading wallet...</div>
    }

    return(
        <div>

            <h1>Send Transaction</h1>

            <p>From: {activeWallet.address}</p>

            <form onSubmit={handleSend}>

                <input
                    value={to}
                    onChange={e=>setTo(e.target.value)}
                    placeholder="Recipient address"
                />

                <input
                    type="number"
                    value={amount}
                    onChange={e=>setAmount(e.target.value)}
                    placeholder="Amount"
                />

                <button disabled={loading}>
                    {loading?"Sending...":"Send"}
                </button>

            </form>

            {error&&<p>{error}</p>}

            {result&&(
                <div>
                    <p>TX Success</p>
                    <p>TxID: {result.txid}</p>
                    <p>Nonce: {result.nonce}</p>
                </div>
            )}

        </div>
    )
}

export default SendTransaction