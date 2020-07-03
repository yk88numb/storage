const jwt = require("jsonwebtoken")
const config = require("config")
const app = require("express")()
app.set("view engine", "ejs")

module.exports=app.use(function(req,res,next){
    try{
       const token = req.signedCookies.nithin_token
        jwt.verify(token,config.get("jwtPrivateKey1"))
        return next()
    }catch(ex){
        res.redirect("/users/login")
    }
})