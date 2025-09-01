import express from 'express';
import connectDB from './config/database';
import { config } from 'dotenv';
import cors from "cors"
config();

connectDB();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello NOD Readers!');
});

app.listen(port, () => {
return console.log(`Express server is listening at http://localhost:${port} 🚀`);
});