import { useState } from "react"

export default function SendTransaction() {

    const [form, setForm] = useState({
        from: "",
        to: "",
        amount: "",
        privateKey: ""
    })

    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [walletLoading, setWalletLoading] = useState(false)
    const [walletInfo, setWalletInfo] = useState(null)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
        // Clear wallet info if sender address changes
        if (e.target.name === "from") {
            setWalletInfo(null)
            setForm(prev => ({ ...prev, from: e.target.value, privateKey: "" }))
        }
    }

    // Fetch wallet and auto-populate the private key.
    async function fetchWallet() {
        if (!form.from.trim()) return
        setWalletLoading(true)
        try {
            const res = await fetch(`http://localhost:3000/wallet/${form.from.trim()}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.reason || "wallet not found")

            // Normalize the PEM key at the point it enters the app.
            // JSON strings encode newlines as \n (two chars). We convert them
            // to real newlines here so the key is always valid PEM in state.
            const normalizedKey = (data.privateKey || "").replace(/\\n/g, "\n").trim()

            setWalletInfo(data)
            setForm(prev => ({ ...prev, privateKey: normalizedKey }))
        } catch (e) {
            setResult({ ok: false, reason: e.message })
        } finally {
            setWalletLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const amount = Number(form.amount)

            if (!Number.isInteger(amount) || amount <= 0) {
                throw new Error("Amount must be a positive whole number")
            }

            // Normalize again at send time as a safety net in case the user
            // manually edited the textarea and introduced literal \n sequences.
            const normalizedKey = form.privateKey.replace(/\\n/g, "\n").trim()

            if (!normalizedKey.startsWith("-----BEGIN")) {
                throw new Error("Private key does not look like a valid PEM key")
            }

            const res = await fetch("http://localhost:3000/tx", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    from: form.from.trim(),
                    to: form.to.trim(),
                    amount,
                    privateKey: normalizedKey
                })
            })

            const data = await res.json()
            setResult(data)

        } catch (e) {
            setResult({ ok: false, reason: e.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl">

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Send Transaction</h1>
                <p className="text-zinc-400">
                    Create and broadcast a transaction to the NoobChain network
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
            >
                {/* Sender — with fetch button to auto-load private key */}
                <div className="mb-6">
                    <label className="block mb-2 font-semibold">Sender Address</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="from"
                            value={form.from}
                            onChange={handleChange}
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                            required
                        />
                        <button
                            type="button"
                            onClick={fetchWallet}
                            disabled={walletLoading || !form.from.trim()}
                            className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap"
                        >
                            {walletLoading ? "Loading..." : "Load Wallet"}
                        </button>
                    </div>
                    {walletInfo && (
                        <p className="mt-2 text-sm text-zinc-400">
                            Balance: <span className="text-white font-mono">{walletInfo.balance}</span>
                            &nbsp;·&nbsp;
                            Next nonce: <span className="text-white font-mono">{walletInfo.nextNonce}</span>
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-semibold">Receiver Address</label>
                    <input
                        type="text"
                        name="to"
                        value={form.to}
                        onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-semibold">Amount</label>
                    <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                        required
                    />
                </div>

                <div className="mb-8">
                    <label className="block mb-2 font-semibold">
                        Private Key
                        {walletInfo && (
                            <span className="ml-2 text-green-400 text-xs font-normal">
                                ✓ auto-loaded from wallet
                            </span>
                        )}
                    </label>
                    <textarea
                        name="privateKey"
                        value={form.privateKey}
                        onChange={e => setForm(prev => ({ ...prev, privateKey: e.target.value }))}
                        rows={8}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm"
                        placeholder="Click 'Load Wallet' above to auto-populate, or paste your PEM private key here"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 px-6 py-3 rounded-xl font-bold"
                >
                    {loading ? "Sending..." : "Send Transaction"}
                </button>
            </form>

            {result && (
                <div className={`mt-6 border rounded-2xl p-6 ${
                    result.ok
                        ? "bg-green-950 border-green-700"
                        : "bg-red-950 border-red-700"
                }`}>
                    {result.ok ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">Transaction Successful</h2>
                            <p className="text-zinc-400 text-sm mb-1">TXID</p>
                            <p className="break-all font-mono text-sm">{result.txid}</p>
                            <p className="text-zinc-400 text-sm mt-3 mb-1">Nonce</p>
                            <p className="font-mono text-sm">{result.nonce}</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-4">Transaction Failed</h2>
                            <p className="break-all">{result.reason}</p>
                        </>
                    )}
                </div>
            )}

        </div>
    )
}