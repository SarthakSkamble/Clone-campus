const express=require("express")
const router=express.Router()
const zod = require("zod")
const jwt=require("jsonwebtoken")
const argon2 = require("argon2");
const {User,Food_item_list,Order}=require("../db");
const { default: mongoose } = require("mongoose");
require("dotenv").config()

const userSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  username: zod.string().min(3, "Username must be at least 3 characters"),
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  phone: zod.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  collage: zod.string().min(2, "College name is required"),
  department: zod.string().min(2, "Department is required")
});

router.post("/signup",async (req,res)=>
{
   const {name,username,email,password,phone,collage,department}=req.body
   const check=userSchema.safeParse(req.body)
   if(!check){
    res.json({
        msg:"Invalid Infromation"
    })
   }
   const exists= await User.findOne({
      email:email
   })
   if (exists)
   {
      res.json({
        msg:"User exists"
      })
      return
   }
   const hashedPassword = await argon2.hash(password);
   const user=await User.create({
        name:name,
        username:username,
        email:email,
        password: hashedPassword,
        phone:phone ,
        collage: collage,
        department: department


   })
   const userid=user._id
   const token = jwt.sign({ userid :userid }, process.env.JWT_SECRET, { expiresIn: "1h" });
   res.status(201).json({ msg: "Signup successful", token });

})
router.post("/signin",async (req,res)=>
{
    try {
    const { email, password } = req.body;

    // 1. Find user by firstname
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // 2. Compare entered password with stored hash
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
  { userid: user._id}, 
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);


    return res.json({ msg: "Signin successful",userid:user._id, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }

})

module.exports=router
