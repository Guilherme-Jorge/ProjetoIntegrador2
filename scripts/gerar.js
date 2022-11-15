fetch("http://localhost:3333/api/bilhete")
  .then((data) => data.json())
  .then((res) => {
    resultado(res);
  })
  .catch((err) => {
    erro(err);
  });

function resultado(dados) {
  document.getElementById("successgerar").innerHTML =
    "Seu bilhete foi gerado com sucesso!";
  document.getElementById("codbilhete").innerHTML = "Código:";
  document.getElementById("cod").innerHTML = dados.id;
}

function erro(err) {
  document.getElementById("successgerar").innerHTML =
    "Ocorreu um erro na geração!";
  document.getElementById("codbilhete").innerHTML = "Tente novamente!";
  console.log(err);
}
