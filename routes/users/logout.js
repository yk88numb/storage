const router=require("express").Router()

router.get("/", (req, res) => {
    res.clearCookie("nithin_token")
    res.clearCookie("nithin_login")
    res.redirect("/users/login")
})

module.exports=router