let _registration

function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

function registerServiceWorker () {
  return navigator.serviceWorker.register('./static/js/service-worker.js')
  .then(registration => {
    _registration = registration
    console.log('Service Worker Registered')
  })
}

function subscribeUserToPush () {
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      'BNrXLUQpibwRaT4QSkOR5wEeZgAa49w13XJ5FEDqnll--WbaYya9uZslQhizuMM5SMwAhXiFUJ5bCJVUtchYNI4'
    )
  }
  return _registration.pushManager.subscribe(subscribeOptions)
  .then(pushSubscription => {
    console.log('Received PushSubscription: ', JSON.stringify(pushSubscription))
    return pushSubscription
  }).then(subscription => {
    return sendSubscriptionToBackEnd(JSON.parse(JSON.stringify(subscription)))
  })
}

function sendSubscriptionToBackEnd (subscription) {
  return new Promise((resolve, reject) => {
    const data = `endpoint=${subscription.endpoint}&expirationTime=${subscription.expirationTime}&keys[p256dh]=${subscription.keys.p256dh}&keys[auth]=${subscription.keys.auth}`
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://4e6d18ec.ngrok.io/api/save-subscription/')
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.onload = e => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else {
          reject(xhr.statusText)
        }
      }
    }
    xhr.onerror = e => {
      reject(xhr.statusText)
    }
    xhr.send(data)
  })
}

navigator.serviceWorker.addEventListener('message', event => {
  console.log(`Got reply from service worker: ${event.data}`)
})
