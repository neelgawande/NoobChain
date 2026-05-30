const bcrypt=require("bcrypt")
const User=require("./User")
const {db}=require("../storage/LevelDB")
const {chain}=require("../services/noobchainService")

class AuthService{
    async register(username,email,password){
        const existingEmail=await db.get(`user:${email}`)
        if(existingEmail){
            return {
                ok:false,
                reason:"Email already exists"
            }
        }
        const existingUsername=await db.get(`username:${username}`)
        if(existingUsername){
            return {
                ok:false,
                reason:"Username already exists"
            }
        }
        const passwordHash=await bcrypt.hash(password,10)
        const user=new User(username,email,passwordHash)
        const walletResult=await chain.createWallet(1000)
        if(!walletResult.ok){
            return walletResult
        }
        user.wallets.push(walletResult.wallet.address)
        await db.put(`user:${email}`,user)
        await db.put(`username:${username}`,email)
        return {
            ok:true,
            user:{
                username:user.username,
                email:user.email,
                role:user.role,
                wallets:user.wallets
            }
        }
    }
}

module.exports=new AuthService()