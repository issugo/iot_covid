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
  id: 'myAppMedecin',
  'auth-key': apiKey,
  'auth-token': tokenApi,
  type: 'shared'
}

/**
 * FONCTIONS
 */
function nouveauClient() {
    let newClient = document.getElementById('nomContact').value
    let tRow = document.createElement('tr')
    let nomClient = document.createElement('td')
    nomClient.innerHTML = newClient
    let etatClient = document.createElement('td')
    let div = document.createElement('div')
    div.classList.add('form');
    let form = document.createElement('select')
    form.setAttribute('name', 'etat-'+newClient)
    form.setAttribute('id', 'etat-'+newClient)
    let firstOption = document.createElement('option')
    firstOption.innerHTML = 'sain'
    firstOption.setAttribute('value', 'sain')
    let secondOption = document.createElement('option')
    secondOption.innerHTML = 'suspect'
    secondOption.setAttribute('value', 'suspect')
    let thirdOption = document.createElement('option')
    thirdOption.innerHTML = 'malade'
    thirdOption.setAttribute('value', 'malade')
    form.appendChild(firstOption)
    form.appendChild(secondOption)
    form.appendChild(thirdOption)
    div.appendChild(form)
    etatClient.appendChild(div)
    let publier = document.createElement('td')
    let publierBoutton = document.createElement('button')
    publierBoutton.setAttribute('id', 'publier-'+newClient)
    publierBoutton.innerHTML = 'publier'
    publierBoutton.addEventListener('click', function() {publierEtat(newClient)})
    publier.appendChild(publierBoutton)
    tRow.appendChild(nomClient)
    tRow.appendChild(etatClient)
    tRow.appendChild(publier)
    document.getElementById('contacts').appendChild(tRow)
}

function publierEtat (nom) {
    console.log('nom : ' + nom)
    const myData = { deviceId: nom, etat: document.getElementById('etat-'+nom).value }
    appClient.publishDeviceEvent(deviceType, nom, 'sante', 'json', myData)
}

/**
 * CODE PRINCIPAL
 */

document.getElementById('ajouter').addEventListener('click', nouveauClient)

const appClient = new client.IotfApplication(appClientConfig)
appClient.log.setLevel('debug')
appClient.connect()

appClient.on('connect', function () {
  console.log('Connecté au broker IBM')
})

appClient.on('error', function (err) {
  console.log('Error : ' + err)
})