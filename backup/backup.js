const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const dns = require('dns');
dns.setServers(["1.1.1.1","8.8.8.8"]);

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());



app.get('/', (req, res)=>{
    res.send({status: "success", message: "server is running"});
})
app.get('/hello', (req, res)=>{
    res.send({status: "success", message: "hello world"});
})


// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(process.env.DB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.listen(port, ()=>{
    console.log(`server is running on port http://localhost:${port}`);
})

const run = async()=>{
    try {
        await client.connect();

        const databse = client.db("simpleCrud")
        const usersCollection = databse.collection("users");


        app.get('/users', async(req, res)=>{
            const cursor = await usersCollection.find();
            const users = await cursor.toArray();
            res.send({data: users});
        })

        app.get("/users/:id", async(req, res)=>{ 
            const id = req.params.id;
           const query = { _id: new ObjectId(id) }
           const user = await usersCollection.findOne(query);
           console.log("user id",id)
           res.send({data: user})           
        })

        app.post("/createuser", async(req, res)=>{
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send({ success: true, message: "user created successfully", status: 201, data: result});
            console.log("insert result", result);
        })

        app.patch("/updateuser", async(req, res)=>{
            const updatableUser = req.body;
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}

            const updateDocument = {
                $set: updatableUser
            }
            const result = await usersCollection.updateOne(filter, updateDocument);
            res.send({ success: true, message: "user updated successfully", status: 200, data: result});
            console.log("update result", result);
        })

        app.delete("/deleteuser/:id", async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await usersCollection.deleteOne(query);
            res.send({ success: true, message: "user deleted successfully", status: 200, data: result});
             console.log("delete result", result);
        })


        await client.db("admin").command({ ping: 1});
        console.log(`✅ db connected successfully`)
        
    } catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);