const express=require("express")
const router=express.Router()
const aws=require("../config/aws")
const fs=require("fs")
const crypto=require("crypto")
const createFolder = require("../personalfiles/createfolder")

router.post("/", (req, res) => {
    let file = req.body.name
    console.log("file", file)
    let email = req.signedCookies.nithin_login
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
            console.log("dir",dir)
            iv = data.Body.slice(0, 16);
            console.log("iv", iv)
            chunk = data.Body.slice(16);
            var decipher = crypto.createDecipheriv('aes-256-ctr', process.env.ENCRYPTION_PASSWORD, iv)
            var dec = Buffer.concat([decipher.update(chunk), decipher.final()]);
            var buffer = new Buffer.from(dec, 'binary')
            //console.log("BUFFER:" + buffer)
            
            
            console.log("file",file)
            
            fs.writeFile(`${dir}/${email}/${file}`, buffer, "binary", function (err, written) {
                if (err) console.log(err);
                else {
                    console.log("Successfully written");
                    if (req.body.name) res.sendFile((`${dir}/${email}/${file}`))
                }
            });
        }
    })
})

module.exports=router