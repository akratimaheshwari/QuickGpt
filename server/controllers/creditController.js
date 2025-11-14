import Transaction from "../models/Transaction.js"
import Stripe from 'stripe';

const plans = [
    
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "Basic AI chat",
      "Limited message history"
    ]
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "Text AI chat",
      "Basic image generation",
      "Email support"
    ]
  },
  {
    _id: "premium",
    name: "premium",
    price: 30,
    credits: 1000,
    features: [
      "AI text + image generation",
      "Priority support",
      "Unlimited chat history"
    ]
  }
]
//api for getting all plans
export const getPlans = async (req,res)=>{
    try {
        res.json({success: true,plans})
    } catch (error) {
        res.json({success:false,message: error.message})
    }
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// api for purchasing a plan
export const purchansePlan = async (req,res)=>{
    try {
        const {planId} = req.body
        const userid = req.user._id
        const plan = plans.find(plan => plan._id===planId)

        if(!plan){
            return res.json({success:false,message:"Invalid plan"})
        }

        // create new transaction
        const transaction = await Transaction.create({
            userId: userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })
        const{origin} = req.headers;

        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: plan.price * 100,
                product_data: {
                    name: plan.name
                }
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${origin}/loading`,
          cancel_url: `${origin}`,
          metadata:{transactionId: transaction._id.toString(),appId: 'quickgpt'} ,
          expires_at: Math.floor(Date.now()/1000)+30 *60,  // expire in 30 miutes

        });

        res.json({success: true,url: session.url})
    } catch (error) {
        res.json({success: false,message:error.message})
    }
}
