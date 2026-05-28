const Blockchain = require("../blockchain/Blockchain")

const chain = new Blockchain()

async function init() {
    await chain.initialize()
}

module.exports = {chain, init}