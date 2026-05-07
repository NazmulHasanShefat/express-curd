const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const dns = require('dns');

const { connectdb, getUsersCollection } = require('./db/dbConnection.js');
const e = require('express');

dns.setServers(["1.1.1.1","8.8.8.8"]);

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send({status: "success", message: "server is running"});
})

connectdb()
    .then(() => console.log("✅ DB connected successfully"))
    .catch((err) => {
        console.log("❌ DB connection failed", err);
        process.exit(1); // DB connect না হলে server বন্ধ করো
    });

app.get("/users", async(req, res)=>{
    const usersCollection = await getUsersCollection();
    const cursor = await usersCollection.find();
    const users = await cursor.toArray();
    res.send({data: users})
})

app.get("/users/:id", async(req, res)=>{
    const id = req.params.id;
    const usersCollection = await getUsersCollection();
    const query = {_id: new ObjectId(id)};
    const user = await usersCollection.findOne(query);
    if(user){
        res.send({data: user});
    } else {
        res.status(404).send({status: "error", message: "User not found"});
    }
})


app.post("/createuser", async(req, res)=>{
    const newUser = req.body;
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.insertOne(newUser);
    console.log(result.acknowledged);
    if(result.acknowledged){
        res.send({status: "success", message: "User created successfully", data: result})
    } else {
        res.status(500).send({status: "error", message: "Failed to create user"})
    }
})

app.patch("/updateuser/:id", async(req, res)=>{
    const id = req.params.id;
    const updatedData = req.body;
    const usersCollection = await getUsersCollection();
    const query = {_id: new ObjectId(id)};
    const updatableUser = {
        $set: {
            name: updatedData.name,
            email: updatedData.email,
            role: updatedData.role
        }
    }
    const result = await usersCollection.updateOne(query, updatableUser);
    if(result.modifiedCount > 0){
        res.send({status: "success", message: "User updated successfully", data: result})
    } else {
        res.status(500).send({status: "error", message: "Failed to update user"})
    }
})

app.delete("/deleteuser/:id", async(req, res)=>{
    const id = req.params.id;
    const usersCollection = await getUsersCollection();
    const query = {_id: new ObjectId(id)};
    const result = await usersCollection.deleteOne(query);
    if(result.deletedCount > 0){
        res.send({status: "success", message: "User deleted successfully", data: result})
    } else {
        res.status(500).send({status: "error", message: "Failed to delete user"})
    }
})


app.listen(port, ()=>{
    console.log(`server is running on port http://localhost:${port}`);
})
