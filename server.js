const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const dns = require('dns');
const connectdb = require('./db/dbConnection');
dns.setServers(["1.1.1.1","8.8.8.8"]);

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());



app.get('/', (req, res)=>{
    res.send({status: "success", message: "server is running"});
})

app.use(async (req, res, next)=>{
    try {
        req.db = await connectdb();
        next();
    } catch (error) {
         res.status(500).send({ status: "error", message: "DB connection failed" });
    }
})

app.get("/users", async(req, res)=>{
    const userCollection = req.db.collection("users");
    const cursor = await userCollection.find();
    const users = await cursor.toArray();
    res.send({data: users})
})

app.listen(port, ()=>{
    console.log(`server is running on port http://localhost:${port}`);
})
