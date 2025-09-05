const mongoose=require("mongoose")
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
const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ["snack", "meal", "drink"], default: "snack" },
  isAvailable: { type: Boolean, default: true }
});

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

const User = mongoose.model("User", userSchema);
const food_item_list = mongoose.model("food_item_list", foodItemSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports={User,food_item_list,Order}
