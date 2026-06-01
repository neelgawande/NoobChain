const jwt=require("jsonwebtoken")
const SECRET="noobchain_secret_key_change_this_later"

function auth(req,res,next){
    const authHeader=req.headers.authorization
    if(!authHeader){
        return res.status(401).json({ok:false,reason:"no token"})
    }
    const token=authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader
    try{
        const decoded=jwt.verify(token,SECRET)
        req.user=decoded
        next()
    }catch(e){
        return res.status(401).json({ok:false,reason:"invalid token"})
    }
}

module.exports=auth