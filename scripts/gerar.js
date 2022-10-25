fetch("http://localhost:3333/api/bilhete")
  .then((data) => data.json())
  .then((res) => {
    document.getElementById("successgerar").innerHTML =
      "Seu bilhete foi gerado com sucesso!";
    document.getElementById("codbilhete").innerHTML = "Código:";
    document.getElementById("cod").innerHTML = res.id;
  })
  .catch(() => {
    document.getElementById("successgerar").innerHTML =
      "Ocorreu um erro na geração!";
    document.getElementById("codbilhete").innerHTML = "Tente novamente!";
  });
