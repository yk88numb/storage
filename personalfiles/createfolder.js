const fs = require("fs")
const path = require("path")

function createFolder() {
    const email = require("../app")
    console.log("createFolderemail",email)
    fs.mkdir(path.join(__dirname, email),{recursive:true}, (err) => {
        if (err) {
            return console.error("errr",err);
        }
        console.log('Directory created successfully!');
    });
    
}
module.exports = createFolder