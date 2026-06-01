const express = require("express")
const { chain } = require("../services/noobchainService")
const Transaction = require("../blockchain/Transaction")

const router=express.Router()


router.post("/init", async (req, res) => {
    try {
        res.json({ ok: true, height: chain.height })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})


// REDUNDANT
router.post("/wallet", async (req, res) => {
    try {
        const { address, balance } = req.body
        if (!address) return res.status(400).json({ ok: false, reason: "missing address" })

        const result = await chain.createWallet(address, balance || 0)
        if (!result.ok) return res.status(400).json(result)

        res.json(result)
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.post("/tx", async (req, res) => {
    try {
        const { from, to, amount, privateKey, signature } = req.body

        if (!from || !to || amount === undefined) {
            return res.status(400).json({ ok: false, reason: "missing from, to, or amount" })
        }

        if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({ ok: false, reason: "amount must be a positive integer" })
        }

        const sender = chain.getWallet(from)
        if (!sender) return res.status(404).json({ ok: false, reason: "sender wallet not found" })

        const pendingFromSender = chain.pendingTransactions.filter(t => t.from === from).length
        const nonce = sender.nonce + 1 + pendingFromSender

        const tx = new Transaction(from, to, amount, nonce)

        if (privateKey) {
            // Normalize the PEM key — when pasted from a JSON value or typed manually,
            // literal "\n" two-character sequences arrive instead of real newlines.
            // Node's crypto decoder requires actual newlines in the PEM header,
            // footer, and between base64 lines or it throws "unsupported" decoder error.
            const normalizedKey = privateKey.replace(/\\n/g, "\n").trim()
            tx.signTransaction(normalizedKey)
        } else if (signature) {
            tx.signature = signature
        } else {
            return res.status(400).json({ ok: false, reason: "missing privateKey or signature" })
        }

        const result = await chain.addTransaction(tx)
        if (!result.ok) return res.status(400).json(result)

        res.json({ ok: true, txid: tx.txid, nonce: tx.nonce })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.post("/mine", async (req, res) => {
    try {
        await chain.addBlock()
        res.json({ ok: true, height: chain.height })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.get("/chain", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        res.json(data)
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

router.get("/wallet/:address", async (req, res) => {
    try {
        const wallet = chain.getWallet(req.params.address)
        if (!wallet) return res.status(404).json({ ok: false, reason: "not found" })

        const pendingFromWallet = chain.pendingTransactions.filter(t => t.from === req.params.address).length
        res.json({
            address: wallet.address,
            balance: wallet.balance,
            nonce: wallet.nonce,
            nextNonce: wallet.nonce + 1 + pendingFromWallet,
            // privateKey intentionally not omitted: I ain't gonna write down everyone's private keys just for doing some transactions
            privateKey: wallet.privateKey
        })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

module.exports=router