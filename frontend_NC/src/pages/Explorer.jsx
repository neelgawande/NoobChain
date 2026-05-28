import {useEffect,useState} from "react"
import {getChain} from "../api/blockchain"
import BlockCard from "../components/BlockCard"

export default function Explorer(){
    const [chain,setChain] = useState([])
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        async function loadChain(){
            try{
                const data = await getChain()
                setChain(data.reverse())
            }catch(err){
                console.error(err)
            }finally{
                setLoading(false)
            }
        }

        loadChain()
    },[])

    if(loading){
        return(
            <div className="text-xl">
                Loading blockchain...
            </div>
        )
    }

    return(
        <div>
            <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2">
                    Blockchain Explorer
                </h1>

                <p className="text-zinc-400">
                    Total Blocks: {chain.length}
                </p>
            </div>

            {chain.map(block=>(
                <BlockCard
                    key={block.height}
                    block={block}
                    txs={block.transactions}
                />
            ))}
        </div>
    )
}