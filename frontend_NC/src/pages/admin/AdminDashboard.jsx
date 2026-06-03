import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"

function StatCard({ label, value, accent, icon }) {
    return (
        <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl"
                style={{ background: accent }}
            />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
            <p className="text-3xl font-black tabular-nums" style={{ color: accent }}>
                {value ?? "—"}
            </p>
        </div>
    )
}

export default function AdminDashboard() {
    const { user } = useAuth()

    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const res = await fetch("http://localhost:3000/stats")
                const data = await res.json()
                setStats(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const isGod = user?.role === "god"

    return (
        <div className="w-full max-w-4xl space-y-8">

            {/* ── header ── */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white mb-1">Admin</h1>
                    <p className="text-zinc-500">Welcome back, {user?.username || "Admin"}</p>
                </div>
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                    isGod
                        ? "text-purple-300 border-purple-800 bg-purple-950"
                        : "text-pink-300 border-pink-800 bg-pink-950"
                }`}>
                    {user?.role}
                </span>
            </div>

            {/* ── quick actions ── */}
            <div className="grid md:grid-cols-2 gap-4">
                <Link
                    to="/admin/users"
                    className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-black text-white">Users</h2>
                        <span className="text-zinc-600 group-hover:text-zinc-300 transition-colors text-sm">→</span>
                    </div>
                    <p className="text-zinc-500 text-sm">View and manage all registered users and their roles</p>
                </Link>

                <Link
                    to="/explorer"
                    className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-black text-white">Explorer</h2>
                        <span className="text-zinc-600 group-hover:text-zinc-300 transition-colors text-sm">→</span>
                    </div>
                    <p className="text-zinc-500 text-sm">Browse all blocks and transactions on the chain</p>
                </Link>
            </div>

            {/* ── system stats ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl font-black text-white">System Stats</h2>
                    <div className="flex-1 h-px bg-zinc-800" />
                    {loading && (
                        <span className="inline-block w-4 h-4 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard label="Chain Height"        value={stats?.height}              accent="#22d3ee" />
                    <StatCard label="Total Blocks"        value={stats?.totalBlocks}         accent="#a78bfa" />
                    <StatCard label="Total Transactions"  value={stats?.totalTransactions}   accent="#f472b6" />
                    <StatCard label="Pending"             value={stats?.pendingTransactions} accent="#fbbf24" />
                    <StatCard label="Total Wallets"       value={stats?.totalWallets}        accent="#34d399" />
                    <StatCard label="Difficulty"          value={stats?.difficulty}          accent="#fb923c" />
                </div>
            </div>

        </div>
    )
}
