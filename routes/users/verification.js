const router=require("express").Router()
const bcrypt=require("bcrypt")
const config=require("config")
const jwt=require("jsonwebtoken")
const User=require("../../models/user")
const cookieConfig=require("../../config/cookies")

router.get("/:id", (req, res) => {
    let error_message=""
    try {
        const query_string = req.query
        const tok = query_string.tok
        console.log(tok)
        jwt.verify(tok, config.get("jwtPrivateKey2"))



        error = ""
        success_msg = ""
        error_msg = ""
        res.render("verify_login", {
            error,
            error_message,
            error_msg
        })
    } catch (ex) {
        res.send("invalid URL")
    }
})






router.post("/", async (req, res) => {
    let req_body_email=(req.body.email).toLowerCase()
    const user = await User.findOne({
        email: req_body_email
    })
    if (!user) {
        error = "E-mail not registered"
        return res.render("verify_login", {
            error
        })
    }

    const pass = await bcrypt.compare(req.body.password, user.password)
    if (!pass) {
        error = "Invalid password"
        return res.render("verify_login", {
            error
        })
    }

     // module.exports=client
    try {
        const user = await User.findOne({
            email: req_body_email
        })
        if (user) {
            user.verified = true
            await user.save()
            await User.update({
                _id: user._id
            }, {
                $unset: {
                    token: 1
                }
            })
            await User.update({
                _id: user._id
            }, {
                $unset: {
                    expireAt: 1
                }
            })
            const token = jwt.sign({
                id: user._id
            }, config.get("jwtPrivateKey1"))
            res.clearCookie("nithin_verify")
            res.cookie("nithin_token", token, cookieConfig)
            res.cookie("nithin_login", req_body_email, cookieConfig)
            res.render("verified")
        }
    } catch (ex) {
        res.send("something went wrong! but your account is verified")
    }
})

module.exports=router