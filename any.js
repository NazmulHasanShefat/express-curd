const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// ✅ DB connection একবারই করা হবে, cached রাখা হবে
let db = null;

const connectDB = async () => {
    if (db) return db; // already connected হলে reuse করবে

    const client = new MongoClient(process.env.DB_URL, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ DB connected successfully");

    db = client.db("simpleCrud");
    return db;
};

// ✅ DB middleware - প্রতিটা request এ DB connection নিশ্চিত করবে
app.use(async (req, res, next) => {
    try {
        req.db = await connectDB();
        next();
    } catch (error) {
        res.status(500).send({ status: "error", message: "DB connection failed" });
    }
});

// ✅ Routes সব বাইরে
app.get('/', (req, res) => {
    res.send({ status: "success", message: "server is running" });
});

app.get('/hello', (req, res) => {
    res.send({ status: "success", message: "hello world" });
});

app.get('/users', async (req, res) => {
    const usersCollection = req.db.collection("users");
    const cursor = await usersCollection.find();
    const users = await cursor.toArray();
    res.send({ data: users });
});

app.get("/users/:id", async (req, res) => {
    const usersCollection = req.db.collection("users");
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const user = await usersCollection.findOne(query);
    res.send({ data: user });
});

app.post("/createuser", async (req, res) => {
    const usersCollection = req.db.collection("users");
    const newUser = req.body;
    const result = await usersCollection.insertOne(newUser);
    res.send({ success: true, message: "user created successfully", status: 201, data: result });
});

app.patch("/updateuser/:id", async (req, res) => {  // ✅ :id fix করা হয়েছে
    const usersCollection = req.db.collection("users");
    const updatableUser = req.body;
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDocument = { $set: updatableUser };
    const result = await usersCollection.updateOne(filter, updateDocument);
    res.send({ success: true, message: "user updated successfully", status: 200, data: result });
});

app.delete("/deleteuser/:id", async (req, res) => {
    const usersCollection = req.db.collection("users");
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send({ success: true, message: "user deleted successfully", status: 200, data: result });
});

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
});

module.exports = app; // ✅ Vercel এর জন্য export