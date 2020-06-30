//latest update
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const index = require("./routes/index")
const users = require("./routes/users")
const expressLayout = require("express-ejs-layouts")
const fs = require('fs');
const jwt=require("jsonwebtoken")
const multer=require("multer")
const auth=require("./config/auth")
const User=require("./models/user")
const config=require("config")
const crypto=require("crypto")
const path=require("path")
const bcrypt=require("bcrypt")
const nodemailer = require('nodemailer');
const cookieParser=require("cookie-parser")
const AWS = require('aws-sdk');
require('dotenv').config()
const createFolder=require("./personalfiles/createfolder")
require("./routes/prod")(app)

app.use(function(req, res, next) {
    console.log("req.subdomains[0]",req.subdomains[0])
    if(req.subdomains[0]!==undefined){
        if ((req.get('X-Forwarded-Proto') !== 'https')) {
            res.redirect('https://' + req.get('Host') + req.url);
          } else{
            return next();
          }
    }
    next()
  });
  


const cookieConfig = {
    maxAge: 900000000000,
    httpOnly: true,
    signed: true
}

const ID = process.env.AWS_ID
const SECRET = process.env.AWS_SECRET

// Initializing S3 Interface
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

 const BUCKET_NAME = process.env.BUCKET_NAME


app.use(cookieParser(process.env.COOKIE_SECRET))

const db = require("./config/keys").MongoURI
mongoose.connect(db, {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex:true})
        .then(() => console.log("connected to database"))
        .catch(err => console.log(err))

app.use(expressLayout)
app.set("view engine", "ejs")
app.use(express.urlencoded({extended: false}))

app.use("/", index)
app.use("/users", users)

