/**
 * dépendencies
 */
const express = require('express')
const path = require('path')

/**
 * première config
 */
const app = express()
app.use(express.static(path.join(__dirname, 'public')))

/**
 * lancement serveur
 */
app.listen(3002, function () {
  console.log('Example app listening on port 3002!')
})