import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getMe } from "../../api/authApi"
import { getActiveWallet } from "../../api/walletApi"

const BASE = "http://localhost:3000"

// ── tiny helpers ──────────────────────────────────────────────────────────────

function truncate(str = "", n = 14) {
    if (str.length <= n) return str
    return str.slice(0, 6) + "…" + str.slice(-6)
}

function StatCard({ label, value, accent, icon }) {
    return (
        <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-6 group hover:border-zinc-600 transition-colors duration-300">
            {/* faint glow blob */}
            <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
                style={{ background: accent }}
            />
            <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                <span
                    className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-lg"
                    style={{ background: accent + "22", color: accent }}
                >
                    live
                </span>
            </div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
                {label}
            </p>
            <p className="text-4xl font-black tabular-nums" style={{ color: accent }}>
                {value ?? "—"}
            </p>
        </div>
    )
}

function InfoRow({ label, value, mono }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
            <span className="text-zinc-500 text-sm">{label}</span>
            <span className={`text-sm font-semibold text-white ${mono ? "font-mono" : ""}`}>
                {value ?? "—"}
            </span>
        </div>
    )
}

// ── main component ─────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { token } = useAuth()

    const [user, setUser] = useState(null)
    const [wallet, setWallet] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        async function loadAll() {
            try {
                const [meData, walletData, statsRes] = await Promise.all([
                    getMe(token),
                    getActiveWallet(token),
                    fetch(`${BASE}/stats`).then(r => r.json())
                ])
                if (meData.ok)     setUser(meData.info)
                if (walletData.ok) setWallet(walletData.wallet)
                setStats(statsRes)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        loadAll()
    }, [token])

    function copyAddress() {
        if (!wallet?.address) return
        navigator.clipboard.writeText(wallet.address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-zinc-400 py-20">
                <span className="inline-block w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading dashboard…
            </div>
        )
    }

    const globalStats = [
        { label: "Chain Height",          value: stats?.height,              accent: "#22d3ee", icon: "⛓" },
        { label: "Total Blocks",           value: stats?.totalBlocks,         accent: "#a78bfa", icon: "🧱" },
        { label: "Total Transactions",     value: stats?.totalTransactions,   accent: "#f472b6", icon: "⚡" },
        { label: "Pending Transactions",   value: stats?.pendingTransactions, accent: "#fbbf24", icon: "⏳" },
        { label: "Total Wallets",          value: stats?.totalWallets,        accent: "#34d399", icon: "👛" },
        { label: "Mining Difficulty",      value: stats?.difficulty,          accent: "#fb923c", icon: "⛏" },
    ]

    return (
        <div className="w-full max-w-6xl space-y-10">

            {/* ── header ── */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-zinc-500 text-sm font-semibold uppercase tracking-widest mb-1">
                        Welcome back
                    </p>
                    <h1 className="text-4xl font-black text-white">
                        {user?.username ?? "Anon"}
                        <span className="text-zinc-600">.</span>
                    </h1>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest bg-zinc-800 border border-zinc-700 text-zinc-400 px-3 py-1.5 rounded-xl">
                    {user?.role ?? "user"}
                </span>
            </div>

            {/* ── user + wallet cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* user card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-lg font-black">
                            {user?.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                            <p className="font-bold text-white leading-none">{user?.username}</p>
                            <p className="text-zinc-500 text-xs mt-0.5">{user?.email}</p>
                        </div>
                    </div>
                    <InfoRow label="Email"    value={user?.email} />
                    <InfoRow label="Role"     value={user?.role} />
                    <InfoRow label="Wallets"  value={user?.wallets?.length ?? 0} />
                </div>

                {/* active wallet card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">👛</span>
                            <p className="font-bold text-white">Active Wallet</p>
                        </div>
                        <button
                            onClick={copyAddress}
                            className="text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            {copied ? "✓ Copied" : "Copy address"}
                        </button>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 mb-4 font-mono text-xs text-zinc-400 break-all">
                        {wallet?.address ?? "No wallet found"}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Balance</p>
                            <p className="text-2xl font-black text-cyan-400 tabular-nums">
                                {wallet?.balance ?? 0}
                            </p>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Nonce</p>
                            <p className="text-2xl font-black text-violet-400 tabular-nums">
                                {wallet?.nonce ?? 0}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── global stats ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl font-black text-white">Network Stats</h2>
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        live
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {globalStats.map(s => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>
            </div>

        </div>
    )
}
