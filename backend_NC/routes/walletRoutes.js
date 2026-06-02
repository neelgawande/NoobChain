const express = require("express")
const { chain } = require("../services/noobchainService")
const {db}=require("../storage/LevelDB")
const auth = require("../middleware/authMiddleware")

const router=express.Router()

// requires login. will send a GET request with the JWT. Will return all of the user's wallets
router.get("/me/wallets",auth,async(req,res)=>{
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
router.post("/me/wallets",auth,async(req,res)=>{
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

// to make a wallet the active wallet. request body takes in JSON with the address of the target wallet, and also JWT
router.post("/me/wallets/active",auth,async(req,res)=>{
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
router.get("/me/wallets/active",auth,async(req,res)=>{
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

// returns all of the user's information
router.get("/me",auth,async(req,res)=>{
    try{
        const email=req.user.email
        const user=await db.get(`user:${email}`)
        if(!user) return res.status(404).json({ok:false,reason:"user not found"})

        res.json({
            ok:true,
            info:user
        })
    }catch(e){
        res.status(500).json({ok:false,reason:e.message})
    }
})

//returns all of the users wallets along with all of their information
router.get("/me/wallets/all",auth,async(req,res)=>{
    try{
        const user=await db.get(`user:${req.user.email}`)

        const wallets=user.wallets
            .map(address=>chain.getWallet(address))
            .filter(wallet=>wallet)

        res.json({
            ok:true,
            wallets
        })
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})
module.exports=router
