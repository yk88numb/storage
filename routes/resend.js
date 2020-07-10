const express=require("express")
const router=express.Router()
const User=require("../models/user")
const nodemailer=require("nodemailer")

router.post("/", async (req, res) => {
    let req_body_email = (req.body.email).toLowerCase()
    console.log(req_body_email)
    const user = await User.findOne({
        email: req_body_email
    })
    console.log("user", user)
    console.log("token", user.token)
    if (!user.token) return res.redirect("/locker")
    const url = `documentstore.herokuapp.com/users/verification/verify?tok=${user.token}`


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
        html: `<h2>Hello Dear ${user.name}</h2>
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
    const email = req_body_email
    let send = ""
    res.render("just_registered", {
        email,
        send
    })
})

module.exports=router