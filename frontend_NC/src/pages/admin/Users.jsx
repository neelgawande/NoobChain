import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"

const roleStyle = {
    god:   "text-purple-300 border-purple-900 bg-purple-950",
    admin: "text-pink-300 border-pink-900 bg-pink-950",
    user:  "text-zinc-400 border-zinc-800 bg-zinc-900",
}

export default function Users() {
    const { token } = useAuth()

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function load() {
            try {
                // Token is required — this is a protected admin endpoint
                const res = await fetch("http://localhost:3000/admin/users", {
                    headers: { Authorization: token }
                })
                const data = await res.json()

                if (!res.ok || !data.ok) {
                    setError(data.reason || "Failed to load users")
                    return
                }

                setUsers(data.users)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token])

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-zinc-400 py-20">
                <span className="inline-block w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading users…
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-xl">
                <div className="bg-red-950 border border-red-800 rounded-2xl p-6 text-red-300">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-3xl">

            {/* ── header ── */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white mb-1">Users</h1>
                <p className="text-zinc-500">{users.length} registered account{users.length !== 1 ? "s" : ""}</p>
            </div>

            {/* ── list ── */}
            <div className="space-y-3">
                {users.map(user => (
                    <div
                        key={user.email}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                    >
                        <div className="min-w-0">
                            <p className="font-bold text-white leading-none mb-1">{user.username}</p>
                            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                            {user.wallets?.length > 0 && (
                                <p className="text-xs text-zinc-600 mt-1">
                                    {user.wallets.length} wallet{user.wallets.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>

                        <span className={`shrink-0 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                            roleStyle[user.role] ?? roleStyle.user
                        }`}>
                            {user.role}
                        </span>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
                        No users found
                    </div>
                )}
            </div>

        </div>
    )
}
