import { useEffect, useState } from "react"
import { getChain } from "../../api/blockchain"
import BlockCard from "../../components/BlockCard"

export default function Explorer() {
    const [chain, setChain] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        async function loadChain() {
            try {
                const data = await getChain()
                setChain(Array.isArray(data) ? [...data].reverse() : [])
            } catch (err) {
                console.error(err)
                setChain([])
            } finally {
                setLoading(false)
            }
        }
        loadChain()
    }, [])

    // filter by block height or hash prefix
    const filtered = chain.filter(block => {
        if (!search.trim()) return true
        const q = search.trim().toLowerCase()
        return (
            String(block.height).includes(q) ||
            block.hash?.toLowerCase().startsWith(q)
        )
    })

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-zinc-400 py-20">
                <span className="inline-block w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading blockchain…
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl">

            {/* ── header ── */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white mb-1">
                    Block Explorer
                </h1>
                <p className="text-zinc-500">
                    {chain.length} block{chain.length !== 1 ? "s" : ""} on chain
                </p>
            </div>

            {/* ── search ── */}
            <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">⌕</span>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by block height or hash…"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs transition-colors"
                    >
                        clear
                    </button>
                )}
            </div>

            {/* ── blocks ── */}
            {filtered.length === 0 ? (
                <div className="text-zinc-500 text-center py-20">
                    No blocks match your search.
                </div>
            ) : (
                filtered.map(block => (
                    <BlockCard key={block.height} block={block} />
                ))
            )}

        </div>
    )
}
