const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()

const port = process.env.PORT || 5000

// MIDLEWARE

app.use(cors())
app.use(express.json())


// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization
//   if (!authorization) {
//     return res.status(401).send({ error: true, message: "unauthorized access" })
//   }
//   // bearer token
//   const token = authorization.split(' ')[1]

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ error: true, message: "unauthorized access" })
//     }
//     req.decoded = decoded
//     next()
//   })
// }

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}














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
    const classCollection = client.db('magicDb').collection('class')
    const cartCollection = client.db('magicDb').collection('cart')
    //............................... DATABASE COLLECTION.......................................//



    //////////////////////////////////////////////////////////////////////////////////////////////
    //****************************************GET*******************************************//////
    //////////////////////////////////////////////////////////////////////////////////////////////
    app.get('/teacher', async (req, res) => {
      const result = await teacherCollection.find().toArray()
      res.send(result)

    })

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, massage: "forbidden message" })
      }
      next()
    }


    const verifyInstructor = async (req, res, next) => {
      const email = req.decoded.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      if (user?.role !== 'instructor') {
        return res.status(403).send({ error: true, massage: "forbidden message" })
      }
      next()
    }










    // HERE IS SUPPOSED TO USE THE VERIFY SCARY JWT TOKEN

    app.get('/cart', verifyJWT, async (req, res) => {
      const email = req.query.email
      if (!email) {
        res.send([])
      }


      const decodedEmail = req.decoded.email
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: "unauthorized access" })
      }


      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ error: true, message: 'forbidden access' })
      // }




      const query = { email: email }
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })





    app.get('/class', async (req, res) => {
      const result = await classCollection.find().toArray()
      res.send(result)

    })


    // app.get('/class' , async (req, res) => {
    //   const email = req.query.email
    //   if (!email) {
    //     res.send([])
    //   }

    //   const query = { email: email }
    //   const result = await cartCollection.find(query).toArray()
    //   res.send(result)
    // })













    //PROBLEM//
    app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    // SPECIAL GET //

    app.get('/users/admin/:id', verifyJWT, async (req, res) => {
      const email = req.params.id


      if (req.decoded.email !== email) {
        res.send({ admin: false })
        return
      }


      const query = { email: email }
      const user = await usersCollection.findOne(query)
      const result = { admin: user?.role === 'admin' }
      res.send(result)
    })


    //SPECIAL GET ANOTHER

    app.get('/users/instructor/:id', verifyJWT, async (req, res) => {
      const email = req.params.id


      if (req.decoded.email !== email) {
        res.send({ admin: false })
        return
      }


      const query = { email: email }
      const user = await usersCollection.findOne(query)
      const result = { instructor: user?.role === 'instructor' }
      res.send(result)
    })

    //////////////////////////////////////////////////////////////////////////////////////////
    //****************************************GET*******************************************//
    //////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////
    //****************************************POST*******************************************//
    //////////////////////////////////////////////////////////////////////////////////////////

    app.post('/jwt', (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })





    app.post('/users', async (req, res) => {
      const item = req.body
      const query = {email:user.email}
      const existingUser = await usersCollection.findOne(query)

      if(existingUser){
        return res.send({message:'user already exist'})
      }

      const result = await usersCollection.insertOne(item)
      res.send(result)
    })


    app.post('/cart', async (req, res) => {
      const item = req.body
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })




    app.post('/class', async (req, res) => {
      const newItem = req.body
      const result = await classCollection.insertOne(newItem)
      res.send(result)
    })



    // PAYMENT//



    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = price*100

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    
    





      //////////////////////////////////////////////////////////////////////////////////////////
      //****************************************POST*******************************************//
      //////////////////////////////////////////////////////////////////////////////////////////


      //////////////////////////////////////////////////////////////////////////////////////////
      //****************************************PATCH*******************************************//
      //////////////////////////////////////////////////////////////////////////////////////////


      app.patch('/users/admin/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {

          $set: {

            role: "admin"

          },

        };

        const result = await usersCollection.updateOne(filter, updateDoc)
        res.send(result)
      })




      app.patch('/users/instructor/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {

          $set: {

            role: "instructor"

          },

        };

        const result = await usersCollection.updateOne(filter, updateDoc)
        res.send(result)
      })



      app.patch('/class/approve/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {

          $set: {

            status: "approve"

          },

        };

        const result = await classCollection.updateOne(filter, updateDoc)
        res.send(result)
      })





      app.patch('/class/denied/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {

          $set: {

            status: "denied"

          },

        };

        const result = await classCollection.updateOne(filter, updateDoc)
        res.send(result)
      })






      //////////////////////////////////////////////////////////////////////////////////////////
      //****************************************PATCH*******************************************//
      //////////////////////////////////////////////////////////////////////////////////////////


      //////////////////////////////////////////////////////////////////////////////////////////
      //****************************************DELETE*******************************************//
      //////////////////////////////////////////////////////////////////////////////////////////  


      app.delete('/cart/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await cartCollection.deleteOne(query)
        res.send(result)
      })




















      //////////////////////////////////////////////////////////////////////////////////////////
      //****************************************PATCH*******************************************//
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