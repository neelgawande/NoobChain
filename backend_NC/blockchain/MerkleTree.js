const sha256 = require("../utils/hash")

function generateMerkleRoot(transactions) {
    if(transactions.length === 0) {
        return sha256("empty")
    }
    let hashes = transactions.map(tx => tx.txid)
    while(hashes.length > 1) {
        let temp = []
        for(let i=0;i<hashes.length;i+=2) {
            let left = hashes[i]
            let right = hashes[i+1] || left

            temp.push(sha256(left + right))
        }
        hashes = temp
    }
    return hashes[0]
}

module.exports = generateMerkleRoot