const express = require("express")
const auth = require("../config/auth")
const router = express.Router()
const User=require("../models/user")
const aws=require("../config/aws")
const crypto = require("crypto")
const createFolder = require("../personalfiles/createfolder")
const fs=require("fs")

router.get("/", auth, async (req, res) => {
    const email = req.signedCookies.nithin_login
    console.log("email", email)
    if (!email) {
        res.clearCookie("nithin_token")
        res.clearCookie("nithin_login")
        return res.redirect("/users/login")
    }

    module.exports = email
    let data = await User.findOne({
        email
    })
    if (!data) {
        res.clearCookie("nithin_token")
        res.clearCookie("nithin_login")
        return res.redirect("/users/login")
    }

    let file = data.files
    let n = file.length
    for (i = 0; i < n; i++) {
        let b = file.splice(i, 1).join("")
        file.splice(i, 0, b.replace(email, ""))
    }
    let message = ""
    if (n == 0) return res.render("upload2", {
        message
    })
    console.log(data.file)
    res.render("success", {
        message,
        file,
        n,
        email
    })

})


router.post("/", (req, res) => {
    let file = req.body.name
    const email = req.signedCookies.nithin_login
    module.exports = email
    var paramss = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${email+file}`
    }
    let s3=aws()
    s3.getObject(paramss, (err, data) => {
        if (err) console.log(err, err.stack)
        else {
            let dir=createFolder(email)
            iv = data.Body.slice(0, 16);
            chunk = data.Body.slice(16);
            var decipher = crypto.createDecipheriv('aes-256-ctr', process.env.ENCRYPTION_PASSWORD, iv)
            var dec = Buffer.concat([decipher.update(chunk), decipher.final()]);
            var buffer = new Buffer.from(dec, 'binary')
            console.log("BUFFER:" + buffer)
            

            fs.writeFile(`${dir}/${email}/${file}`, buffer, "binary", function (err, written) {
                if (err) console.log(err);
                else {
                    console.log("Successfully written");
                    if (req.body.name) res.download(`${dir}/${email}/${file}`)
                }
            });
        }
    })
})


module.exports=router