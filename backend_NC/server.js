const express = require("express")
const { chain, init } = require("./services/noobchainService")
const Transaction = require("./blockchain/Transaction")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())


app.post("/init", async (req, res) => {
    try {
        await init()
        res.json({ ok: true })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.post("/wallet", async (req, res) => {
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

app.post("/tx", async (req, res) => {
    try {
        const { from, to, amount, privateKey, signature } = req.body

        if (!from || !to || !amount) {
            return res.status(400).json({ ok: false, reason: "missing from, to, or amount" })
        }

        const sender = chain.getWallet(from)
        if (!sender) return res.status(404).json({ ok: false, reason: "sender wallet not found" })

        // Auto-resolve the correct nonce — client should never send this manually.
        // It's sender's confirmed nonce + 1 + however many txs from this sender
        // are already sitting in the mempool waiting to be mined.
        const pendingFromSender = chain.pendingTransactions.filter(t => t.from === from).length
        const nonce = sender.nonce + 1 + pendingFromSender

        const tx = new Transaction(from, to, amount, nonce)

        if (privateKey) {
            tx.signTransaction(privateKey)
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

app.post("/mine", async (req, res) => {
    try {
        await chain.addBlock()
        res.json({ ok: true, height: chain.height })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/chain", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        res.json(data)
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/wallet/:address", async (req, res) => {
    try {
        const wallet = chain.getWallet(req.params.address)
        if (!wallet) return res.status(404).json({ ok: false, reason: "not found" })

        // Expose the next expected nonce so clients can build txs correctly
        // if they ever need to sign offline before submitting
        const pendingFromWallet = chain.pendingTransactions.filter(t => t.from === req.params.address).length
        res.json({
            address: wallet.address,
            balance: wallet.balance,
            nonce: wallet.nonce,
            nextNonce: wallet.nonce + 1 + pendingFromWallet,
            privateKey: wallet.privateKey
        })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.listen(3000, () => console.log("API running on 3000"))