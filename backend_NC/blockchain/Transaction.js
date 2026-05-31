const crypto = require("crypto")
const sha256 = require("../utils/hash")

class Transaction {
    constructor(from,to,amount,nonce=0){
        this.from = from
        this.to = to
        this.amount = amount
        this.nonce = nonce
        this.timestamp = Date.now()
        this.signature = null
        this.txid = this.calculateHash()
    }

    calculateHash(){
        return sha256(this.from +"|"+ this.to +"|"+ this.amount +"|"+ this.nonce +"|"+ this.timestamp).toString()
    }

    signTransaction(privateKey){
        const sign = crypto.createSign("SHA256")
        const message = this.calculateHash()
        sign.update(message)
        sign.end()
        this.signature = sign.sign(privateKey,"hex")
        this.txid = message
    }

    verifySignature(publicKey){
        if(!this.signature || !this.txid) return false
        const verify = crypto.createVerify("SHA256")
        verify.update(this.txid)
        verify.end()
        return verify.verify(publicKey,this.signature,"hex")
    }

    basicValidate(){
        if(!this.from || !this.to) return false
        if(typeof this.amount !== "number" || !Number.isInteger(this.amount) || this.amount <= 0) return false
        if(typeof this.nonce !== "number" || !Number.isInteger(this.nonce) || this.nonce < 1) return false
        if (typeof this.timestamp !== "number" || this.timestamp <= 0) return false
        return true
    }

    isValid(){
        if(!this.basicValidate()) return false
        if(!this.signature || typeof this.signature !== "string") return false
        if(!this.txid) return false
        return true
    }

    static from(data){
        const tx = new Transaction(data.from,data.to,data.amount,data.nonce || 0)
        tx.timestamp = data.timestamp || Date.now()
        tx.signature = data.signature || null
        tx.txid = data.txid || tx.calculateHash()
        return tx
    }
}

module.exports = Transaction