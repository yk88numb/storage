const express = require("express")
const app = express()
const expressLayout = require("express-ejs-layouts")
const cookieParser = require("cookie-parser")
const view = require("./routes/view")
const index = require("./routes/index")
const locker = require("./routes/locker")
const rename = require("./routes/rename")
const remove = require("./routes/remove")
const forgot = require("./routes/forgot")
const upload = require("./routes/upload")
const resend = require("./routes/resend")
const change = require("./routes/change")
const login = require("./routes/users/login")
const logout = require("./routes/users/logout")
const verifyotp = require("./routes/verifyotp")
const register = require("./routes/users/register")
const newpassword = require("./routes/newpassword")
const verification = require("./routes/users/verification")
const downloadtoserver = require("./routes/downloadtoserver")
const deleteverification = require("./routes/deleteverification")
require("./config/db")
require('dotenv').config()
require("./config/prod")(app)
require("./config/privatekey")()

app.use(function (req, res, next) {
    console.log("req.subdomains[0]", req.subdomains[0])
    if (req.subdomains[0] !== undefined) {
        if ((req.get('X-Forwarded-Proto') !== 'https')) {
            res.redirect('https://' + req.get('Host') + req.url);
        } else {
            return next();
        }
    }
    next()
});

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(expressLayout)
app.set("view engine", "ejs")
app.use(express.urlencoded({
    extended: false
}))

app.use("/", index)
app.use("/view", view)
app.use("/rename", rename)
app.use("/change", change)
app.use("/remove", remove)
app.use("/resend", resend)
app.use("/forgot", forgot)
app.use("/upload", upload)
app.use("/locker", locker)
app.use("/users/login", login)
app.use("/users/logout", logout)
app.use("/verifyotp", verifyotp)
app.use("/users/register", register)
app.use("/newpassword", newpassword)
app.use("/users/verification", verification)
app.use("/downloadtoserver", downloadtoserver)
app.use("/deleteverification", deleteverification)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening to port ${port}`))