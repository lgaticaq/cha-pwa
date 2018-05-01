const el = document.getElementById('price')
ChaPrice().then(price => {
  el.innerText = price
})
