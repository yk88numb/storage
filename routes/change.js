const express = require("express")
const router = express.Router()
const bcrypt=require("bcrypt")
const User=require("../models/user")
const auth=require("../config/auth")

router.get("/", auth, (req, res) => {
    let message = ""
    res.render("changepassword", {
        message
    })
})


router.post("/", async (req, res) => {
    let message = "passwords don't match"
    if (req.body.password !== req.body.password2) return res.render("changepassword", {
        message
    })
    message = "password should be atleast 6 character long"
    if (req.body.password.length < 6) return res.render("changepassword", {
        message
    })
    const cookie = req.signedCookies.nithin_login
    //console.log("cookie",cookie)
    const user = await User.findOne({
        email: cookie
    })
    //console.log("user",user)
    if (user) {
        const pass = await bcrypt.compare(req.body.oldpassword, user.password)
        message = "old password is wrong"
        if (!pass) return res.render("changepassword", {
            message
        })
        if (pass) {
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(req.body.password, salt)
            user.password = hash
            await user.save()
        }
        const user1 = await User.findOne({
            email: cookie
        })
        console.log("user1", user1)
        await User.updateOne({
            _id: user1._id
        }, {
            $unset: {
                expireAt: 1
            }
        })
        return res.render("dashboard")
    }
    res.send("Dont try to hack this app")
})

module.exports=router