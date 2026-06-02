import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useAuth} from "../../context/AuthContext"
import {createWallet} from "../../api/walletApi"

function CreateWallet(){

    const {token}=useAuth()
    const navigate=useNavigate()

    const [initialBalance,setInitialBalance]=useState("")
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState("")

    async function handleSubmit(e){
        e.preventDefault()

        try{
            setLoading(true)
            setError("")

            const result=await createWallet(
                token,
                Number(initialBalance)||0
            )

            if(!result.ok){
                setError(result.reason||"Failed to create wallet")
                return
            }

            navigate("/wallets")
        }catch(e){
            setError(e.message)
        }finally{
            setLoading(false)
        }
    }

    return(
        <div>

            <h1>Create Wallet</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Initial Balance</label>
                </div>

                <input
                    type="number"
                    value={initialBalance}
                    onChange={e=>setInitialBalance(e.target.value)}
                    placeholder="0"
                />

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading?"Creating...":"Create Wallet"}
                    </button>
                </div>

                {error&&(
                    <p>{error}</p>
                )}

            </form>

        </div>
    )
}

export default CreateWallet