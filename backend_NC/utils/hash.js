const SHA256 = require("crypto-js/sha256")

function generateHash(data) {
    return SHA256(data).toString()
}

module.exports = generateHash