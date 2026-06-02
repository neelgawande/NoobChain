const express = require("express")
const {db}=require("../storage/LevelDB")
const auth = require("../middleware/authMiddleware")
const adminOnly = require("../middleware/adminOnly")
const godOnly = require("../middleware/godOnly")

const router=express.Router()

router.get("/admin/users",auth,adminOnly,async(req,res)=>{
    try{
        const users=[]

        for await(const [key,user] of db.iterator({
            gte:"user:",
            lt:"user;"
        })){
            users.push({
                username:user.username,
                email:user.email,
                role:user.role
            })
        }
        res.json({
            ok:true,
            users
        })
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})

router.get("/admin/users/:email",auth,adminOnly,async(req,res)=>{
    const user=await db.get(`user:${req.params.email}`)
    res.json(user||null)
})

router.post("/god/users/role",auth,godOnly,async(req,res)=>{
    try{
        const {email,role}=req.body
        if(!email||!role){
            return res.status(400).json({
                ok:false,
                reason:"missing email or role"
            })
        }
        if(!["user","admin","god"].includes(role)){
            return res.status(400).json({
                ok:false,
                reason:"invalid role"
            })
        }
        const user=await db.get(`user:${email}`)
        if(!user){
            return res.status(404).json({
                ok:false,
                reason:"user not found"
            })
        }
        user.role=role
        await db.put(`user:${email}`,user)
        res.json({
            ok:true,
            username:user.username,
            email:user.email,
            role:user.role
        })
    }catch(e){
        res.status(500).json({
            ok:false,
            reason:e.message
        })
    }
})

module.exports = router