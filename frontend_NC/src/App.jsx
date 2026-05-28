import {useEffect,useState} from "react"
import axios from "axios"

function App() {
    const [chain,setChain] = useState([])

    useEffect(()=>{
        async function fetchChain() {
            try{
                const res = await axios.get("http://localhost:3000/chain")
                setChain(res.data)
            }catch(err){
                console.error(err)
            }
        }

        fetchChain()
    },[])

    return (
        <div>
            <h1>NoobChain Explorer</h1>

            {chain.map(block=>(
                <div key={block.height} style={{border:"1px solid black",margin:"10px",padding:"10px"}}>
                    <p>Height: {block.height}</p>
                    <p>Hash: {block.hash}</p>
                    <p>Transactions: {block.transactions.length}</p>
                </div>
            ))}
        </div>
    )
}

export default App