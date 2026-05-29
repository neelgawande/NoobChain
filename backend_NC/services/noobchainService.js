const Blockchain = require("../blockchain/Blockchain")

const chain = new Blockchain()

// Track whether initialization has completed so the server can guard against requests arriving before the DB has loaded
let initialized = false

async function init() {
    await chain.initialize()
    initialized = true
}

// Initialize immediately on startup
const initPromise = init().catch(err => {
    console.error("Fatal: blockchain failed to initialize", err)
    process.exit(1)
})

function isReady() {
    return initialized
}

module.exports = { chain, init, initPromise, isReady }