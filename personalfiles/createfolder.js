const fs = require("fs")
const path = require("path")

function createFolder(email) {
        //let email=require("../routes/view")
        console.log("creemail",email)
        fs.mkdir(path.join(__dirname, email),{recursive:true}, (err) => {
            if (err) {
                return console.error("errr",err);
            }
            console.log('Directory created successfully!');
        });  
        return __dirname
}
module.exports = createFolder