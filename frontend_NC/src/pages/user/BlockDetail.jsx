import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

function HashBox({ label, value }) {
    const [copied, setCopied] = useState(false)
    function copy() {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
                <button onClick={copy} className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
                    {copied ? "✓ copied" : "copy"}
                </button>
            </div>
            <p className="font-mono text-xs text-zinc-400 break-all bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                {value || "—"}
            </p>
        </div>
    )
}

export default function BlockDetail() {
    const { height } = useParams()
    const navigate = useNavigate()

    const [block, setBlock] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                // Fetch only the specific block by height instead of the whole chain
                const res = await fetch(`http://localhost:3000/block/${height}`)
                if (!res.ok) {
                    setNotFound(true)
                    return
                }
                const data = await res.json()
                if (!data || data.height === undefined) {
                    setNotFound(true)
                    return
                }
                setBlock(data)
            } catch (e) {
                console.error(e)
                setNotFound(true)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [height])

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-zinc-400 py-20">
                <span className="inline-block w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading block…
            </div>
        )
    }

    if (notFound || !block) {
        return (
            <div className="max-w-xl">
                <div className="bg-red-950 border border-red-800 rounded-2xl p-6 text-red-300">
                    Block #{height} not found on the chain.
                </div>
            </div>
        )
    }

    const txCount = block.transactions?.length || 0
    const isGenesis = block.height === 0
    const timestamp = block.header?.timestamp
        ? new Date(block.header.timestamp).toISOString().replace("T", " ").split(".")[0]
        : "—"

    return (
        <div className="w-full max-w-3xl">

            {/* ── back + header ── */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1"
                >
                    ← Back
                </button>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-1">
                            {isGenesis ? "Genesis Block" : `Block #${block.height}`}
                        </h1>
                        <p className="text-zinc-500">{timestamp}</p>
                    </div>
                    <span className="font-mono text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl">
                        nonce: {block.header?.nonce}
                    </span>
                </div>
            </div>

            {/* ── meta stats ── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Height</p>
                    <p className="text-2xl font-black text-white tabular-nums">{block.height}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Transactions</p>
                    <p className="text-2xl font-black text-cyan-400 tabular-nums">{txCount}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Mining Nonce</p>
                    <p className="text-2xl font-black text-violet-400 tabular-nums">{block.header?.nonce}</p>
                </div>
            </div>

            {/* ── hashes ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 mb-6">
                <HashBox label="Hash"          value={block.hash} />
                <HashBox label="Previous Hash" value={block.header?.prevHash} />
                <HashBox label="Merkle Root"   value={block.header?.merkleRoot} />
            </div>

            {/* ── transactions ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl font-black text-white">Transactions</h2>
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-xs text-zinc-500">{txCount} tx{txCount !== 1 ? "s" : ""}</span>
                </div>

                {txCount === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
                        {isGenesis ? "Genesis block has no transactions" : "No transactions in this block"}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {block.transactions.map((tx, i) => (
                            <div key={tx.txid || i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                        Tx #{i + 1}
                                    </span>
                                    <span className="text-lg font-black text-cyan-400 tabular-nums">
                                        {tx.amount}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">From</p>
                                        <p
                                            className="font-mono text-xs text-violet-400 hover:text-violet-300 cursor-pointer truncate transition-colors"
                                            onClick={() => navigate(`/wallet/${tx.from}`)}
                                            title={tx.from}
                                        >
                                            {tx.from}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">To</p>
                                        <p
                                            className="font-mono text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer truncate transition-colors"
                                            onClick={() => navigate(`/wallet/${tx.to}`)}
                                            title={tx.to}
                                        >
                                            {tx.to}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-zinc-800">
                                    <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">TxID</p>
                                    <p className="font-mono text-xs text-zinc-500 break-all">{tx.txid}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}
