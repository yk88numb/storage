const express=require("express")
const router=express.Router()
const User=require("../models/user")

router.post("/", async (req, res) => {
    const email = req.signedCookies.nithin_login
    await User.updateOne({
        email
    }, {
        $pull: {
            files: {
                $in: [email + req.body.name]
            }
        }
    })
    res.redirect("/locker")
})

module.exports=router