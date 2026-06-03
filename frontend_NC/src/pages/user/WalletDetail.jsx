import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function StatPill({ label, value, color }) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
            <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
        </div>
    )
}

function formatTime(ts) {
    if (!ts) return "—"
    const d = new Date(ts)
    if (isNaN(d.getTime())) return "—"
    return d.toISOString().replace("T", " ").split(".")[0]
}

export default function WalletDetail() {
    const { address } = useParams()
    const { token } = useAuth()
    const navigate = useNavigate()

    const [wallet, setWallet] = useState(null)
    const [txs, setTxs] = useState([])
    const [stats, setStats] = useState({ sent: 0, received: 0, net: 0 })
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [copied, setCopied] = useState(false)

    function copyAddress() {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    useEffect(() => {
        async function load() {
            try {
                const [walletRes, chainRes] = await Promise.all([
                    fetch(`http://localhost:3000/wallet/${address}`),
                    fetch("http://localhost:3000/chain")
                ])
                const walletData = await walletRes.json()
                const chainData  = await chainRes.json()

                if (!walletRes.ok || !walletData.address) {
                    setNotFound(true)
                    return
                }

                setWallet(walletData)

                if (Array.isArray(chainData)) {
                    const related = []
                    let sent = 0, received = 0

                    for (const block of chainData) {
                        for (const tx of (block.transactions || [])) {
                            const isFrom = tx.from === address
                            const isTo   = tx.to   === address
                            if (!isFrom && !isTo) continue

                            const type = isFrom ? "sent" : "received"
                            if (isFrom) sent     += Number(tx.amount)
                            if (isTo)   received += Number(tx.amount)

                            related.push({
                                ...tx,
                                type,
                                blockHeight: block.height,
                                timestamp: block.header?.timestamp
                            })
                        }
                    }

                    setTxs(related.reverse())
                    setStats({ sent, received, net: received - sent })
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [address])

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-zinc-400 py-20">
                <span className="inline-block w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading wallet…
            </div>
        )
    }

    if (notFound || !wallet) {
        return (
            <div className="max-w-xl">
                <div className="bg-red-950 border border-red-800 rounded-2xl p-6 text-red-300">
                    Wallet not found for address <span className="font-mono">{address}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-3xl">

            {/* ── header ── */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1"
                >
                    ← Back
                </button>
                <h1 className="text-4xl font-black text-white mb-1">Wallet</h1>
                <p className="text-zinc-500">Transaction history and balance overview</p>
            </div>

            {/* ── address card ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Address</p>
                    <button
                        onClick={copyAddress}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        {copied ? "✓ copied" : "copy"}
                    </button>
                </div>
                <p className="font-mono text-sm text-zinc-300 break-all mb-5">{wallet.address}</p>
                <div className="grid grid-cols-3 gap-4">
                    <StatPill label="Balance"    value={wallet.balance}                              color="text-cyan-400" />
                    <StatPill label="Nonce"      value={wallet.nonce}                                color="text-white" />
                    <StatPill label="Next Nonce" value={wallet.nextNonce ?? wallet.nonce + 1}        color="text-violet-400" />
                </div>
            </div>

            {/* ── flow stats ── */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <StatPill label="Total Sent"     value={stats.sent}     color="text-red-400" />
                <StatPill label="Total Received" value={stats.received} color="text-green-400" />
                <StatPill label="Net Flow"       value={stats.net >= 0 ? `+${stats.net}` : stats.net}
                          color={stats.net >= 0 ? "text-green-400" : "text-red-400"} />
            </div>

            {/* ── tx history ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl font-black text-white">Transaction History</h2>
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-xs text-zinc-500">{txs.length} tx{txs.length !== 1 ? "s" : ""}</span>
                </div>

                {txs.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
                        No transactions found for this wallet
                    </div>
                ) : (
                    <div className="space-y-3">
                        {txs.map((tx, i) => (
                            <div
                                key={tx.txid || i}
                                className={`bg-zinc-900 border rounded-2xl p-5 ${
                                    tx.type === "sent"     ? "border-red-900"
                                  : tx.type === "received" ? "border-green-900"
                                  : "border-zinc-800"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                                            tx.type === "sent"
                                                ? "bg-red-950 text-red-400"
                                                : "bg-green-950 text-green-400"
                                        }`}>
                                            {tx.type}
                                        </span>
                                        <span className="text-xs text-zinc-500">Block #{tx.blockHeight}</span>
                                    </div>
                                    <span className={`text-lg font-black tabular-nums ${
                                        tx.type === "sent" ? "text-red-400" : "text-green-400"
                                    }`}>
                                        {tx.type === "sent" ? "-" : "+"}{tx.amount}
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

                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                    <p className="font-mono text-xs text-zinc-600 truncate flex-1 mr-4" title={tx.txid}>
                                        {tx.txid}
                                    </p>
                                    <p className="text-xs text-zinc-500 shrink-0">{formatTime(tx.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}
