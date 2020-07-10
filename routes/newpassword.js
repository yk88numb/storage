const express=require("express")
const router=express.Router()
const User=require("../models/user")
const config=require("config")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const cookieConfig=require("../config/cookies")

router.post("/", async (req, res) => {
    let req_body_email = (req.body.email).toLowerCase()
    if (req.body.password !== req.body.password2) {
        let message = "Passwords don't match"
        let email = req_body_email
        return res.render("newpassword", {
            message,
            email
        })
    }
    if (req.body.password.length < 6) {
        let email = req_body_email
        let message = "password should be atleast 6 characters long"
        return res.render("newpassword", {
            message,
            email
        })
    }
    if (req.body.password === req.body.password2) {
        let salt = await bcrypt.genSalt(10)
        let hashedPassword = await bcrypt.hash(req.body.password, salt)
        let data = await User.findOne({
            email: req_body_email
        })
        await User.updateOne({
            email: req_body_email
        }, {
            $set: {
                password: hashedPassword
            }
        })
        await User.updateOne({
            email: req_body_email
        }, {
            $set: {
                otp: ""
            }
        })
        const token = jwt.sign({
            id: data._id
        }, config.get("jwtPrivateKey1"))
        res.cookie("nithin_login", req_body_email, cookieConfig)
        res.cookie("nithin_token", token, cookieConfig)
        module.exports = req_body_email
        setTimeout(() => {
            res.redirect("/locker")
        }, 0)
    }
})

module.exports=router