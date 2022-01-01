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
            console.log('found data', result);
            res.json(result);
        })
        // found admin
        app.get('/users/:email', async (req, res) => {
            console.log('admin found api hitting');
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log('user admin',user);
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // send data with filter user email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = ordersCollection.find({ email });
            const orders = await cursor.toArray();
            res.send(orders);

        })
        // all the orders product
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const allOrders = await cursor.toArray();
            res.json(allOrders);
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
            console.log('use api ', user);
            const addUser = await usersCollection.insertOne(user);
            res.json(addUser);
        });
        // save user from on browser at on time login
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: { user }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log('user added', result);
            res.json(result);

        })
        // save user order data
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const addOrder = await ordersCollection.insertOne(order);
            res.json(addOrder);
            console.log(addOrder);
        });
        app.put('/makeAdmin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: { role: 'Admin' }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log('make admin', result);
        })
        // delete user order
        app.delete('/orders/:id', async (req, res) => {
            console.log('delete api is hitting');
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log(result);
            res.json(result);
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