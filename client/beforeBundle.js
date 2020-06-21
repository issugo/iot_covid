/**
 * DEPENDANCES
 */
const client = require('ibmiotf')
const buffer = require('buffer/').Buffer
const config = JSON.parse(data)

/**
 * CONFIG VARIABLES GLOBALES
 */
const org = config.org
const deviceType = config.deviceType
const apiKey = config.apiKey
const tokenApi = config.tokenApi
const deviceIdRegEx = /^([a-zA-Z0-9]){8,}$/
window.device = {}
const date = new Date()

/**
 * CONFIG APPLI
 */
const appClientConfig = {
  org: org,
  id: 'myapp',
  'auth-key': apiKey,
  'auth-token': tokenApi,
  type: 'shared'
}

const appClient = new client.IotfApplication(appClientConfig)
appClient.log.setLevel('debug')
appClient.connect()

/**
 * FONCTIONS
 */

function makeToken () {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@'
  const charactersLength = characters.length
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function getDeviceId () {
  window.device.id = prompt('Enter a unique ID of at least 8 characters containing only letters and numbers (Warning : it will be displayed on the dashboard!):')
  if (deviceIdRegEx.test(window.device.id) === true) {
    console.log('Connecting with device id: ' + window.device.id)
    createDevice()
  } else {
    window.alert('Device ID must be atleast 8 characters in length, and contain only letters and numbers.')
    getDeviceId()
  }
}

function createDevice () {
  const xhr = new XMLHttpRequest()
  const url = document.location.href + 'create/' + window.device.id
  console.log('url : ' + url)
  xhr.open('POST', url, true)

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const temp = JSON.parse(xhr.responseText)
      window.device.authToken = temp.authToken
      window.device.clientId = temp.clientId
    }
  }
  xhr.send()
  subscribe()
}

function publierEtat () {
  const myData = { deviceId: window.device.id, etat: document.getElementById('etat').value }
  appClient.publishDeviceEvent(deviceType, window.device.id, 'sante', 'json', myData)
}

function subscribeTo () {
    const nomContact = document.getElementById('nomContact').value
    try {
        appClient.subscribeToDeviceEvents(deviceType, nomContact, 'sante')
        let cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('contact'))
            .split('=')[1]
        cookieValue += ',' + nomContact
        document.cookie = 'contact=' + cookieValue
    } catch(error) {
        console.warn(error);
        document.cookie = "contact=" + nomContact;
    }
  
}

function subscribe () {
  try {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('contact'))
        .split('=')[1]
      const tabContact = cookieValue.split(',')
      for (let i = 0; i < tabContact.length; i++) {
         appClient.subscribeToDeviceEvents(deviceType, tabContact[i], 'sante')
      }
  } catch(error) {
      console.warn(error);
  }
  
}

/**
 * CODE PRINCIPAL
 */
appClient.on('connect', function () {
  console.log('Connecté au broker IBM')
  appClient.subscribeToDeviceEvents(deviceType, window.device.id, 'sante')
})

appClient.on('deviceEvent', function (deviceType, deviceId, eventType, format, payload) {
    console.log('Device Event from : ' + deviceType + ' : ' + deviceId + ' of event ' + eventType + ' with payload : ' + payload)
    const data = JSON.parse(payload)
    const tRow = document.createElement('tr')
    const nomContact = document.createElement('td')
    const etatContact = document.createElement('td')
    const dateContact = document.createElement('td')
    nomContact.innerHTML = data.deviceId
    etatContact.innerHTML = data.etat
    dateContact.innerHTML = date.getFullYear() + '-' + parseInt(date.getMonth()+1).toString() + '-' + date.getDate()
    tRow.appendChild(nomContact)
    tRow.appendChild(etatContact)
    tRow.appendChild(dateContact)
    document.getElementById('contacts').appendChild(tRow)
    if(data.deviceId != window.device.id) {
        if(data.etat == "malade") {
            const myData = { deviceId: window.device.id, etat: "suspect" }
            appClient.publishDeviceEvent(deviceType, window.device.id, 'sante', 'json', myData);
        }
    } else {
        console.log(data.etat)
        console.log(document.getElementById('etatSubscribed'))
        document.getElementById('etatSubscribed').innerHTML = data.etat;
    }
})

appClient.on('error', function (err) {
  console.log('Error : ' + err)
})

window.onload = getDeviceId()
document.getElementById('test').addEventListener('click', publierEtat)
document.getElementById('subscribe').addEventListener('click', subscribeTo)
