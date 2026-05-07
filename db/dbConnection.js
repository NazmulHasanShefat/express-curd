const { MongoClient, ServerApiVersion } = require('mongodb');
let db = null;
const connectdb = async()=>{
    if(db) return db;
     const client = new MongoClient(process.env.DB_URL, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });


    await client.connect();
    client.db("admin").command({ ping: 1 });
    console.log("✅ DB connected successfully");

    db = client.db("simpleCrud");
    return db;
}

module.exports = connectdb;