
const express=require("express")
const router=express.Router()

router.get("/",(req,res)=>{
    const cookie=req.signedCookies.nithin_token
    if(cookie) return res.redirect("/locker")
    res.render("welcome")
})

module.exports=router