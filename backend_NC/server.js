const express = require("express")
const { chain, initPromise, isReady } = require("./services/noobchainService")
const cors = require("cors")
const getTimestamp = require("./utils/timeStamp")


const authRoutes=require("./routes/authRoutes")
const walletRoutes=require("./routes/walletRoutes")
const blockchainRoutes=require("./routes/blockchainRoutes")
const statsRoutes=require("./routes/statsRoutes")
const debugRoutes=require("./routes/debugRoutes")



const app = express()
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    if (!isReady()) {
        return res.status(503).json({ ok: false, reason: "blockchain initializing, try again shortly" })
    }
    next()
})

app.use(authRoutes)
app.use(walletRoutes)
app.use(blockchainRoutes)
app.use(statsRoutes)
app.use(debugRoutes)



initPromise.then(() => {
    app.listen(3000,() => console.log("API running on 3000, chain height:",chain.height,"timestamp:",getTimestamp()))
})

