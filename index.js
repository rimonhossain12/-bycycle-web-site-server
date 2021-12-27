const { MongoClient } = require('mongodb');
const express = require('express')
const app = express()
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

        app.post('/Cycle', async (req, res) => {
            const product = req.body;
            const result = await cyclesCollection.insertOne(product);
            res.json(result);
        });

        app.get('/products', async (req, res) => {
            const cursor = cyclesCollection.find({});
            const page = 1;
            const size = 6;
            let products;
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            console.log('load proudcts',products);
            res.send(products);
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})