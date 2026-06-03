import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getAllWallets, getActiveWallet, setActiveWallet as setActiveWalletApi } from "../../api/walletApi"
import { useNavigate } from "react-router-dom"

export default function Wallets() {
    const { token } = useAuth()
    const navigate = useNavigate()

    const [wallets, setWallets] = useState([])
    const [activeWallet, setActiveWallet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [settingActive, setSettingActive] = useState(null) // address being switched to

    async function loadWallets() {
        try {
            const [walletsData, activeData] = await Promise.all([
                getAllWallets(token),
                getActiveWallet(token)
            ])
            if (walletsData.ok) setWallets(walletsData.wallets)
            if (activeData.ok)  setActiveWallet(activeData.wallet)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function handleSetActive(address) {
        setSettingActive(address)
        try {
            const result = await setActiveWalletApi(token, address)
            if (result.ok) await loadWallets()
        } catch (e) {
            console.error(e)
        } finally {
            setSettingActive(null)
        }
    }

    useEffect(() => { loadWallets() }, [token])

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-zinc-400 py-20">
                <span className="inline-block w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading wallets…
            </div>
        )
    }

    return (
        <div className="w-full max-w-3xl">

            {/* ── header ── */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white mb-1">Wallets</h1>
                    <p className="text-zinc-500">{wallets.length} wallet{wallets.length !== 1 ? "s" : ""} on your account</p>
                </div>
                <button
                    onClick={() => navigate("/wallets/create")}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                    + New Wallet
                </button>
            </div>

            {/* ── active wallet ── */}
            {activeWallet && (
                <div className="relative overflow-hidden bg-zinc-900 border border-cyan-800 rounded-2xl p-6 mb-8">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-500 opacity-10 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">Active Wallet</p>
                        <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            active
                        </span>
                    </div>
                    <p className="font-mono text-sm text-zinc-300 break-all mb-4">{activeWallet.address}</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Balance</p>
                            <p className="text-2xl font-black text-cyan-400 tabular-nums">{activeWallet.balance}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Nonce</p>
                            <p className="text-2xl font-black text-white tabular-nums">{activeWallet.nonce}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Next Nonce</p>
                            <p className="text-2xl font-black text-violet-400 tabular-nums">{activeWallet.nextNonce ?? activeWallet.nonce + 1}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── all wallets ── */}
            <div className="space-y-4">
                {wallets.map(wallet => {
                    const isActive = activeWallet?.address === wallet.address
                    return (
                        <div
                            key={wallet.address}
                            className={`bg-zinc-900 border rounded-2xl p-5 transition-colors ${
                                isActive ? "border-cyan-800" : "border-zinc-800 hover:border-zinc-700"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="font-mono text-xs text-zinc-400 break-all mb-3">
                                        {wallet.address}
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-0.5">Balance</p>
                                            <p className="font-black text-cyan-400 tabular-nums">{wallet.balance}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-0.5">Nonce</p>
                                            <p className="font-black text-white tabular-nums">{wallet.nonce}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    {isActive ? (
                                        <span className="text-xs font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-3 py-1.5 rounded-lg">
                                            Active
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleSetActive(wallet.address)}
                                            disabled={settingActive === wallet.address}
                                            className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            {settingActive === wallet.address ? "Switching…" : "Set Active"}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/wallet/${wallet.address}`)}
                                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        View details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

        </div>
    )
}
