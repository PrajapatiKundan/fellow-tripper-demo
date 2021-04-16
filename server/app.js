const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { MONGOURI } = require('./config/keys')

//------------------------------------------------Make Connection------------------------------------------|
mongoose.connect(MONGOURI, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify: false
})

mongoose.connection.on('connected', () => {
    //'connected' is connection EVENT 
    console.log("server connected successfully")
})

mongoose.connection.on('error', (err) => {
    // console.log("Error in server connection : ", err)
})
//-----------------------------------------------Model Registration-------------------------------------------|
require('./models/user')
require('./models/post')
//-----------------------------------------------Middleware---------------------------------|
//parse incoming request to json
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))
//------------------------------------------------------------------------------------------|

if(process.env.NODE_ENV === "production"){
    app.use(express.static('client/build'))
    const path = require('path')

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
    })
}

app.listen(process.env.PORT || 5000, () => {
    console.log("listening...");
});