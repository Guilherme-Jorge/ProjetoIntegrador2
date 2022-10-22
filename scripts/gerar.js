fetch('http://localhost:3333/api/bilhete')
  .then(data => data.json())
  .then(res => {
    document.getElementById('cod').innerHTML = res.id
  })
