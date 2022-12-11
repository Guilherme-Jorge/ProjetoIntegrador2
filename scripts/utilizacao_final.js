const cod = localStorage.getItem("code-storage");

let url = `http://localhost:3333/api/bilhete/${cod}`;

axios
  .post(url)
  .then((res) => {
    resultado(res, cod);
    timer(res);
  })
  .catch((err) => {
    erro(err);
  });

function timer(res) {
  const countDownDate = new Date(res.data.Tempo).getTime();

  const x = setInterval(function () {
    const now = new Date().getTime();

    const distance = countDownDate - now;

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (hours > 0) {
      document.getElementById("tempo").innerHTML =
        hours + ":" + minutes + ":" + seconds;
    } else {
      if (minutes > 0) {
        document.getElementById("tempo").innerHTML = minutes + ":" + seconds;
      } else {
        document.getElementById("tempo").innerHTML = "00:" + seconds;
      }
    }
  }, 1000);
}

function resultado(res, code) {
  document.getElementById("successgerar").innerHTML =
    "Utilização feita com sucesso";
  document.getElementById("codbilhete").innerHTML = "Código:";
  document.getElementById("cod").innerHTML = code;
  document.getElementById("escrito_tempo1").innerHTML = "Você tem";
  timer(res);
  document.getElementById("escrito_tempo2").innerHTML =
    "restante nessa recarga";
}

function erro(err) {
  document.getElementById("successgerar").innerHTML =
    "Ocorreu um erro na utilização!";
  document.getElementById("codbilhete").innerHTML = "Tente novamente!";
  console.log(err);
}
