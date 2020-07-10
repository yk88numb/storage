const express=require("express")
const router=express.Router()
const User=require("../models/user")
const nodemailer=require("nodemailer")

router.get("/", (req, res) => {
    let msg = ""
    res.render("forgot", {
        msg
    })
})



router.post("/", async (req, res) => {
    let req_body_email = (req.body.email).toLowerCase()
    let otp = Math.random().toString().substring(2, 7)
    let user = await User.findOne({
        email: req_body_email
    })
    if (!user.otp) {
        await User.updateOne({
            email: req_body_email
        }, {
            $set: {
                otp: otp
            }
        })
    } else {
        otp = user.otp
    }


    let msg = "E-mail doesn't exist"
    if (!user) return res.render("forgot", {
        msg
    })

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
                  <p>               Your password reset request has been recieved.</p>
                  <h2 style="color:green">Your OTP is ${otp}</h2>
      
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
    let email = req_body_email
    let message = ""
    res.render("forgot_otp", {
        email,
        message
    })
})

module.exports=router