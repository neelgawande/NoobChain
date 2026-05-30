class User{
    constructor(username,email,passwordHash,role="user"){
        this.username=username
        this.email=email
        this.passwordHash=passwordHash
        this.role=role
        this.wallets=[]
    }
}

module.exports=User