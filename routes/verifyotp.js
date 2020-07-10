const express=require("express")
const router=express.Router()
const User=require("../models/user")

router.post("/", async (req, res) => {
    let req_body_email = (req.body.email).toLowerCase()
    let otp = req.body.otp
    let data = await User.findOne({
        email: req_body_email
    })
    if (data.otp == otp) {
        let email = req_body_email
        let message = ""
        return res.render("newpassword", {
            message,
            email
        })
    } else {
        let email = req_body_email
        let message = "Wrong OTP"
        return res.render("forgot_otp", {
            email,
            message
        })
    }
})

module.exports=router