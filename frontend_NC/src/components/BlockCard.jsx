import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

function HashDisplay({ label, value }) {
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
                <button
                    onClick={copy}
                    className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                    {copied ? "✓ copied" : "copy"}
                </button>
            </div>
            <p className="font-mono text-xs text-zinc-400 break-all bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                {value || "—"}
            </p>
        </div>
    )
}

function TxCard({ tx }) {
    const navigate = useNavigate()
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Transaction</span>
                <span className="text-xs font-black text-cyan-400 tabular-nums">
                    +{tx.amount}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">From</p>
                    <p
                        className="text-sm text-violet-400 hover:text-violet-300 cursor-pointer font-mono truncate transition-colors"
                        onClick={() => navigate(`/wallet/${tx.from}`)}
                        title={tx.from}
                    >
                        {tx.from}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">To</p>
                    <p
                        className="text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer font-mono truncate transition-colors"
                        onClick={() => navigate(`/wallet/${tx.to}`)}
                        title={tx.to}
                    >
                        {tx.to}
                    </p>
                </div>
            </div>

            <div>
                <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">TxID</p>
                <p className="font-mono text-xs text-zinc-500 break-all">{tx.txid}</p>
            </div>

            <div className="flex items-center gap-4 pt-1 border-t border-zinc-800">
                <span className="text-xs text-zinc-600">
                    Nonce <span className="text-zinc-400 font-mono">{tx.nonce}</span>
                </span>
                <span className="text-xs text-zinc-600">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : ""}
                </span>
            </div>
        </div>
    )
}

export default function BlockCard({ block }) {
    const [expanded, setExpanded] = useState(false)
    const txRef = useRef(null)
    const txCount = block.transactions?.length || 0
    const isGenesis = block.height === 0

    function toggleTransactions() {
        const next = !expanded
        setExpanded(next)
        if (next) {
            setTimeout(() => {
                txRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }, 100)
        }
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-5 hover:border-zinc-700 transition-colors duration-200">

            {/* ── header bar ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 font-black text-sm text-white tabular-nums">
                        #{block.height}
                    </div>
                    <div>
                        <p className="font-bold text-white leading-none">
                            {isGenesis ? "Genesis Block" : `Block #${block.height}`}
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                            {txCount === 0
                                ? "No transactions"
                                : `${txCount} transaction${txCount !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-mono bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                        nonce <span className="text-white">{block.header?.nonce}</span>
                    </span>

                    {txCount > 0 && (
                        <button
                            onClick={toggleTransactions}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                                expanded
                                    ? "bg-zinc-700 text-white"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            }`}
                        >
                            {expanded ? "Hide txs" : "Show txs"}
                        </button>
                    )}
                </div>
            </div>

            {/* ── hash fields ── */}
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <HashDisplay label="Hash"          value={block.hash} />
                <HashDisplay label="Previous Hash" value={block.header?.prevHash} />
                <HashDisplay label="Merkle Root"   value={block.header?.merkleRoot} />
            </div>

            {/* ── transactions ── */}
            {expanded && (
                <div ref={txRef} className="border-t border-zinc-800 px-6 py-5">
                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">
                        Transactions
                    </p>
                    <div className="space-y-3">
                        {block.transactions.map((tx, i) => (
                            <TxCard key={tx.txid || i} tx={tx} />
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
