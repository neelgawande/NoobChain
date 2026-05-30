const crypto = require("crypto")

class Wallet {
    constructor(address,balance=0,nonce=0,publicKey=null,privateKey=null) {
        this.address = address
        this.balance = balance
        this.nonce = nonce
        this.publicKey = publicKey
        this.privateKey = privateKey
    }

    static generate(balance=0){
        const pair=crypto.generateKeyPairSync("ec",{namedCurve:"secp256k1"})
        const publicKey=pair.publicKey.export({
            type:"spki",
            format:"pem"
        })
        const privateKey=pair.privateKey.export({
            type:"pkcs8",
            format:"pem"
        })
        const address="NC"+crypto
            .createHash("sha256")
            .update(publicKey)
            .digest("hex")
            .slice(0,40)
        return new Wallet(address,balance,0,publicKey,privateKey)
    }

    static from(data) {
        return new Wallet(data.address, data.balance, data.nonce, data.publicKey, data.privateKey)
    }
}

module.exports = Wallet