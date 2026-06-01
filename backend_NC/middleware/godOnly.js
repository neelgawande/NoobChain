function godOnly(req,res,next){
    if(req.user.role!=="god"){
        return res.status(403).json({
            ok:false,
            reason:"god only"
        })
    }
    next()
}

module.exports = godOnly