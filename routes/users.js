const express = require("express")
const nodemailer = require('nodemailer');
const router = express.Router()
const User = require("../models/user")
const Joi = require("@hapi/joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("config")
require("dotenv").config()


const cookieConfig = {
    maxAge: 900000000000,
    httpOnly: true,
    signed: true
}

if (!config.get("jwtPrivateKey1")) {
    console.log("Fattal error:Jwt private key 1 not defined")
    process.exit(1)
}

if (!config.get("jwtPrivateKey2")) {
    console.log("Fattal error:Jwt private key 2 not defined")
    process.exit(1)
}

router.get("/login", (req, res) => {
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

router.get("/register", (req, res) => {
    let email=req.signedCookies.nithin_verify
    let send="send"
    if(email){
        return res.render("just_registered", {
            email,send
        })
    }
    const cookie = req.signedCookies.nithin_token
    if (cookie) return res.redirect("/locker")
    res.render("register")
})

router.get("/verification/:id", (req, res) => {
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


error_message = ""
router.post("/register", async (req, res) => {
    let req_body_email=(req.body.email).toLowerCase()
    const {error} = fn1(req.body)
    if (error) {
        error_message = error.details[0].message
        res.render("register", {
            error_message
        })
        return error_message = ""
    }

    if (req.body.password != req.body.password2) {
        error_message = "passwords does not match"
        res.render("register", {
            error_message
        })
        return error_message = ""
    }

    

    const eml = await User.findOne({
        email: req_body_email
    })
    
    if (eml) {
        error_message = "email already exist"
        res.render("register", {
            error_message
        })
        return error_message = ""
    }

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(req.body.password, salt)


    const token = jwt.sign({
        email: req_body_email
    }, config.get("jwtPrivateKey2"))

    const users = new User({
        name: req.body.name,
        email: req_body_email,
        password: hashed,
        token: token,
        otp:""
    })

    const result = await users.save();

    module.exports=req_body_email

    

    const url = `documentstore.herokuapp.com/users/verification/verify?tok=${token}`


    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.EMAIL_ID,
        to: req_body_email,
        subject: 'Verifying account',
        html: `<h2>Hello Dear ${req.body.name}</h2>
            <p>               Thank you for using our app. Please verify you account using the following link below.</p>
            <h2 style="color:red">This link will expire after 24 hours. If not verified your account will also be deleted</h2>
             We will provide you the best service we can. Have a good day.
            <h4><a href=${url}>${url}</a></h4>

            <h3><b>Nithin K Joy (CEO)</b></h3>`,
        dsn: {
            id: "563",
            return: 'headers',
            notify: 'success',
            recipient: req_body_email
        }
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);
        console.log('Email sent: ' + info.response);
    });

    console.log(result)
    const email = req_body_email
    error_message = ""
    res.cookie("nithin_verify",req_body_email,cookieConfig)
    let send=""
    res.render("just_registered", {
        email,send
    })
})


router.post("/verification", async (req, res) => {
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


router.post("/login", async (req, res) => {
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

    const token = jwt.sign({
        id: User._id
    }, config.get("jwtPrivateKey1"))
    res.cookie("nithin_login", req_body_email, cookieConfig)
    res.cookie("nithin_token", token, cookieConfig)
    module.exports=req_body_email
    setTimeout(() => {
        res.redirect("/locker")
    }, 0)
})






router.get("/logout", (req, res) => {
    res.clearCookie("nithin_token")
    res.clearCookie("nithin_login")
    res.redirect("/users/login")
})

function fn1(msg) {

    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().min(3).max(100).required(),
        password: Joi.string().min(6).max(1024).required(),
        password2: Joi.string().required()
    })
    return schema.validate(msg)
}

module.exports = router