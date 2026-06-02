import {useEffect,useState} from "react"
import {useParams} from "react-router-dom"

function WalletDetail(){

    const {address}=useParams()

    const [wallet,setWallet]=useState(null)
    const [txs,setTxs]=useState([])
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

                    for(const block of chainData){
                        for(const tx of (block.transactions||[])){
                            if(tx.from===address || tx.to===address){
                                related.push({
                                    ...tx,
                                    blockHeight:block.height,
                                    timestamp:block.header?.timestamp
                                })
                            }
                        }
                    }

                    setTxs(related.reverse())
                }

            }catch(e){
                console.error(e)
            }finally{
                setLoading(false)
            }
        }

        load()
    },[address])

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
                        className="border border-zinc-800 p-4 rounded-lg"
                    >

                        <p>
                            <b>Block:</b> #{tx.blockHeight}
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
                            raw timestamp: {tx.timestamp}
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