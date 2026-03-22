import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // @ts-ignore
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("Lien ket thanh cong");
    } catch (error) {
        console.log("loi khi ket nooi", error);
        process.exit(1);
    }
};