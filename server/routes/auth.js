const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { JWT_SECRET_KEY, SENDGRID_API_KEY, SENDER, HOME_URL} = require('../config/keys')
const nodemailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport')

//------------------------------------------------Initialization of sendGrid-------------------------------|
const transporter = nodemailer.createTransport(sendGridTransport({
    auth:{
        api_key: SENDGRID_API_KEY
    }
}))


router.post('/signup', (req, res) => {
    const { name, email, password } = req.body

    if(!email || !name || !password){
        return res.status(422).json({error : "Please fill all the fields"})
    }
    //check whether the user already exist or not
    User.findOne({ email : email})
        .then( savedUser => {
            if( savedUser ){
                return res.status(422).json({error : "User is already exists with this email"})
            }

            bcrypt.hash(password, 12)  //12 is just the saltRound
                .then( hashedPassword => {
                    const user = new User({
                        name,
                        email,
                        password:hashedPassword
                    })
            
                    user.save()
                        .then( savedUser =>{

                            //console.log("saved user => ", savedUser)
                            const token = jwt.sign({ _id: savedUser._id}, JWT_SECRET_KEY)
                            const { _id, name, email, followers, following, profile_pic } = savedUser

                            const html1 = "<div style='padding: 70px 0; height:500px;background-color:#0275d8;color:white;height:120px;width:500px;font-family: Arial, Helvetica, sans-serif;margin:50px auto;text-align: center;'>"
                            const html2 = "<h1>Welcome to my website!</br></h1><p>I'm glad you're here</p>"
                            let html3 = html1 + html2 + "</div>"

                            transporter.sendMail({
                                to: email,
                                from: SENDER,
                                subject:"Account created successfully",
                                html:html3
                            })
                            
                            res.json({ 
                                msg:"User saved successfully!",
                                token, 
                                user:{_id, name, email, followers, following, profile_pic}
                            })
                            //res.json({msg:"user saved successfully!"})
                        })
                        .catch( err => {
                            console.log(err);
                        })
                })
        })
        .catch( err => {
            console.log(err);
        })
})

router.post('/signin', (req, res)=> {
    const { email, password } = req.body
    
    if(!email || !password){
        return res.status(422).json({ error : "Please fill all the fields!"})
    }

    User.findOne({ email: email})
        .then( savedUser => {
            if(!savedUser){
                return res.status(422).json({ error : "Invalid email or password"})
            }
            
            bcrypt.compare(password, savedUser.password)
                  .then( match => {
                      if(match){
                          const token = jwt.sign({ _id: savedUser._id}, JWT_SECRET_KEY)
                          const { _id, name, email, followers, following, profile_pic } = savedUser
                          
                          res.json({ token, user:{_id, name, email, followers, following, profile_pic}})
                      }else{
                          return res.status(422).json({ error : "Invalid email or password"})
                      }
                  })
                  .catch( err => {
                      console.log(err)
                  })
        }) 
})

router.post('/reset-password',(req, res)=>{
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            return console.log(err)
        }
        const token = buffer.toString('hex')

        User.findOne({ email: req.body.email })
            .then( user => {
                if(!user){
                    return res.status(422).json({ error: "User does not exist"})
                }

                user.resetPwdToken = token
                user.expirePwdToken = Date.now() + 3600000

                user.save()
                    .then( result => {
                        transporter.sendMail({
                            to: result.email,
                            from: SENDER,
                            subject:"Reset password",
                            html: `
                            <p>We heard that you forgot your password. Sorry about that!</br></br>
                            But don’t worry! You can use the following link to reset your password:</p>
                            <b><a href="${HOME_URL}/reset/${token}">Reset password</a></b>
                            <p>If you don’t use this link within 1 hours, it will expire.</p>
                            `
                        })
                    
                        res.json({msg: "Check your email"})
                    })
            })
    })
})

router.post('/new-password', (req, res) => {
    const newPassword = req.body.newPassword
    const resetPwdToken = req.body.resetPwdToken

    User.findOne({resetPwdToken: resetPwdToken, expirePwdToken:{$gt: Date.now()}})
        .then( user => {
            if(!user){
                return res.status(422).json({error: "Try again session expired"})
            }

            bcrypt.hash(newPassword, 12)
                  .then(hashedPassword => {
                      user.password = hashedPassword
                      user.resetPwdToken = undefined
                      user.expirePwdToken = undefined

                      user.save()
                          .then(result => {
                              res.json({msg:"New password saved successfully"})
                          })
                  })
        })
        .catch( error => {
            console.log(err)
        })
})

module.exports = router