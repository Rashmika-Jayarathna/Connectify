import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import connectMongoDb from './db/connectMongoDb.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`erver is running on port: ${PORT}`);

    connectMongoDb();
});     