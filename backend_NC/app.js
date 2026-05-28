const Blockchain = require("./blockchain/Blockchain")
const Transaction = require("./blockchain/Transaction")
const prompt = require("prompt-sync")({ sigint: true })
const { initializeDB } = require("./storage/LevelDB")

async function main() {
    await initializeDB()
    const myChain = new Blockchain()
    await myChain.initialize()

    let inp = ""
    while (inp !== "end") {
        inp = prompt("Enter your choice: ")
        if (inp === "tx") {
            let fn = prompt("Enter sender name: ")
            let sn = prompt("Enter receiver name: ")
            let val = Number(prompt("Enter value to transfer: "))
            const sender = myChain.getWallet(fn)
            const receiver = myChain.getWallet(sn)

            if (!sender) {
                console.log("Sender does not exist")
                continue
            }
            if (!receiver) {
                console.log("Receiver does not exist")
                continue
            }
            if (sender.balance < val) {
                console.log("Insufficient balance")
                continue
            }

            // Count how many txs from this sender are already pending
            // so each new tx gets the next sequential nonce
            const pendingFromSender = myChain.pendingTransactions.filter(t => t.from === fn).length
            const nonce = sender.nonce + 1 + pendingFromSender

            const tx = new Transaction(fn, sn, val, nonce)
            tx.signTransaction(sender.privateKey)
            const added = await myChain.addTransaction(tx)
            if (!added.ok) {
                console.log(added.reason)
                continue
            }
            console.log("Pending Transactions:", myChain.pendingTransactions)
        }

        else if (inp === "mine") {
            await myChain.addBlock()
            console.log(JSON.stringify(myChain, null, 1))
            console.log("Chain validity:", await myChain.isChainValid())
        }
        else if (inp === "print") {
            const re = await myChain.getFullChain()
            console.log(re)
        }
        else if (inp === "printall") {
            const re = await myChain.getFullChain()
            console.log(JSON.stringify(re, null, 2))
        }
        else if (inp === "add") {
            let name = prompt("Enter name for the new user: ")
            let bal = Number(prompt("Enter initial balance: "))
            await myChain.createWallet(name, bal)
        }
        else if (inp === "wallet") {
            let name = prompt("Enter wallet name: ")
            const wallet = myChain.getWallet(name)
            console.log(wallet)
        }
        else if (inp === "state") {
            console.log(JSON.stringify(myChain.stateManager.state, null, 2))
        }
    }
}

main()