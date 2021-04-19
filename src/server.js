
const Amadeus = require("amadeus");
const express = require("express");
const socket = require("socket.io");
const bodyParser = require("body-parser");
const app = express();



var cors = require('cors');
app.use(cors());
var http = require("http").createServer(app);
var parse = require("socket.io")(http);

// Getting env variables
const { CLIENT_ID, CLIENT_SECRET } = require("./config");

let confirmOrder = "";

app.use(bodyParser.json()); // support json encoded bodies
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.json());

const amadeus = new Amadeus({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

app.get(`/citySearch`, async (req, res) => {
  console.log(req.query);
  var keywords = req.query.keyword;
  const response = await amadeus.referenceData.locations
    .get({
      keyword: keywords,
      subType: "CITY,AIRPORT",
    })
    .catch((x) => console.log(x));
  try {
    await res.json(JSON.parse(response.body));
  } catch (err) {
    await res.json(err);
  }
});


app.get("/date", async function (req, res) {
  

  const response = await amadeus.shopping.flightOffersSearch
    .get({
      originLocationCode: req.query.locationDeparture,
      destinationLocationCode: req.query.locationArrival,
      departureDate: req.query.departure,
      adults: req.query.adult,
    })
    .catch((err) => console.log(err));

  try {
    await res.json(JSON.parse(response.body));
  } catch (err) {
    await res.json(err);
  }
});


app.post("/date", async function (req, res) { 
  console.log(req.body); 
  departure = req.body.departure; 
  arrival = req.body.arrival; 
  locationDeparture = req.body.locationDeparture; 
  locationArrival = req.body.locationArrival; 
  const response = await amadeus.shopping.flightOffersSearch 
    .get({ 
      originLocationCode: locationDeparture, 
      destinationLocationCode: locationArrival, 
      departureDate: departure, 
      adults: "1", 
    }) 
    .catch((err) => console.log(err)); 
  try { 
    await res.json(JSON.parse(response.body)); 
  } catch (err) { 
    await res.json(err); 
  } 
}); 

app.post("/flightprice", async function (req, res) {
  res.json(req.body);
  inputFlight = req.body;
  console.log(req.body);

  const responsePricing = await amadeus.shopping.flightOffers.pricing
    .post(
      JSON.stringify({
        data: {
          type: "flight-offers-pricing",
          flightOffers: inputFlight,
        },
      })
    )
    .catch((err) => console.log(err));

  try {
    await res.json(JSON.parse(responsePricing.body));
  } catch (err) {
    await res.json(err);
  }
});

app.post("/flightCreateOrder", async function (req, res) {
  res.json(req.body);

  let inputFlightCreateOrder = req.body;
  console.log(req.body);
  const returnBokkin = amadeus.booking.flightOrders
    .post(
      JSON.stringify({
        data: {
          type: "flight-order",
          flightOffers: [inputFlightCreateOrder],
          travelers: [
            {
              id: "1",
              dateOfBirth: "1982-01-16",
              name: {
                firstName: "JORGE",
                lastName: "GONZALES",
              },
              gender: "MALE",
              contact: {
                emailAddress: "jorge.gonzales833@telefonica.es",
                phones: [
                  {
                    deviceType: "MOBILE",
                    countryCallingCode: "34",
                    number: "480080076",
                  },
                ],
              },
              documents: [
                {
                  documentType: "PASSPORT",
                  birthPlace: "Madrid",
                  issuanceLocation: "Madrid",
                  issuanceDate: "2015-04-14",
                  number: "00000000",
                  expiryDate: "2025-04-14",
                  issuanceCountry: "ES",
                  validityCountry: "ES",
                  nationality: "ES",
                  holder: true,
                },
              ],
            },
            {
              id: "2",
              dateOfBirth: "2012-10-11",
              gender: "FEMALE",
              contact: {
                emailAddress: "jorge.gonzales833@telefonica.es",
                phones: [
                  {
                    deviceType: "MOBILE",
                    countryCallingCode: "34",
                    number: "480080076",
                  },
                ],
              },
              name: {
                firstName: "ADRIANA",
                lastName: "GONZALES",
              },
            },
          ],
        },
      })
    )
    .then(function (response) {
      console.log(response.result);
      confirmOrder = response.result;
    })
    .catch(function (responseError) {
      console.log(responseError);
    });
});

app.get("/flightcretaeorderget", function (req, res) {
  res.send(JSON.stringify(confirmOrder));
});

var server = app.listen(process.env.PORT || 3000, () => {
  console.log("Howdy, I am running at PORT 3000");
});

let io = socket(server);

io.on("connection", function (socket) {
  console.log("Socket Connection Established with ID :" + socket.id);
});
