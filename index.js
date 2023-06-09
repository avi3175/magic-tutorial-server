const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 5000

// MIDLEWARE

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f2tn7zt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //............................... DATABASE COLLECTION.......................................//
    const teacherCollection = client.db('magicDb').collection('teacher')
    const usersCollection = client.db('magicDb').collection('users')
    const cartCollection = client.db('magicDb').collection('class')

    //............................... DATABASE COLLECTION.......................................//



//////////////////////////////////////////////////////////////////////////////////////////////
//****************************************GET*******************************************//////
//////////////////////////////////////////////////////////////////////////////////////////////
    app.get('/teacher', async (req, res) => {
      const result = await teacherCollection.find().toArray()
      res.send(result)

    })

    app.get('/users', async (req, res) => {
      const email = req.query.email
      if (!email) {
        res.send([])
      }
      const query = { email: email }
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/class', async (req, res) => {
      const result = await teacherCollection.find().toArray()
      res.send(result)

    })

    // app.get('/users', async (req, res) => {
    //   const result = await usersCollection.find().toArray()
    //   res.send(result)
    // })


//////////////////////////////////////////////////////////////////////////////////////////
//****************************************GET*******************************************//
//////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////////////////////////////////
//****************************************POST*******************************************//
//////////////////////////////////////////////////////////////////////////////////////////

    app.post('/users', async (req, res) => {
      const item = req.body
      const result = await usersCollection.insertOne(item)
      res.send(result)
    })


    app.post('/carts', async (req, res) => {
      const item = req.body
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })

//////////////////////////////////////////////////////////////////////////////////////////
//****************************************POST*******************************************//
//////////////////////////////////////////////////////////////////////////////////////////

   

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send("MAGIC IS HAPPENING")
})

app.listen(port, () => {
  console.log(`MAGIC IS HAPPENING ON THE PORT ${port}`)
})