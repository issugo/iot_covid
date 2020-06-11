const deviceIdRegEx = /^([a-zA-Z0-9]){8,}$/
window.device = {}

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
      console.log(temp)
      window.device.authToken = temp.authToken
      window.device.clientId = temp.clientId
    }
  }
  xhr.send()
}
