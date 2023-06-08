const express = require('express')
const app = express()
const cors = require('cors')


const port = process.env.PORT || 5000

// MIDLEWARE

app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("MAGIC IS HAPPENING")
})

app.listen(port,()=>{
    console.log(`MAGIC IS HAPPENING ON THE PORT ${port}`)
})