const elNotifications = document.getElementById('notifications')
function askPermission () {
  return new Promise((resolve, reject) => {
    const permissionResult = Notification.requestPermission(result => {
      return resolve(result)
    })
    if (permissionResult) {
      permissionResult.then(resolve, reject)
    }
  })
  .then(permissionResult => {
    if (permissionResult !== 'granted') {
      throw new Error('We weren\'t granted permission.')
    }
    elNotifications.style.display = 'none'
  })
}
if (Notification.permission === 'granted') {
  elNotifications.style.display = 'none'
} else {
  elNotifications.style.display = 'block'
}
