const express=require("express")
const router=express.Router()
const bcrypt=require("bcrypt")
const config=require("config")
const jwt=require("jsonwebtoken")
const User=require("../../models/user")
const cookieConfig=require("../../config/cookies")

router.get("/", (req, res) => {
    let email=req.signedCookies.nithin_verify
    let send="send"
    if(email){
        return res.render("just_registered", {
            email,send
        })
    }
    const cookie = req.signedCookies.nithin_token
    if (cookie) return res.redirect("/locker")
    error = ""
    success_msg = ""
    error_msg = ""
    res.render("login", {
        error,
        success_msg,
        error_msg
    })
})

router.post("/", async (req, res) => {
    let req_body_email=(req.body.email).toLowerCase()
    const user = await User.findOne({
        email: req_body_email
    })
    if (!user) {
        error = "E-mail not registered"
        success_msg = ""
        error_msg = ""
        return res.render("login", {
            error,
            success_msg,
            error_msg
        })
    }

    const pass = await bcrypt.compare(req.body.password, user.password)
    if (!pass) {
        error = "Invalid password"
        success_msg = ""
        error_msg = ""
        return res.render("login", {
            error,
            success_msg,
            error_msg
        })
    }

    if (!user.verified) {
        error = "Your account is not verified, We have sent you a mail, please open your E-mail to get verification link"
        success_msg = ""
        error_msg = ""
        return res.render("verify_login", {
            error,
            success_msg,
            error_msg
        })
    }

    const token = jwt.sign({id: User._id}, config.get("jwtPrivateKey1"))
    res.cookie("nithin_login", req_body_email, cookieConfig)
    res.cookie("nithin_token", token, cookieConfig)
    module.exports=req_body_email
    setTimeout(() => {
        res.redirect("/locker")
    }, 0)
})

module.exports=router
