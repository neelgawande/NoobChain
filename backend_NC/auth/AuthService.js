const bcrypt=require("bcrypt")
const User=require("./User")
const {db}=require("../storage/LevelDB")
const {chain}=require("../services/noobchainService")
const {signToken}=require("./jwt")

class AuthService{
    async register(username,email,password,initialBalance=1000){
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
        const walletResult=await chain.createWallet(initialBalance)
        if(!walletResult.ok){
            return walletResult
        }
        user.wallets.push(walletResult.wallet.address)
        user.activeWallet = walletResult.wallet.address
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

    async login(email,password){
        const user=await db.get(`user:${email}`)
        if(!user){
            return {ok:false,reason:"User not found"}
        }
        const valid=await bcrypt.compare(password,user.passwordHash)
        if(!valid){
            return {ok:false,reason:"Invalid credentials"}
        }
        const token=signToken(user)
        return {
            ok:true,
            token,
            user:{
                email:user.email,
                username:user.username,
                role:user.role,
                wallets:user.wallets
            }
        }
    }
}

module.exports=new AuthService()