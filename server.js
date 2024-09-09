if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}



// Importing all Libraies that we installed using npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
app.use('/assets/', express.static('./assets'));
app.use('/views/', express.static('./views'));
app.use('/css/', express.static('./css'));
app.use('/Controllers/', express.static('./Controllers'));
app.use('/configs/', express.static('./configs'));

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )



const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: "process.env.SESSION_SECRET", // Set this to a secret string
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

// Configuring the register post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users); // Display newly registered in the console
        res.redirect("/login")
        
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})
app.get('/aboutUs',(req,res)=>{
    res.render("aboutUs.ejs")
})
app.get('/contactUs',(req,res)=>{
    res.render("contactUs.ejs")
})
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
//   })

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}


/**
 * This file contains the code for  Controllers . . . 
 */

//const app = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db_config = require('./configs/server.config'); //importing the configuration of the file . . . 

//api for sms . . . 
require('dotenv').config() ; 

const app_sid = 'AC9ea482e184f9b8d894805979dace909c';
const auth_tok = 'f679b1bddbdc5b198115d44724ce18e3' ;  

//creating the client object . .. 
const client = require('twilio')( app_sid, auth_tok) ; 

//function for thee sending the sms to the owner .
const sendSms = async (body , conNum) => {
  const fromNumber = '+16592518970';
  const toNumber = conNum;

  const msgOptions = {
    from: fromNumber,
    to: toNumber,
    body: body,
  };

  try {
    // Use the Twilio client to send the SMS
    const messageProm = await client.messages.create(msgOptions);
    console.log(messageProm);
  } catch (err) {
    console.log("Error sending SMS:", err);
  }
};

//above is api work . . .


//initializing the app from the express . . . 
// const app = express();

app.use(bodyParser.json());
app.use(cors());


// Handle POST request to /submit-data
app.post('/api/data', async (req, res) => {
  try {
      const inputData = req.body.inputData;
      console.log('Received data from the frontend:', inputData);

      const ownerObject = await getDataFromDb(inputData);

      if (typeof ownerObject === "object") {
          sendSms(`Dear ${ownerObject.ownerName},\n\n`
              + `This is a warning regarding your vehicle with plate number ${ownerObject.vehicleNum}.`
              + ` It has been reported that your vehicle is parked in the wrong place.`
              + ` Please move it to the designated parking area to avoid further action.\n\n`
              + `Thank you for your cooperation.\n\n`
              + `Sincerely,\n`
              + `Parking Management Team  `, ownerObject.ownerContactNumber);

          res.json({
              message: {
                  ownerName: ownerObject.ownerName,
                  ownerContactNumber: ownerObject.ownerContactNumber,
              },
          });
      } else {
          res.json({
              message: ownerObject,
          });
      }
  } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



// / // Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js server!');
});


app.listen(db_config.PORT, () => {
  console.log(`Server is running on port `);
});












//function for getting the data from the Db . . .
async function getDataFromDb(vehicleNum){

  const {MongoClient} = require('mongodb');
  
  //url for the mongoDB . . . 
  const url = 'mongodb://localhost:27017';

  const database = 'VehicleDb';
  const client = new MongoClient(url);

    let result = await client.connect();
    let db = result.db(database);

    let collection = db.collection('VehicleInfo');

    let response = await collection.find({}).toArray();

    let flag = false ; 

    //traversing through the data base . . . 
    for(let i = 0 ; i<response.length;i++){
        if(response[i].vehicleNum === vehicleNum){
            flag = true ;
            return response[i] ; 
            
        }
    }

    if(!flag){
        return "Please Enter  the Valid Vehicle Number " ;
    }
}




app.listen(3000)
