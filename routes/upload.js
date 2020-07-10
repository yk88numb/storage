const express = require("express")
const router = express.Router()
const User=require("../models/user")
const aws=require("../config/aws")
const crypto = require("crypto")
const fs=require("fs")
const multer = require("multer")
const path=require("path")
const createFolder = require("../personalfiles/createfolder")
const auth=require("../config/auth")

router.get("/", auth, (req, res) => {
    let message = ""
    res.render("upload2", {
        message
    })
})

router.post("/", async (req, res) => {

    const email = req.signedCookies.nithin_login

    module.exports = email
    const uploadFile = (fileName) => {
        const file = fs.readFileSync(`${dir}/${email}/${fileName}`);
        let iv = crypto.randomBytes(16);
        console.log("iv", iv)
        let pass = process.env.ENCRYPTION_PASSWORD
        let cipher = crypto.createCipheriv('aes-256-ctr', pass, iv)
        let crypted = Buffer.concat([iv, cipher.update(file), cipher.final()]);
        
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName, 
            Body: crypted
        };

        let s3=aws()
        s3.upload(params, async function (err, data) {
            if (err) {
                console.log("err", err)
            } else {
                await User.updateOne({
                    email
                }, {
                    $push: {
                        files: fileName
                    }
                })
                console.log(`File uploaded successfully. ${data.Location}`);
                res.redirect("/locker")
            }
        });
    };

    let dir=createFolder(email)
    console.log("dir",dir)
    let count = 0
    const storage = multer.diskStorage({
        destination: `${dir}/${email}`,
        filename: async function (req, file, cb) {
            let data = await User.findOne({
                email
            })
            let n = data.files.length
            for (i = 0; i < n; i++) {
                console.log("data.files[i]",data.files[i])
                console.log("file.originalname",file.originalname)
                if (data.files[i] === email+file.originalname) {
                    count = 2
                }
            }
            if (count == 2) {
                cb(null, email + file.originalname + "-" + Date.now() + path.extname(file.originalname))
            } else {
                cb(null, email + file.originalname)
            }
        }
    })

    const upload = multer({
        storage: storage
    }).single("myImage")

    console.log("name", req.body.myImage)
    upload(req, res, (err) => {
        if (err) {
            res.render("upload", {
                message: err
            })
        } else {
            console.log("req.file", req.file)
            uploadFile(req.file.filename)
        }
    })

})

module.exports=router