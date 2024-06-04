import connectDB from "./db/index.js";
import app from "./app.js";



/*const app=express()

(async ()=>
{
    try{
        await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`)
    }
    catch(error)
    {
        console.log(error);
    }
})()*/

connectDB()
.then(()=>
{
    app.listen(process.env.PORT||3000,()=>
    {
        console.log(`Server listening on port ${process.env.PORT}`)
    })
})
.catch((error)=>
{
    console.log("MongoDB connection failed:",error)
})
