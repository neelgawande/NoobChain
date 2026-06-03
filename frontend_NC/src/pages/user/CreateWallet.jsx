import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { createWallet } from "../../api/walletApi"

export default function CreateWallet() {
    const { token } = useAuth()
    const navigate = useNavigate()

    const [initialBalance, setInitialBalance] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const balance = Number(initialBalance) || 0

        if (!Number.isInteger(balance) || balance < 0) {
            setError("Initial balance must be a non-negative whole number")
            setLoading(false)
            return
        }

        try {
            const result = await createWallet(token, balance)
            if (!result.ok) {
                setError(result.reason || "Failed to create wallet")
                return
            }
            navigate("/wallets")
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">

            {/* ── header ── */}
            <div className="mb-8">
                <button
                    onClick={() => navigate("/wallets")}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1"
                >
                    ← Back to Wallets
                </button>
                <h1 className="text-4xl font-black text-white mb-1">New Wallet</h1>
                <p className="text-zinc-500">Generate a fresh keypair on the network</p>
            </div>

            {/* ── form ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Initial Balance
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={initialBalance}
                        onChange={e => { setInitialBalance(e.target.value); setError("") }}
                        placeholder="1000"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors tabular-nums"
                    />
                    <p className="mt-2 text-xs text-zinc-600">
                        Leave blank to default to 1000
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating…
                        </span>
                    ) : "Create Wallet"}
                </button>

            </div>

            {/* ── error ── */}
            {error && (
                <div className="mt-5 bg-red-950 border border-red-800 rounded-2xl px-5 py-4 text-red-300 text-sm">
                    {error}
                </div>
            )}

        </div>
    )
}
