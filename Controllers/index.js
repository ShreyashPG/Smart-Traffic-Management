/**
 * This file contains the code for  Controllers . . . 
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db_config = require('../configs/server.config'); //importing the configuration of the file . . . 

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
const app = express();

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
  console.log(`Server is running on port ${db_config.PORT}`);
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