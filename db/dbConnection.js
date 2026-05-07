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
    db = client.db("simpleCrud");
    return db;
}

/**
 * @returns {import('mongodb').Collection}  //for suggestion
 */

const getUsersCollection = async () => {
    const database = await connectdb();
    return database.collection("users"); 
};
module.exports = { connectdb, getUsersCollection };