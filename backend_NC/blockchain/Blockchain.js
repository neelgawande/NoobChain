const Block = require("./Block")
const { db } = require("../storage/LevelDB")
const StateManager = require("./StateManager")
const generateMerkleRoot = require("./MerkleTree")

class Blockchain {
    constructor() {
        this.pendingTransactions = []
        this.difficulty = 4
        this.maxTransactionsPerBlock = 5
        this.height = 0
        this.stateManager = new StateManager()
    }

    async initialize() {
        await this.loadChain()
        await this.stateManager.loadState()
    }

    createGenesisBlock() {
        return new Block(0, [], "0")
    }

    async addTransaction(tx) {
        if (!tx || typeof tx.basicValidate !== "function") {
            return { ok: false, reason: "invalid transaction object" }
        }

        if (!tx.basicValidate()) {
            return { ok: false, reason: "invalid transaction" }
        }

        const sender = this.stateManager.getWallet(tx.from)
        const receiver = this.stateManager.getWallet(tx.to)

        if (!sender) return { ok: false, reason: "sender wallet missing" }
        if (!receiver) return { ok: false, reason: "receiver wallet missing" }

        if (tx.verifySignature(sender.publicKey) === false) {
            return { ok: false, reason: "invalid signature" }
        }

        const duplicate = this.pendingTransactions.find(t => t.txid === tx.txid)
        if (duplicate) return { ok: false, reason: "duplicate txid" }

        // Validate nonce: must be exactly sender.nonce + 1 + number of
        // transactions from this sender already sitting in the mempool
        const pendingFromSender = this.pendingTransactions.filter(t => t.from === tx.from).length
        const expectedNonce = sender.nonce + 1 + pendingFromSender
        if (tx.nonce !== expectedNonce) {
            return { ok: false, reason: "invalid nonce" }
        }

        this.pendingTransactions.push(tx)
        return { ok: true }
    }

    async getLatestBlock() {
        const raw = await db.get(`block:${this.height}`)
        return Block.from(raw)
    }

    async addBlock() {
        if (this.pendingTransactions.length === 0) {
            console.log("No pending transactions")
            return
        }

        const selectedTransactions = this.pendingTransactions.splice(0, this.maxTransactionsPerBlock)
        const latestBlock = await this.getLatestBlock()
        const newBlock = new Block(this.height + 1, selectedTransactions, latestBlock.hash)

        newBlock.mineBlock(this.difficulty)

        const result = await this.validateBlock(newBlock, latestBlock)

        if (!result.ok) {
            console.log("Block rejected:", result.reason)
            this.pendingTransactions.unshift(...selectedTransactions)
            return
        }

        try {
            const appliedTxs = []

            for (const tx of selectedTransactions) {
                const applied = this.stateManager.applyTransaction(tx)
                if (!applied.ok) throw new Error(applied.reason)
                appliedTxs.push(tx)
            }

            await this.stateManager.saveState()
            await this.saveBlock(newBlock)
            this.height = newBlock.height

            console.log("Block accepted")

        } catch (err) {
            console.log("Block rejected:", err.message)
            this.pendingTransactions.unshift(...selectedTransactions)
        }
    }

    async saveBlock(block) {
        await db.put(`block:${block.height}`, block)
        await db.put("chain:height", block.height)
    }

    async loadChain() {
        try {
            const latestHeight = await db.get("chain:height")
            const parsed = Number(latestHeight)

            if (Number.isNaN(parsed) || parsed < 0) throw new Error()

            this.height = parsed
            console.log("Blockchain loaded from DB, height:", this.height)
        } catch {
            console.log("No blockchain found")
            const genesis = this.createGenesisBlock()
            await this.saveBlock(genesis)
            this.height = 0
        }
    }

    async getFullChain() {
        let chain = []
        for (let i = 0; i <= this.height; i++) {
            const raw = await db.get(`block:${i}`)
            chain.push(Block.from(raw))
        }
        return chain
    }

    async validateBlock(block, previousBlock) {
        const recalculatedHash = block.calculateHash()

        if (recalculatedHash !== block.hash) {
            return { ok: false, reason: "invalid hash" }
        }

        if (block.header.prevHash !== previousBlock.hash) {
            return { ok: false, reason: "broken linkage" }
        }

        const expectedMerkle = generateMerkleRoot(block.transactions)
        if (block.header.merkleRoot !== expectedMerkle) {
            return { ok: false, reason: "invalid merkle root" }
        }

        if (!block.hash.startsWith("0".repeat(this.difficulty))) {
            return { ok: false, reason: "invalid difficulty" }
        }

        const tempState = structuredClone(this.stateManager.state)
        const seen = new Set()

        for (const tx of block.transactions) {
            if (seen.has(tx.txid)) return { ok: false, reason: "duplicate txid" }
            seen.add(tx.txid)

            const sender = tempState.wallets[tx.from]
            const receiver = tempState.wallets[tx.to]

            if (!sender) return { ok: false, reason: "sender wallet missing" }
            if (!receiver) return { ok: false, reason: "receiver wallet missing" }

            if (tx.verifySignature(sender.publicKey) === false) {
                return { ok: false, reason: "invalid signature" }
            }

            // Validate nonce against the snapshot state (mutated per tx in this loop
            // so sequential txs from the same sender are checked correctly)
            if (tx.nonce !== sender.nonce + 1) {
                return { ok: false, reason: "invalid nonce" }
            }

            if (sender.balance < tx.amount) {
                return { ok: false, reason: "insufficient balance" }
            }

            sender.balance -= tx.amount
            receiver.balance += tx.amount
            sender.nonce += 1
        }

        return { ok: true }
    }

    async isChainValid() {
        const chain = await this.getFullChain()

        for (let i = 1; i < chain.length; i++) {
            const prev = chain[i - 1]
            const curr = chain[i]

            if (curr.calculateHash() !== curr.hash) return false
            if (curr.header.prevHash !== prev.hash) return false

            const merkle = generateMerkleRoot(curr.transactions)
            if (curr.header.merkleRoot !== merkle) return false
        }

        return true
    }

    async createWallet(address, balance = 0) {
        const created = this.stateManager.createWallet(address, balance)
        if (!created.ok) return { ok: false, reason: "Wallet already exists" }

        await this.stateManager.saveState()
        return { ok: true, wallet: this.stateManager.getWallet(address) }
    }

    getWallet(address) {
        return this.stateManager.getWallet(address)
    }

    getBalance(address) {
        return this.stateManager.getBalance(address)
    }
}

module.exports = Blockchain