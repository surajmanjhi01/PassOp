const express = require('express')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'passop';
// console.log(process.env.MONGO_URI)
const app = express()
const port = 3000
app.use(bodyParser.json());
app.use(cors());

 client.connect();
 //get all the passwords
app.get('/', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    res.json(findResult);
})
//save the passwords
app.post('/', async (req, res) => {
    const password=req.body;
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.insertOne(password);
    res.send({sucess:true,message:"Password saved successfully"});
})
//Delete the passwords by id
const { ObjectId } = require("mongodb");

app.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const db = client.db(dbName);
        const collection = db.collection("passwords");

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Delete failed" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)

})
