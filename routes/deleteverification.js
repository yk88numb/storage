const express=require("express")
const router=express.Router()
const User=require("../models/user")

router.post("/", async (req, res) => {
    let email = req.signedCookies.nithin_verify
    if (!email) return res.redirect("/locker")
    await User.findOneAndDelete({
        email
    })
    res.clearCookie("nithin_verify")
    let error_message = ""
    res.render("register", {
        error_message
    })
})

module.exports=router