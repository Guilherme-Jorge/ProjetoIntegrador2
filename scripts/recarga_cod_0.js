function fazRecarga() {
  const cod = document.getElementById("cod").value;

  let url = `http://localhost:3333/api/bilhete/0/${cod}`;

  event.preventDefault();

  axios
    .post(url)
    .then((res) => {
      sucessoRecarga();
    })
    .catch((err) => {
      falhaRecarga();
    });
}

function sucessoRecarga() {
  const data = new Date().toLocaleDateString("pt-BR").toString();

  localStorage.setItem(
    "mensagem-storage",
    "Sua Recarga foi efetuada com sucesso!"
  );
  localStorage.setItem("type-storage", "Único");
  localStorage.setItem("date-storage", data);
  localStorage.setItem("preco-storage", "R$8,00");

  window.location.href = "recarga.html";
}

function falhaRecarga() {
  localStorage.setItem(
    "mensagem-storage",
    "Ocorreu um erro na Recarga, tente novamente!"
  );
  localStorage.setItem("type-storage", "");
  localStorage.setItem("date-storage", "");
  localStorage.setItem("preco-storage", "");

  window.location.href = "recarga.html";
}
