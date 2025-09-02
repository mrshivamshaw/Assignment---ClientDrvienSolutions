import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import { eventRoutes } from './routes/event';
import { authRoutes } from './routes/auth';
import connectDB from './config/database';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});