app.get("/locker" ,auth, async(req,res)=>{
    const email=req.signedCookies.nithin_login
    console.log("email",email)
    if(!email){
        res.clearCookie("nithin_token")
        res.clearCookie("nithin_login")
        return res.redirect("/users/login")
    }

    module.exports=email       
          let data=await User.findOne({email})
          if(!data) {
            res.clearCookie("nithin_token")
            res.clearCookie("nithin_login")
            return res.redirect("/users/login")
          }

          let file=data.files          
          let n=file.length
          for(i=0;i<n;i++){
                let b=file.splice(i,1).join("")
                file.splice(i,0,b.replace(email,""))
          }
          let message=""
          if(n==0) return res.render("upload2",{message})
          console.log(data.file)
          res.render("success",{message,file,n,email})

// Set the region 



    })

    app.get("/forgot",(req,res)=>{
        let msg=""
        res.render("forgot",{msg})
    })

    app.post("/deleteverification",async(req,res)=>{
        let email=req.signedCookies.nithin_verify
        if(!email) return res.redirect("/locker")
        await User.findOneAndDelete({email})
        res.clearCookie("nithin_verify")
        let error_message=""
        res.render("register",{error_message})
    })

    app.post("/forgot",async(req,res)=>{
        let req_body_email=(req.body.email).toLowerCase()
        let otp=Math.random().toString().substring(2,7)
        let user=await User.findOne({email:req_body_email})
        if(!user.otp){
            await User.updateOne({email:req_body_email},{$set:{otp:otp}})
        }else{
            otp=user.otp
        }
        
        
        let msg="E-mail doesn't exist"
        if(!user) return res.render("forgot",{msg})

        const transporter = nodemailer.createTransport({
            service:"gmail",
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
            html:`<h2>Hello Dear ${user.name}</h2>
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
          
          transporter.sendMail(mailOptions, (error, info)=>{
            if (error) return console.log(error);
              console.log('Email sent: ' + info.response);
          });
          let email=req_body_email
          let message=""
          res.render("forgot_otp",{email,message})
    })


    app.post("/verifyotp",async(req,res)=>{
        let req_body_email=(req.body.email).toLowerCase()
        let otp=req.body.otp
        let data=await User.findOne({email:req_body_email})
        if(data.otp==otp){
            let email=req_body_email
            let message=""
            return res.render("newpassword",{message,email})
        }else{
            let email=req_body_email
            let message="Wrong OTP"
            return res.render("forgot_otp",{email,message})
        }
    })


    app.post("/newpassword",async(req,res)=>{
        let req_body_email=(req.body.email).toLowerCase()
        if(req.body.password!==req.body.password2){
            let message="Passwords don't match"
            let email=req_body_email
            return res.render("newpassword",{message,email})
        }
        if(req.body.password.length<6){
            let email=req_body_email
            let message="password should be atleast 6 characters long"
            return res.render("newpassword",{message,email})
        }
        if(req.body.password===req.body.password2){ 
            let salt=await bcrypt.genSalt(10)
            let hashedPassword=await bcrypt.hash(req.body.password,salt)
            let data=await User.findOne({email:req_body_email})
            await User.updateOne({email:req_body_email},{$set:{password:hashedPassword}})
            await User.updateOne({email:req_body_email},{$set:{otp:""}})
            const token = jwt.sign({
                id: data._id
            }, config.get("jwtPrivateKey1"))
            res.cookie("nithin_login", req_body_email, cookieConfig)
            res.cookie("nithin_token", token, cookieConfig)
            module.exports=req_body_email
            setTimeout(() => {
                res.redirect("/locker")
            }, 0)
        }
    })





app.post("/locker",(req,res)=>{
    let file=req.body.name
    const email=req.signedCookies.nithin_login
    module.exports=email
    var paramss={Bucket:process.env.BUCKET_NAME,Key:`${email+file}`}
    s3.getObject(paramss,(err,data)=>{
        if(err) console.log(err,err.stack)
        else{
            iv = data.Body.slice(0, 16);
	        chunk = data.Body.slice(16);
            var decipher = crypto.createDecipheriv('aes-256-ctr',process.env.ENCRYPTION_PASSWORD,iv)
            var dec = Buffer.concat([decipher.update(chunk) , decipher.final()]);
            var buffer = new Buffer.from(dec, 'binary')
            console.log("BUFFER:" + buffer)
        createFolder()

fs.writeFile(`./personalfiles/${email}/${file}`, buffer,"binary", function(err,written){
   if(err) console.log(err);
    else {
     console.log("Successfully written");
     if(req.body.name)  res.download(__dirname+`/personalfiles/${email}/${file}`)
    }
});
            }
        })
    })

    app.post("/remove",async(req,res)=>{
        const email=req.signedCookies.nithin_login
        await User.updateOne({email},{$pull:{files:{$in:[email+req.body.name]}}})
        res.redirect("/locker")
    })    

    app.post("/view",(req,res)=>{
        let file=req.body.name
        let email=req.signedCookies.nithin_login
        module.exports=email
        var paramss={Bucket:process.env.BUCKET_NAME,Key:`${email+file}`}
    s3.getObject(paramss,(err,data)=>{
        if(err) console.log(err,err.stack)
        else{
            iv = data.Body.slice(0, 16);
            console.log("iv",iv)
            chunk = data.Body.slice(16);
            var decipher = crypto.createDecipheriv('aes-256-ctr',process.env.ENCRYPTION_PASSWORD,iv)
            var dec = Buffer.concat([decipher.update(chunk) , decipher.final()]);
        var buffer = new Buffer.from(dec, 'binary')
        //console.log("BUFFER:" + buffer)
        createFolder()

fs.writeFile(`./personalfiles/${email}/${file}`, buffer,"binary", function(err,written){
   if(err) console.log(err);
    else {
     console.log("Successfully written");
     if(req.body.name)  res.sendFile((__dirname+`/personalfiles/${email}/${file}`))
    }
});
            }
        })
    })


    app.get("/upload",auth,(req,res)=>{
        let message=""
        res.render("upload2",{message})
    })
    
    app.post("/upload",async(req,res)=>{

        const email=req.signedCookies.nithin_login

        module.exports=email
        const uploadFile = (fileName) => {
            // Read content from the file
            const file = fs.readFileSync(`./personalfiles/${email}/${fileName}`);
            let iv=crypto.randomBytes(16);
            console.log("iv",iv)
            let pass=process.env.ENCRYPTION_PASSWORD
            let cipher = crypto.createCipheriv('aes-256-ctr',pass,iv)
            let crypted = Buffer.concat([iv,cipher.update(file),cipher.final()]);
        
            // Setting up S3 upload parameters
            const params = {
                Bucket: BUCKET_NAME,
                Key: fileName, // File name you want to save as in S3
                Body: crypted
            };
        
            // Uploading files to the bucket
            s3.upload(params,async function(err, data) {
                if (err) {
                    console.log("err",err)
                }else{
                    await User.updateOne({email},{$push:{files:fileName}})
                    console.log(`File uploaded successfully. ${data.Location}`);
                    res.redirect("/locker")
                }
            });
        };

        createFolder()
        let count=0
        const storage=multer.diskStorage({
            destination:`./personalfiles/${email}`,
            filename:async function(req,file,cb){ 
                let data=await User.findOne({email})
                let n=data.files.length
                for(i=0;i<n;i++){
                    if(data.files[i]===file.originalname){
                        count=2
                    }
                }
                if(count==2){
                    cb(null,email+file.originalname+"-"+Date.now()+path.extname(file.originalname))
                }else{
                    cb(null,email+file.originalname)
                }
            } 
        })
        
        const upload=multer({
            storage:storage
        }).single("myImage")

        console.log("name",req.body.myImage)
        upload(req,res,(err)=>{
            if(err){
                res.render("upload",{message:err})
            }else{
                
                console.log("req.file",req.file)
                uploadFile(req.file.filename)                
            }
        })
        
    })




    app.get("/change",auth,(req,res)=>{
        let message=""
        res.render("changepassword",{message})
    })
    
    
    app.post("/change",async(req,res)=>{       
        let message="passwords don't match"
        if(req.body.password!==req.body.password2) return res.render("changepassword",{message})
        message="password should be atleast 6 character long"
        if(req.body.password.length<6) return res.render("changepassword",{message})
        const cookie=req.signedCookies.nithin_login
        //console.log("cookie",cookie)
        const user=await User.findOne({email:cookie})
        //console.log("user",user)
                if(user){
                        const pass = await bcrypt.compare(req.body.oldpassword, user.password)
                        message="old password is wrong"
                        if(!pass) return res.render("changepassword",{message})
                        if(pass){
                                const salt=await bcrypt.genSalt(10)
                                const hash=await bcrypt.hash(req.body.password,salt)
                                user.password=hash
                                await user.save()
                        }
                        const user1=await User.findOne({email:cookie})
                        console.log("user1",user1)
                        await User.updateOne({_id:user1._id},{$unset: {expireAt:1}})
                        return res.render("dashboard")
                }
            res.send("Dont try to hack this app")    
    })

    app.post("/resend",async(req,res)=>{
        let req_body_email=(req.body.email).toLowerCase()
        console.log(req_body_email)
        const user=await User.findOne({email:req_body_email})
        console.log("user",user)
        console.log("token",user.token) 
        if(!user.token) return res.redirect("/locker")
        const url=`documentstore.herokuapp.com/users/verification/verify?tok=${user.token}`


    const transporter = nodemailer.createTransport({
      service:"gmail",
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
      html:`<h2>Hello Dear ${user.name}</h2>
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
    
    transporter.sendMail(mailOptions, (error, info)=>{
      if (error) return console.log(error);
        console.log('Email sent: ' + info.response);
    });
    const email=req_body_email
    let send=""
    res.render("just_registered",{email,send})
    })
    


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening to port ${port}`))