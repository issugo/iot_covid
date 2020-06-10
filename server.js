/**
 * dépendencies
 */
const dotenv = require('dotenv')
const express = require('express')
const http = require('http')
const https = require('https')
const path = require('path')
const favicon = require('serve-favicon')
const client = require('ibmiotf')
const util = require('util')

/**
 * première config
 */
const app = express()
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))
dotenv.config()
const port = process.env.PORT || 3000
const org = process.env.org
const deviceType = process.env.devicetype
const apiKey = process.env.apiKey
const tokenApi = process.env.tokenApi
let date = new Date();

/**
 * config appli
 */
let appClientConfig = {
  "org": org,
  "id": "myapp",
  "auth-key": apiKey,
  "auth-token": tokenApi,
  "type" : "shared"
};

/**
 * endpoints
 */
app.post('/create/:deviceId', function(req, res) {
    const data = JSON.stringify({
        "deviceId": req.params.deviceId,
        "authToken": makeToken(),
        "deviceInfo": {
            "serialNumber": "string",
            "manufacturer": "string",
            "model": "string",
            "deviceClass": "string",
            "description": "string",
            "fwVersion": "string",
            "hwVersion": "string",
            "descriptiveLocation": "string"
        },
        "location": {
            "longitude": 0,
            "latitude": 0,
            "elevation": 0,
            "accuracy": 0,
            "measuredDateTime": date.getFullYear() + "-" + ('0'+date.getMonth()+1).slice(-2) + "-" + ('0'+date.getDate()).slice(-2) + ":" + ('0'+date.getHours()).slice(-2) + ":" + ('0'+date.getMinutes()).slice(-2) + "." + ('0'+date.getSeconds()).slice(-2)
        },
        "metadata": {}
    })
    
    const options = {
        hostname: org + '.internetofthings.ibmcloud.com',
        port: 443,
        path: '/api/v0002/device/types/' + deviceType + '/devices',
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + new Buffer(apiKey + ':' + tokenApi).toString('base64')
        }
    }
    
    const requete =  https.request(options, (result) => {
        console.log(`statusCode: ${result.statusCode}`)
        result.on('data', (d) => {
            let test = JSON.parse(util.format("%s", d))
            console.log("%s", d)
            //process.stdout.write(d)
            res.json(test);
        })
    })
    
    requete.on('error', (error) => {
        console.error(error)
    })
    
    requete.write(data)
    requete.end()
})

app.get('/set/:deviceId', function(req, res) {
    let deviceId = req.params.deviceId;
    clientConfig.id = deviceId;
    clientConfig["auth-token"] = makeToken();
    console.log(clientConfig);
    res.json(clientConfig);
})

/**
 * fonctions
 */
function makeToken() {
   let result           = '';
   let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@';
   let charactersLength = characters.length;
   for ( let i = 0; i < 20; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

/**
 * lancement serveur
 */

http.createServer(app).listen(port, function(req, res) {
    console.log(`server listening on ${port}`)
    console.log(new Buffer(apiKey + ':' + tokenApi).toString('base64'))
})
