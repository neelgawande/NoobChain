const jwt=require("jsonwebtoken")

const SECRET="noobchain_secret_key_change_this_later"

function signToken(user){
    return jwt.sign(
        {
            email:user.email,
            username:user.username,
            role:user.role
        },
        SECRET,
        {expiresIn:"7d"}
    )
}

function verifyToken(token){
    return jwt.verify(token,SECRET)
}

module.exports={signToken,verifyToken}