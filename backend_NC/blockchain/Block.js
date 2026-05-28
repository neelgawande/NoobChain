const sha256 = require("../utils/hash")
const generateMerkleRoot = require("./MerkleTree")
const Transaction = require("./Transaction")

class Block {
    constructor(height,transactions,previousHash="0") {
        this.height = Number(height)
        this.transactions = transactions
        this.header = {
            prevHash: previousHash,
            timestamp: Date.now(),
            nonce: 0,
            merkleRoot: generateMerkleRoot(transactions)
        }
        this.hash = this.calculateHash()
    }
    calculateHash() {
        return sha256(
            this.height +
            this.header.prevHash +
            this.header.timestamp +
            this.header.nonce +
            this.header.merkleRoot
        )
    }

    mineBlock(difficulty) {
        const target = "0".repeat(difficulty)
        while(this.hash.substring(0,difficulty) !== target) {
            this.header.nonce++
            this.hash = this.calculateHash()
        }
        console.log("Block mined:",this.hash)
    }

    static from(data) {
        const rebuiltTransactions = data.transactions.map(tx => Transaction.from(tx))
        const block = new Block(data.height, rebuiltTransactions, data.header.prevHash)
        block.header.timestamp = data.header.timestamp
        block.header.nonce = data.header.nonce
        block.header.merkleRoot = data.header.merkleRoot
        const recalculated = block.calculateHash()
        if(recalculated !== data.hash) {
            throw new Error("Corrupted block detected at height " + data.height)
        }
        block.hash = data.hash
        return block
    }
}

module.exports = Block