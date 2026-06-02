import {useRef,useState} from "react" 
import {useNavigate} from "react-router-dom"

export default function BlockCard({block}){
    const [expanded,setExpanded] = useState(false)
    const txRef = useRef(null)
    const navigate = useNavigate()

    function toggleTransactions(){
        const next = !expanded
        setExpanded(next)

        if(next){
            setTimeout(()=>{
                txRef.current?.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                })
            },100)
        }
    }

    return(
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold">
                        Block #{block.height}
                    </h2>

                    <p className="text-zinc-400 text-sm mt-1">
                        {block.transactions?.length || 0} transactions
                    </p>
                </div>

                <button
                    onClick={toggleTransactions}
                    className="bg-zinc-800 hover:bg-zinc-700 transition px-4 py-2 rounded-lg text-sm"
                >
                    {expanded ? "Hide" : "Show"}
                </button>
            </div>

            <div className="space-y-5 break-all text-left">

                <div>
                    <p className="font-bold text-white mb-1">
                        Hash
                    </p>

                    <p className="text-sm text-zinc-300">
                        {block.hash}
                    </p>
                </div>

                <div>
                    <p className="font-bold text-white mb-1">
                        Previous Hash
                    </p>

                    <p className="text-sm text-zinc-300">
                        {block.header?.prevHash}
                    </p>
                </div>

                <div>
                    <p className="font-bold text-white mb-1">
                        Merkle Root
                    </p>

                    <p className="text-sm text-zinc-300">
                        {block.header?.merkleRoot}
                    </p>
                </div>

                <div>
                    <p className="font-bold text-white mb-1">
                        Nonce
                    </p>

                    <p className="text-sm text-zinc-300">
                        {block.header?.nonce}
                    </p>
                </div>

            </div>

            {expanded && (
                <div ref={txRef} className="mt-8 border-t border-zinc-800 pt-6">

                    <p className="text-xl font-bold mb-5">
                        Transactions
                    </p>

                    <div className="space-y-4">

                        {(!block.transactions || block.transactions.length===0) && (
                            <div className="text-zinc-500">
                                No transactions
                            </div>
                        )}

                        {block.transactions?.map((tx,i)=>(
                            <div
                                key={tx.txid || i}
                                className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"
                            >
                                <div className="space-y-3 break-all">

                                    <div>
                                        <span className="font-bold text-white">
                                            From:
                                        </span>{" "}
                                        <span
                                            className="text-blue-400 cursor-pointer hover:underline"
                                            onClick={()=>navigate(`/wallet/${tx.from}`)}
                                        >
                                            {tx.from}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-white">
                                            To:
                                        </span>{" "}
                                        <span
                                            className="text-blue-400 cursor-pointer hover:underline"
                                            onClick={()=>navigate(`/wallet/${tx.to}`)}
                                        >
                                            {tx.to}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-white">
                                            Amount:
                                        </span>{" "}
                                        <span className="text-zinc-300">
                                            {tx.amount}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-white">
                                            TxID:
                                        </span>

                                        <p className="text-xs text-zinc-500 mt-1">
                                            {tx.txid}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                </div>
            )}

        </div>
    )
}