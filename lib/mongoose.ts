import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () =>{
    mongoose.set('strictQuery',true);
    if(!process.env.MONGODB_URL) return console.log("MONGODB_URL not found!!");
    if(isConnected) return console.log("already connected to MONGODB");

    try {
        await mongoose.connect(process.env.MONGODB_URL);
        isConnected= true;

        console.log("Connection to database successfull")
    } catch (error: any) {
        throw new Error(`Unable to connect to database: ${error.message}`);
    }
}