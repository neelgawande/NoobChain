const express = require("express")
const { chain, initPromise, isReady } = require("./services/noobchainService")
const Transaction = require("./blockchain/Transaction")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())

// Guard middleware: rejects all requests until the blockchain has finished loading from DB
app.use((req, res, next) => {
    if (!isReady()) {
        return res.status(503).json({ ok: false, reason: "blockchain initializing, try again shortly" })
    }
    next()
})

// still gonna keep this for backwards compatibility. Even if we aren't using this in practice
app.post("/init", async (req, res) => {
    try {
        res.json({ ok: true, height: chain.height })
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

// Consolidated stats endpoint: fetches the chain once and derives everything
// from it. Avoids the bug where separate endpoints each called getFullChain()
// and could theoretically return inconsistent snapshots.
app.get("/stats", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        const totalTransactions = data.reduce((sum, block) => sum + (block.transactions?.length || 0), 0)
        res.json({
            totalBlocks: data.length,           // chain.height + 1, derived from actual loaded data
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

// Individual stats routes kept for backwards compatibility with any existing frontend calls
app.get("/stats/blocks", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        res.json({ totalBlocks: data.length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/transactions", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        const totalTransactions = data.reduce((sum, block) => sum + (block.transactions?.length || 0), 0)
        res.json({ totalTransactions })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/pending", (req, res) => {
    try {
        res.json({ pendingTransactions: chain.pendingTransactions.length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/wallets", (req, res) => {
    try {
        res.json({ totalWallets: Object.keys(chain.stateManager.state.wallets).length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/difficulty", (req, res) => {
    try {
        res.json({ difficulty: chain.difficulty })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/debug/raw-chain", async (req, res) => {
    res.json(await chain.getFullChain())
})

// Wait for the blockchain to finish loading before accepting connections. So that the very first request never hits empty chain.
initPromise.then(() => {
    app.listen(3000, () => console.log("API running on 3000, chain height:", chain.height))
})