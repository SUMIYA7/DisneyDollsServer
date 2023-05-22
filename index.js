const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kroozt0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const ToysCollection = client.db("DisneyToys").collection("toys");

    //Creating index on toy name field
    const indexKeys = { name: 1, subCategory: 1 };
    const indexOptions = { name: "nameSubCategory" };
    const result = await ToysCollection.createIndex(
      indexKeys,
      indexOptions
    );  

    app.get('/toysearch/:text', async (req, res) => {
        const searchText = req.params.text;
        const result = await ToysCollection
          .find({
            $or: [
              { name: { $regex: searchText, $options: "i" } },
              { subCategory: { $regex: searchText, $options: "i" } },
            ],
          })
          .toArray();
        res.send(result);
    });


    // get all toys
    app.get('/alltoys', async (req, res) => {
        const result = await ToysCollection.find({}).toArray();
        res.send(result);
    });

    // get a toy by user email
    app.get("/mytoys/:email", async (req, res) => {
        const email = req.params.email;
        console.log(email);
        const result = await ToysCollection
          .find({ sellerEmail: email })
          .sort({ price: 1 })
          .toArray();
        res.send(result);
    });

    // post or add a new toy
    app.post('/addToy', async (req, res) => {
        const newToy = req.body;15
        const result = await ToysCollection.insertOne(newToy);
        console.log('Got new Toy', result);
        res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// Routes
app.get('/', (req, res) => {    
    res.send('Toys Api running...');
});

app.listen(port, () => {
    console.log(`Assignment 11 Server is running on port: ${port}`);
});