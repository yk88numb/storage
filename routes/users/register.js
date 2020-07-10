const router=require("express").Router()
const bcrypt=require("bcrypt")
const config=require("config")
let Joi=require("@hapi/joi")
const jwt=require("jsonwebtoken")
const nodemailer=require("nodemailer")
const User=require("../../models/user")
const cookieConfig=require("../../config/cookies")

router.get("/", (req, res) => {
    let error_message=""
    let email=req.signedCookies.nithin_verify
    let send="send"
    if(email){
        return res.render("just_registered", {
            email,send
        })
    }
    const cookie = req.signedCookies.nithin_token
    if (cookie) return res.redirect("/locker")
    res.render("register",{error_message})
})

router.post("/", async (req, res) => {
    let error_message = ""
    let req_body_email=(req.body.email).toLowerCase()
    const {error} = validate(req.body)
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


function validate(msg) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().min(3).max(100).required(),
        password: Joi.string().min(6).max(1024).required(),
        password2: Joi.string().required()
    })
    return schema.validate(msg)
}

module.exports = router