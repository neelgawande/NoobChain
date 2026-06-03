import {useEffect,useState} from "react"
import {useParams} from "react-router-dom"

function BlockDetail(){

    const {height}=useParams()

    const [block,setBlock]=useState(null)
    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        async function load(){
            try{
                const res=await fetch("http://localhost:3000/chain")
                const data=await res.json()

                if(Array.isArray(data)){

                    const found=data.find(b=>String(b.height)===String(height))

                    setBlock(found || null)
                }

            }catch(e){
                console.error(e)
            }finally{
                setLoading(false)
            }
        }

        load()
    },[height])

    if(loading){
        return <div>Loading block...</div>
    }

    if(!block){
        return <div>Block not found</div>
    }

    return(
        <div>

            <h1>Block #{block.height}</h1>

            <p><b>Hash:</b> {block.hash}</p>
            <p><b>Previous Hash:</b> {block.header?.prevHash}</p>
            <p><b>Nonce:</b> {block.header?.nonce}</p>
            <p><b>Merkle Root:</b> {block.header?.merkleRoot}</p>
            <p><b>Timestamp:</b> {block.header?.timestamp}</p>

            <h2 className="text-xl font-bold mt-6 mb-3">
                Transactions
            </h2>

            {(!block.transactions || block.transactions.length===0) && (
                <p>No transactions in this block</p>
            )}

            <div className="space-y-3">

                {block.transactions?.map((tx,i)=>(
                    <div
                        key={tx.txid || i}
                        className="border border-zinc-800 p-4 rounded-lg"
                    >

                        <p><b>From:</b> {tx.from}</p>
                        <p><b>To:</b> {tx.to}</p>
                        <p><b>Amount:</b> {tx.amount}</p>
                        <p className="text-xs text-zinc-500">{tx.txid}</p>

                    </div>
                ))}

            </div>

        </div>
    )
}

export default BlockDetail