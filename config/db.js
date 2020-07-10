const mongoose = require("mongoose")

const db = require("./keys").MongoURI
mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log("connected to database"))
    .catch(err => console.log(err))

module.exports=db