const express=require("express")
const router=express.Router()
const userroute=require("./user")
const adminroute=require("./admin")
router.use("/user",userroute)
router.use("/admin",adminroute)
module.exports=router