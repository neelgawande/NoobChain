const { Level } = require("level")
const db = new Level("./data/chaindata",{ valueEncoding:"json" })

async function initializeDB() {
    await db.open()
}

module.exports = {
    db,
    initializeDB
}