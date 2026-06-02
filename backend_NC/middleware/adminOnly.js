function adminOnly(req,res,next){
    if(req.user.role!=="admin"&&req.user.role!=="god"){
        return res.status(403).json({
            ok:false,
            reason:"admin only"
        })
    }
    next()
}

module.exports = adminOnly