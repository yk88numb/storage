const express=require("express")
const router=express.Router()
const fs=require("fs")
const crypto=require("crypto")
const User=require("../models/user")
const aws=require("../config/aws")
const createFolder=require("../personalfiles/createfolder")


router.post("/", async (req, res) => {
    const email = req.signedCookies.nithin_login
    console.log("email", email)
    var BUCKET_NAME = process.env.BUCKET_NAME;
    var OLD_KEY = email + req.body.oldname;
    var NEW_KEY = email + req.body.newname + req.body.extension;

    let file = req.body.oldname
    console.log("file", file)
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
                    //upload
                    const uploadFile = (fileName, newFileName) => {
                        // Read content from the file
                        const file = fs.readFileSync(`${dir}/${email}/${fileName}`);
                        let iv = crypto.randomBytes(16);
                        console.log("iv", iv)
                        let pass = process.env.ENCRYPTION_PASSWORD
                        let cipher = crypto.createCipheriv('aes-256-ctr', pass, iv)
                        let crypted = Buffer.concat([iv, cipher.update(file), cipher.final()]);

                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: BUCKET_NAME,
                            Key: newFileName, // File name you want to save as in S3
                            Body: crypted
                        };

                        // Uploading files to the bucket
                        s3.upload(params, async function (err, data) {
                            if (err) {
                                console.log("err", err)
                            } else {
                                //await User.updateOne({email},{$push:{files:fileName}})
                                console.log(`File uploaded successfully. ${data.Location}`);
                                res.redirect("/locker")
                            }
                        });
                    };
                    uploadFile(file, NEW_KEY)
                }

            });
        }
    })

    await User.updateOne({
        files: OLD_KEY
    }, {
        $set: {
            "files.$": NEW_KEY
        }
    })
    res.redirect("/locker")
})

module.exports=router