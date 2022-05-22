const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// maiddleware
app.use(cors());
app.use(express.json());


// making connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z68se.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect()
        const productCollection = client.db('spiceWarehouse').collection('products');
        const addedProduct = client.db('spiceWarehouse').collection('addedItems');

        // sending products info from db to client site
        app.get('/product', async (req, res) => {
            const query = {};
            const courser = productCollection.find(query);
            const products = await courser.toArray();
            res.send(products);
        });

        // loading one item in client site by sending data from bd
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // take data from client site by using post (Adding new Product)
        app.post('/addedItem', async (req, res) => {
            const newProduct = req.body;
            const result = await addedProduct.insertOne(newProduct);
            res.send(result);
        });
        // showing myproducts to client site sending data
        app.get('/addedItem', async (req, res) => {

            const query = {};
            const courser = addedProduct.find(query);
            const addProducts = await courser.toArray();
            res.send(addProducts);
        })
        // fiend id base to delete amy products
        app.get('/addedItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await addedProduct.findOne(query);
            res.send(product);
        });
        // update quantity
        app.put('/product/:id', async (req, res) => {

            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedQuantity[0].quantity,
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, option);
            res.send(result);
        })
        // Delivered Button Api
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    quantity: -1
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        //delete item from client site 
        app.delete('/addedItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await addedProduct.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
}
run().catch(console.dir);



// making api for root
app.get('/', (req, res) => {
    res.send('Running Spices Gudam');
});
app.listen(port, () => {
    console.log('Listing to port of spices gudam', port);
})