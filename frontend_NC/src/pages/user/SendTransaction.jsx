import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getActiveWallet } from "../../api/walletApi"

export default function SendTransaction() {
    const { token } = useAuth()

    const [activeWallet, setActiveWallet] = useState(null)
    const [to, setTo] = useState("")
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState("")
    const [walletLoading, setWalletLoading] = useState(true)

    async function loadActiveWallet() {
        try {
            const res = await getActiveWallet(token)
            if (res.ok) setActiveWallet(res.wallet)
        } catch (e) {
            console.error(e)
        } finally {
            setWalletLoading(false)
        }
    }

    useEffect(() => {
        loadActiveWallet()
    }, [token])

    async function handleSend(e) {
        e.preventDefault()
        setLoading(true)
        setError("")
        setResult(null)

        try {
            const parsedAmount = Number(amount)

            if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
                setError("Amount must be a positive whole number")
                return
            }

            if (!to.trim()) {
                setError("Recipient address is required")
                return
            }

            if (to.trim() === activeWallet.address) {
                setError("Cannot send to your own address")
                return
            }

            const res = await fetch("http://localhost:3000/tx", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify({
                    from: activeWallet.address,
                    to: to.trim(),
                    amount: parsedAmount,
                    privateKey: activeWallet.privateKey
                })
            })

            const data = await res.json()

            if (!data.ok) {
                setError(data.reason || "Transaction failed")
                return
            }

            setResult(data)
            setTo("")
            setAmount("")

            // Refresh wallet balance so the new balance shows immediately
            await loadActiveWallet()

        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    if (walletLoading) {
        return (
            <div className="flex items-center gap-3 text-zinc-400 py-20">
                <span className="inline-block w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading wallet…
            </div>
        )
    }

    if (!activeWallet) {
        return (
            <div className="max-w-xl">
                <div className="bg-red-950 border border-red-800 rounded-2xl p-6 text-red-300">
                    No active wallet found. Please create or activate a wallet first.
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-xl">

            {/* ── header ── */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white mb-1">Send</h1>
                <p className="text-zinc-500">Broadcast a transaction to the network</p>
            </div>

            {/* ── sender badge ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Sending from</p>
                    <p className="font-mono text-sm text-zinc-300 truncate">{activeWallet.address}</p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Balance</p>
                    <p className="text-lg font-black text-cyan-400 tabular-nums">{activeWallet.balance}</p>
                </div>
            </div>

            {/* ── form ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Recipient Address
                    </label>
                    <input
                        value={to}
                        onChange={e => { setTo(e.target.value); setError(""); setResult(null) }}
                        placeholder="Enter wallet address…"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors font-mono"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Amount
                    </label>
                    <div className="relative pb-5">
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={e => { setAmount(e.target.value); setError(""); setResult(null) }}
                            placeholder="0"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors tabular-nums"
                        />
                        {amount && Number(amount) > activeWallet.balance && (
                            <p className="absolute bottom-0 left-0 text-xs text-red-400">
                                Exceeds available balance
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSend}
                    disabled={loading || !to || !amount}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                        </span>
                    ) : "Send Transaction"}
                </button>

            </div>

            {/* ── error ── */}
            {error && (
                <div className="mt-5 bg-red-950 border border-red-800 rounded-2xl px-5 py-4 text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* ── success ── */}
            {result && (
                <div className="mt-5 bg-green-950 border border-green-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-green-400 text-lg">✓</span>
                        <p className="font-black text-green-300">Transaction Broadcast</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">TxID</p>
                        <p className="font-mono text-xs text-zinc-300 break-all">{result.txid}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Nonce</p>
                            <p className="font-mono text-sm text-white">{result.nonce}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">New Balance</p>
                            <p className="font-mono text-sm text-cyan-400">{activeWallet.balance}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
