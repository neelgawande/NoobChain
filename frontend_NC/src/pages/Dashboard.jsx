import {useEffect,useState} from "react"

export default function Dashboard(){
    const [stats,setStats]=useState({
        totalBlocks:0,
        totalTransactions:0,
        pendingTransactions:0,
        totalWallets:0,
        difficulty:0,
        height:0
    })

    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        async function fetchStats(){
            try{
                const res=await fetch("http://localhost:3000/stats")
                const data=await res.json()
                setStats(data)
            }catch(e){
                console.log(e)
            }finally{
                setLoading(false)
            }
        }

        fetchStats()
    },[])

    if(loading){
        return(
            <div className="text-white text-xl">
                Loading dashboard...
            </div>
        )
    }

    return(
        <div className="w-full">

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    Dashboard
                </h1>

                <p className="text-zinc-400">
                    Overview of the NoobChain network
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-2 font-semibold">
                        Total Blocks
                    </p>

                    <h2 className="text-4xl font-bold text-cyan-400">
                        {stats.totalBlocks}
                    </h2>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-2 font-semibold">
                        Total Transactions
                    </p>

                    <h2 className="text-4xl font-bold text-pink-400">
                        {stats.totalTransactions}
                    </h2>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-2 font-semibold">
                        Pending Transactions
                    </p>

                    <h2 className="text-4xl font-bold text-yellow-400">
                        {stats.pendingTransactions}
                    </h2>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-2 font-semibold">
                        Total Wallets
                    </p>

                    <h2 className="text-4xl font-bold text-green-400">
                        {stats.totalWallets}
                    </h2>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-2 font-semibold">
                        Current Difficulty
                    </p>

                    <h2 className="text-4xl font-bold text-red-400">
                        {stats.difficulty}
                    </h2>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-2 font-semibold">
                        Current Height
                    </p>

                    <h2 className="text-4xl font-bold text-orange-400">
                        {stats.height}
                    </h2>
                </div>

            </div>

        </div>
    )
}

