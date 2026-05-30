const { db } = require("../storage/LevelDB")
const Wallet = require("./Wallet")

class StateManager {
    constructor() {
        this.state = {
            wallets: {}
        }
    }

    async loadState() {
        try {
            const loaded = await db.get("state:latest")
            if (!loaded || typeof loaded !== "object") {
                throw new Error("Invalid state")
            }
            if (!loaded.wallets) {
                loaded.wallets = {}
            }
            this.state = loaded
        } catch {
            this.state = {
                wallets: {}
            }
            await this.saveState()
        }
    }

    async saveState() {
        await db.put("state:latest", this.state)
    }

    walletExists(address) {
        return !!this.state.wallets[address]
    }

    createWallet(balance = 0) {
        const wallet = Wallet.generate(balance)
        // Address is derived from the public key hash so collisions are
        // astronomically unlikely, but we guard anyway.
        if (this.walletExists(wallet.address)) {
            return { ok: false, reason: "Wallet already exists" }
        }
        this.state.wallets[wallet.address] = wallet
        return { ok: true, wallet }
    }

    getWallet(address) {
        return this.state.wallets[address] || null
    }

    getBalance(address) {
        const wallet = this.getWallet(address)
        if (!wallet) {
            return null
        }
        return wallet.balance
    }

    applyTransaction(tx) {
        const sender = this.getWallet(tx.from)
        const receiver = this.getWallet(tx.to)

        if (!sender) return { ok: false, reason: "Sender wallet not found" }
        if (!receiver) return { ok: false, reason: "Receiver wallet not found" }

        if (sender.address === receiver.address) {
            return { ok: false, reason: "Self transfer not allowed" }
        }

        // Final nonce guard — ensures no tx can bypass the mempool
        // and be applied with a wrong nonce directly via block construction
        if (tx.nonce !== sender.nonce + 1) {
            return { ok: false, reason: "Invalid nonce" }
        }

        if (sender.balance < tx.amount) {
            return { ok: false, reason: "Insufficient balance" }
        }

        const verified = tx.verifySignature(sender.publicKey)
        if (!verified) {
            return { ok: false, reason: "Invalid signature" }
        }

        sender.balance -= tx.amount
        receiver.balance += tx.amount
        sender.nonce++

        return { ok: true }
    }
}

module.exports = StateManager