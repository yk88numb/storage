const express=require("express")
const router=express.Router()
const fs=require("fs")
const crypto=require("crypto")
const User=require("../models/user")
const download=require("download")
const FileType=require("file-type")
const aws=require("../config/aws")
const got = require('got');
const createFolder=require("../personalfiles/createfolder")

router.get("/", (req, res) => {
    res.render("downloadtoserver")
})

router.post("/", async (req, res) => {
    let email = req.signedCookies.nithin_login
    let dir=createFolder(email)
    const uploadFile = (fileName) => {
        const file = fs.readFileSync(`${dir}/${email}/${fileName}`);
        let iv = crypto.randomBytes(16);
        console.log("iv", iv)
        let pass = process.env.ENCRYPTION_PASSWORD
        let cipher = crypto.createCipheriv('aes-256-ctr', pass, iv)
        let crypted = Buffer.concat([iv, cipher.update(file), cipher.final()]);

        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName, // File name you want to save as in S3
            Body: crypted
        };

        let s3=aws()
        // Uploading files to the bucket
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

    



    const url = req.body.url
    const stream = got.stream(url);

    let ext = await FileType.fromStream(stream);
    console.log("ext", ext)
    let fname = ""
    if (!ext) {
        fname = email + Date.now().toString() + "." + "txt"
    } else {
        fname = email + Date.now().toString() + "." + ext.ext
    }
    fs.writeFileSync(`${dir}/${email}/${fname}`, await download(req.body.url));
    uploadFile(fname)
    res.redirect("/locker")
})

module.exports=router