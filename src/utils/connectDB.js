import mongoose from 'mongoose';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        console.log('Already connected!');
        return;
    }

    mongoose.set("strictQuery", false);

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
  
        });
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        throw err;
    }
};

export default connectDB;
