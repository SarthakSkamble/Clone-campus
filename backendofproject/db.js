const mongoose=require("mongoose");
const { string } = require("zod");
require("dotenv").config()
mongoose.connect(process.env.MONGO_URI)
.then(console.log("connected"))
.catch(console.log("Not connected"))


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      
    },
    username:{
        type: String
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },
    collage:{
    type: String,
    require: true
    },
    department:{
        type: String,
        required:true
    },



  },
);
const menuSchema = new mongoose.Schema({
  category: String,       // e.g., Veg Rice, Pizza, Coffee
  subCategory: String,    // Veg, Non-Veg, or Drinks/Desserts
  itemName: String,       // e.g., Veg Fried Rice
  prices: [Number]        // Multiple prices if applicable
});

const Food_item_list = mongoose.model("MenuItem", menuSchema);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      food: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
      quantity: { type: Number, default: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "preparing", "ready", "completed"], 
    default: "pending" 
  }
});

const admin= new mongoose.Schema({
      shop_name:String,
      email:String,
      password:String,
      phone:String,


})

const User = mongoose.model("User", userSchema);

const Order = mongoose.model("Order", orderSchema);
const Admin= mongoose.model("Admin",admin)
module.exports={User,Food_item_list,Order,Admin}
