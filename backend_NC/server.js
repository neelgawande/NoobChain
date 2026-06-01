const express = require("express")
const { chain, initPromise, isReady } = require("./services/noobchainService")
const Transaction = require("./blockchain/Transaction")
const cors = require("cors")
const authService=require("./auth/AuthService")
const {db}=require("./storage/LevelDB")
const getTimestamp = require("./utils/timeStamp")
const auth = require("./auth/authMiddleware")
const Wallet = require("./blockchain/Wallet")

const app = express()
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    if (!isReady()) {
        return res.status(503).json({ ok: false, reason: "blockchain initializing, try again shortly" })
    }
    next()
})

app.post("/init", async (req, res) => {
    try {
        res.json({ ok: true, height: chain.height })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.post("/wallet", async (req, res) => {
    try {
        const { address, balance } = req.body
        if (!address) return res.status(400).json({ ok: false, reason: "missing address" })

        const result = await chain.createWallet(address, balance || 0)
        if (!result.ok) return res.status(400).json(result)

        res.json(result)
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.post("/tx", async (req, res) => {
    try {
        const { from, to, amount, privateKey, signature } = req.body

        if (!from || !to || amount === undefined) {
            return res.status(400).json({ ok: false, reason: "missing from, to, or amount" })
        }

        if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({ ok: false, reason: "amount must be a positive integer" })
        }

        const sender = chain.getWallet(from)
        if (!sender) return res.status(404).json({ ok: false, reason: "sender wallet not found" })

        const pendingFromSender = chain.pendingTransactions.filter(t => t.from === from).length
        const nonce = sender.nonce + 1 + pendingFromSender

        const tx = new Transaction(from, to, amount, nonce)

        if (privateKey) {
            // Normalize the PEM key — when pasted from a JSON value or typed manually,
            // literal "\n" two-character sequences arrive instead of real newlines.
            // Node's crypto decoder requires actual newlines in the PEM header,
            // footer, and between base64 lines or it throws "unsupported" decoder error.
            const normalizedKey = privateKey.replace(/\\n/g, "\n").trim()
            tx.signTransaction(normalizedKey)
        } else if (signature) {
            tx.signature = signature
        } else {
            return res.status(400).json({ ok: false, reason: "missing privateKey or signature" })
        }

        const result = await chain.addTransaction(tx)
        if (!result.ok) return res.status(400).json(result)

        res.json({ ok: true, txid: tx.txid, nonce: tx.nonce })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.post("/mine", async (req, res) => {
    try {
        await chain.addBlock()
        res.json({ ok: true, height: chain.height })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/chain", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        res.json(data)
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/wallet/:address", async (req, res) => {
    try {
        const wallet = chain.getWallet(req.params.address)
        if (!wallet) return res.status(404).json({ ok: false, reason: "not found" })

        const pendingFromWallet = chain.pendingTransactions.filter(t => t.from === req.params.address).length
        res.json({
            address: wallet.address,
            balance: wallet.balance,
            nonce: wallet.nonce,
            nextNonce: wallet.nonce + 1 + pendingFromWallet,
            // privateKey intentionally not omitted: I ain't gonna write down everyone's private keys just for doing some transactions
            privateKey: wallet.privateKey
        })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        const totalTransactions = data.reduce((sum, block) => sum + (block.transactions?.length || 0), 0)
        res.json({
            totalBlocks: data.length,
            totalTransactions,
            pendingTransactions: chain.pendingTransactions.length,
            totalWallets: Object.keys(chain.stateManager.state.wallets).length,
            difficulty: chain.difficulty,
            height: chain.height
        })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/blocks", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        res.json({ totalBlocks: data.length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/transactions", async (req, res) => {
    try {
        const data = await chain.getFullChain()
        const totalTransactions = data.reduce((sum, block) => sum + (block.transactions?.length || 0), 0)
        res.json({ totalTransactions })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/pending", (req, res) => {
    try {
        res.json({ pendingTransactions: chain.pendingTransactions.length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/wallets", (req, res) => {
    try {
        res.json({ totalWallets: Object.keys(chain.stateManager.state.wallets).length })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

app.get("/stats/difficulty", (req, res) => {
    try {
        res.json({ difficulty: chain.difficulty })
    } catch (e) {
        res.status(500).json({ ok: false, reason: e.message })
    }
})

/* user REGISTRY and AUTH */

app.post("/register",async(req,res)=>{
    try{
        const {username,email,password,initialBalance}=req.body
        if(!username||!email||!password){
            return res.status(400).json({
                ok:false,
                reason:"missing username, email or password"
            })
        }
        const balance=initialBalance ?? 1000
        if(typeof balance !== "number" || !Number.isInteger(balance) || balance <=0) {
            return res.status(400).json({ ok: false, reason: "initialBalance must be a positive integer" })
        }
        const result=await authService.register(username,email,password,balance)
        if(!result.ok){
            return res.status(400).json(result)
        }
        res.json(result)
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})

app.get("/debug/user/:email",async(req,res)=>{
    const user=await db.get(`user:${req.params.email}`)
    res.json(user||null)
})

app.delete("/debug/user/:email",async(req,res)=>{
    try{
        const email=req.params.email
        const user=await db.get(`user:${email}`)
        if(!user){
            return res.status(404).json({
                ok:false,
                reason:"User not found"
            })
        }
        await db.del(`user:${email}`)
        await db.del(`username:${user.username}`)
        res.json({
            ok:true,
            message:`Deleted ${email}`
        })
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})

app.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body

        if(!email||!password){
            return res.status(400).json({
                ok:false,
                reason:"missing email or password"
            })
        }
        const result=await authService.login(email,password)
        if(!result.ok){
            return res.status(401).json(result)
        }
        res.json(result)
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})

// requires login. will send a GET request with the JWT. Will return all of the user's wallets
app.get("/me/wallets",auth,async(req,res)=>{
    try{
        const email=req.user.email
        const user=await db.get(`user:${email}`)
        if(!user) return res.status(404).json({ok:false,reason:"user not found"})

        res.json({
            ok:true,
            wallets:user.wallets || []
        })
    }catch(e){
        res.status(500).json({ok:false,reason:e.message})
    }
})

// creating additional wallet for logged-in user
app.post("/me/wallets",auth,async(req,res)=>{
    try{
        const {initialBalance}=req.body
        const user=await db.get(`user:${req.user.email}`)
        const balance=initialBalance ?? 1000
        if(typeof balance !== "number" || !Number.isInteger(balance) || balance <=0) {
            return res.status(400).json({ ok: false, reason: "initialBalance must be a positive integer" })
        }
        
        const walletResult=await chain.createWallet(balance)
        if(!walletResult.ok){
            return res.status(400).json(walletResult)
        }
        user.wallets.push(walletResult.wallet.address)
        await db.put(`user:${req.user.email}`,user)
        res.json({
            ok:true,
            added:walletResult.wallet.address,
            wallets:user.wallets
        })
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})

//to fix a bug we encountered. Probably will never use again
app.post("/debug/fix-user-wallets/:email", async (req,res)=>{
    try{
        const user = await db.get(`user:${req.params.email}`)
        if(!user) return res.status(404).json({ok:false,reason:"not found"})

        user.wallets = user.wallets.map(w => typeof w === "string" ? w : w.address)

        await db.put(`user:${req.params.email}`, user)

        res.json({ok:true,user})
    }catch(e){
        res.status(500).json({ok:false,reason:e.message})
    }
})

// to make a wallet the active wallet. request body takes in JSON with the address of the target wallet, and also JWT
app.post("/me/wallets/active",auth,async(req,res)=>{
    try{
        const {address}=req.body
        const user=await db.get(`user:${req.user.email}`)
        if(!user.wallets.includes(address)){
            return res.status(400).json({ok:false,reason:"wallet not owned by user"})
        }
        user.activeWallet = address
        await db.put(`user:${req.user.email}`,user)
        res.json({
            ok:true,
            activeWallet:address
        })
    }catch(e){
        res.status(500).json({ok:false,reason:e.message})
    }
})

// returns the active wallet of the user
app.get("/me/wallets/active",auth,async(req,res)=>{
    try{
        const user=await db.get(`user:${req.user.email}`)
        if(!user.activeWallet){
            return res.status(404).json({ok:false,reason:"no active wallet set"})
        }
        const wallet=chain.getWallet(user.activeWallet)
        if(!wallet){
            return res.status(404).json({ok:false,reason:"active wallet not found in chain"})
        }
        res.json({
            ok:true,
            wallet
        })
    }
    catch(e){
        res.status(500).json({ok:false,reason:e.message})
    }
})

// to delete a user's wallet - requires login from the user side
app.delete("/me/wallets",auth,async(req,res)=>{
    try{
        const {address}=req.body
        if(!address){
            return res.status(400).json({
                ok:false,
                reason:"missing wallet address"
            })
        }

        const user=await db.get(`user:${req.user.email}`)
        if(!user){
            return res.status(404).json({
                ok:false,
                reason:"user not found"
            })
        }
        if(!user.wallets.includes(address)){
            return res.status(400).json({
                ok:false,
                reason:"wallet not owned by user"
            })
        }
        delete chain.stateManager.state.wallets[address]
        user.wallets=user.wallets.filter(w=>w!==address)
        if(user.activeWallet===address){
            user.activeWallet=user.wallets.length>0
                ? user.wallets[0]
                : null
        }
        await chain.stateManager.saveState()
        await db.put(`user:${user.email}`,user)
        res.json({
            ok:true,
            deletedWallet:address,
            activeWallet:user.activeWallet
        })
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})


/* user end */


initPromise.then(() => {
    app.listen(3000,() => console.log("API running on 3000, chain height:",chain.height,"timestamp:",getTimestamp()))
})

