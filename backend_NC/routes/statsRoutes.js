const express = require("express")
const { chain } = require("../services/noobchainService")

const router=express.Router()

router.get("/stats", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        const totalTransactions = data.reduce((sum, block) => sum + (block.transactions?.length || 0), 0)
        res.json({
            totalBlocks: data.length,
            totalTransactions,
            pendingTransactions: chain.pendingTransactions.length,
            totalWallets: Object.keys(chain.stateManager.state.wallets).length,
            difficulty: chain.difficulty,
            height: chain.height
        })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.get("/stats/blocks", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        res.json({ totalBlocks: data.length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.get("/stats/transactions", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        const totalTransactions = data.reduce((sum, block) => sum + (block.transactions?.length || 0), 0)
        res.json({ totalTransactions })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.get("/stats/pending", (req, res) => {
    try {
        res.json({ pendingTransactions: chain.pendingTransactions.length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.get("/stats/wallets", (req, res) => {
    try {
        res.json({ totalWallets: Object.keys(chain.stateManager.state.wallets).length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.get("/stats/difficulty", (req, res) => {
    try {
        res.json({ difficulty: chain.difficulty })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

module.exports=router