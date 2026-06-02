import {useState,useEffect} from "react"

export default function Mine(){

    const [loading,setLoading]=useState(false)
    const [result,setResult]=useState(null)
    const [pending,setPending]=useState(0)

    async function loadPending(){
        try{
            const res=await fetch("http://localhost:3000/stats/pending")
            const data=await res.json()
            setPending(data.pendingTransactions||0)
        }catch(e){
            setPending(0)
        }
    }

    useEffect(()=>{
        loadPending()
    },[])

    async function handleMine(){

        if(pending<=0){
            setResult({
                ok:false,
                reason:"No pending transactions"
            })
            return
        }

        setLoading(true)
        setResult(null)

        try{

            const res=await fetch("http://localhost:3000/mine",{
                method:"POST"
            })

            const data=await res.json()

            setResult(data)

            await loadPending()

        }catch(e){

            setResult({
                ok:false,
                reason:"Failed to connect to backend"
            })

        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="max-w-3xl">

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    Mine Block
                </h1>

                <p className="text-zinc-400">
                    Mine pending transactions into a new block
                </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                <div className="mb-6">
                    <p className="text-zinc-300 leading-relaxed">
                        Clicking the button below will take pending transactions
                        from the mempool, create a new block, solve proof-of-work,
                        validate the block, and append it to the blockchain.
                    </p>
                </div>

                <div className="mb-8">
                    <p className="text-zinc-400">
                        Pending Transactions:
                        {" "}
                        <span className="text-white font-bold">
                            {pending}
                        </span>
                    </p>
                </div>

                <button
                    onClick={handleMine}
                    disabled={loading||pending<=0}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 transition px-6 py-3 rounded-xl font-bold"
                >
                    {loading?"Mining...":"Mine New Block"}
                </button>

            </div>

            {result && (
                <div className={`mt-6 border rounded-2xl p-6 ${
                    result.ok
                    ? "bg-green-950 border-green-700"
                    : "bg-red-950 border-red-700"
                }`}>

                    {result.ok ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">
                                Block Mined Successfully
                            </h2>
                            <p>
                                <span className="font-bold">
                                    New Height:
                                </span>
                                {" "}
                                {result.height}
                            </p>
                        </>
                    ):(
                        <>
                            <h2 className="text-2xl font-bold mb-4">
                                Mining Failed
                            </h2>
                            <p>
                                {result.reason}
                            </p>
                        </>
                    )}

                </div>
            )}

        </div>
    )
}