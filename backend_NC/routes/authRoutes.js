const express = require("express")
const authService=require("../middleware/AuthService")
const auth = require("../middleware/authMiddleware")
const adminOnly = require("../middleware/adminOnly")
const godOnly = require("../middleware/godOnly")

const router=express.Router()

router.post("/register",async(req,res)=>{
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
        const result=await authService.register(username,email,password,balance,"user")
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

router.post("/login",async(req,res)=>{
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

// ADMIN & GOD registrations - Only 'god' can do these
router.post("/admin/register",auth,godOnly,async(req,res)=>{
    try{
        const {username,email,password,initialBalance}=req.body
        if(!username||!email||!password){
            return res.status(400).json({
                ok:false,
                reason:"missing username, email or password"
            })
        }
        const result=await authService.register(
            username,
            email,
            password,
            initialBalance??1000,
            "admin"
        )
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

router.post("/god/register",auth,godOnly,async(req,res)=>{
    try{
        const {username,email,password,initialBalance}=req.body

        if(!username||!email||!password){
            return res.status(400).json({
                ok:false,
                reason:"missing username, email or password"
            })
        }
        const result=await authService.register(
            username,
            email,
            password,
            initialBalance??1000,
            "god"
        )
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

module.exports=router