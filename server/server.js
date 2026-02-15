import express from 'express';
import 'dotenv/config'
import cors from 'cors'
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import creditsRoutes from './routes/creditsRoutes.js';
import { stripeWebhooks } from './controllers/webhookController.js';

const app = express()

await connectDB()

//stripe webhooks
app.post('/api/stripe',express.raw({type: 'application/json'}),stripeWebhooks)

//middleware
app.use(cors({
  origin: "https://quick-gpt-kappa-azure.vercel.app",
  credentials: true
}));
app.use(express.json())

//route
app.get('/',(req,res)=>res.send('Server is live'))
app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);
app.use('/api/credit',creditsRoutes);

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})