const express=require("express")
const router=express.Router()
const zod = require("zod")
const jwt=require("jsonwebtoken")
const argon2 = require("argon2");
const {User,Food_item_list,Order,Admin}=require("../db");
const mongoose = require("mongoose");
require("dotenv").config()

const Schema=zod.object({
    shop_name:zod.string(),
      email:zod.string().email(),
      password:zod.string(),
      phone:zod.string(),
})

router.post("/signup",async (req,res)=>
{
   const {shop_name,email,password,phone}=req.body
      const check=Schema.safeParse(req.body)
      if(!check){
       res.json({
           msg:"Invalid Infromation"
       })
      }
      const exists= await Admin.findOne({
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
      const user=await Admin.create({
           shop_name:shop_name,
           email:email,
           password:hashedPassword,
           phone:phone

   
    
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
    const user = await Admin.findOne({ email });
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