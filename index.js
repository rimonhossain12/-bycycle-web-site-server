const { MongoClient } = require('mongodb');
const express = require('express')
const app = express()
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser')
require('dotenv').config()

const port = process.env.PORT || 5000;
// middle ware
app.use(cors());
app.use(express.json());

// connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygqbm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('cycleDB');
        const cyclesCollection = database.collection('cycles');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');

        // get all the data from database
        app.get('/allProducts', async (req, res) => {
            const cursor = cyclesCollection.find({});
            const allProducts = await cursor.toArray();
            res.json(allProducts);
        })
        app.get('/products', async (req, res) => {
            const cursor = cyclesCollection.find({});
            const page = 1;
            const size = 6;
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            res.send(products);
        });
        // find specific data from database 
        app.get('/products/:id', async (req, res) => {
            console.log('load single product id hitting');
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cyclesCollection.findOne(query);
            console.log('found data',result);
            res.json(result);
        })
        // add data in the database
        app.post('/Cycle', async (req, res) => {
            const product = req.body;
            const result = await cyclesCollection.insertOne(product);
            res.json(result);
        });
        // save registration user to the database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const addUser = await usersCollection.insertOne(user);
            res.json(addUser);
        });
        // save user order data
        app.post('/orders',async(req,res) => {
            const order = req.body;
            const addOrder = await ordersCollection.insertOne(order);
            res.json(addOrder);
            console.log(addOrder);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Cycle Server Running!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})