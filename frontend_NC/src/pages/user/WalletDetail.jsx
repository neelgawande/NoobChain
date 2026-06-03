import {useEffect,useState} from "react"
import {useParams} from "react-router-dom"
import {useAuth} from "../../context/AuthContext"

function WalletDetail(){
    const {address}=useParams()
    const {token}=useAuth()
    const [wallet,setWallet]=useState(null)
    const [txs,setTxs]=useState([])
    const [stats,setStats]=useState({
        sent:0,
        received:0,
        net:0
    })
    const [loading,setLoading]=useState(true)
    function formatTime(ts){
        if(!ts) return "no timestamp"
        const d=new Date(ts)
        if(isNaN(d.getTime())){
            return "invalid time"
        }
        return d.toISOString().replace("T"," ").split(".")[0]
    }

    useEffect(()=>{
        async function load(){
            try{
                const walletRes=await fetch(`http://localhost:3000/wallet/${address}`)
                const walletData=await walletRes.json()
                const chainRes=await fetch("http://localhost:3000/chain")
                const chainData=await chainRes.json()
                if(walletData){
                    setWallet(walletData)
                }
                if(Array.isArray(chainData)){
                    const related=[]
                    let sent=0
                    let received=0
                    for(const block of chainData){
                        for(const tx of (block.transactions||[])){
                            const isFrom = tx.from===address
                            const isTo = tx.to===address
                            if(!isFrom && !isTo) continue
                            let type="unknown"
                            if(isFrom){
                                type="sent"
                                sent+=Number(tx.amount)
                            }
                            if(isTo){
                                type="received"
                                received+=Number(tx.amount)
                            }
                            related.push({
                                ...tx,
                                type,
                                blockHeight:block.height,
                                timestamp:block.header?.timestamp
                            })
                        }
                    }
                    setTxs(related.reverse())
                    setStats({
                        sent,
                        received,
                        net:received-sent
                    })
                }
            }catch(e){
                console.error(e)
            }finally{
                setLoading(false)
            }
        }
        load()
    },[address,token])
    if(loading){
        return <div>Loading wallet...</div>
    }
    if(!wallet){
        return <div>Wallet not found</div>
    }
    return(
        <div>
            <h1>Wallet Detail</h1>
            <div className="mb-6">
                <p>Address: {wallet.address}</p>
                <p>Balance: {wallet.balance}</p>
                <p>Nonce: {wallet.nonce}</p>
                <p>Next Nonce: {wallet.nextNonce}</p>
            </div>
            <div className="mb-6 border border-zinc-800 p-4 rounded-lg">
                <h2 className="font-bold mb-2">Flow Stats</h2>
                <p>Sent: {stats.sent}</p>
                <p>Received: {stats.received}</p>
                <p>Net: {stats.net}</p>
            </div>
            <h2 className="text-xl font-bold mb-3">
                Transaction History
            </h2>
            {txs.length===0 && (
                <p>No transactions found</p>
            )}
            <div className="space-y-4">
                {txs.map((tx,i)=>(
                    <div
                        key={tx.txid||i}
                        className={`border p-4 rounded-lg ${
                            tx.type==="sent"
                                ? "border-red-800"
                                : tx.type==="received"
                                    ? "border-green-800"
                                    : "border-zinc-800"
                        }`}
                    >

                        <p>
                            <b>Block:</b> #{tx.blockHeight}
                        </p>
                        <p>
                            <b>Type:</b>{" "}
                            <span className={
                                tx.type==="sent"
                                    ? "text-red-400"
                                    : tx.type==="received"
                                        ? "text-green-400"
                                        : "text-zinc-400"
                            }>
                                {tx.type.toUpperCase()}
                            </span>
                        </p>
                        <p>
                            <b>From:</b> {tx.from}
                        </p>
                        <p>
                            <b>To:</b> {tx.to}
                        </p>
                        <p>
                            <b>Amount:</b> {tx.amount}
                        </p>
                        <p>
                            <b>Time:</b> {formatTime(tx.timestamp)}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {tx.txid}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default WalletDetail