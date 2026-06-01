const express = require("express")
const { chain } = require("../services/noobchainService")
const {db}=require("../storage/LevelDB")


const router=express.Router()


router.get("/debug/user/:email",async(req,res)=>{
    const user=await db.get(`user:${req.params.email}`)
    res.json(user||null)
})

router.delete("/debug/user/:email",async(req,res)=>{
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

//to fix a bug we encountered. Probably will never use again
router.post("/debug/fix-user-wallets/:email", async (req,res)=>{
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

module.exports=router