function resultadoRecarga() {
  const mensagem = localStorage.getItem("mensagem-storage");
  const type = localStorage.getItem("type-storage");
  const date = localStorage.getItem("date-storage");
  const preco = localStorage.getItem("preco-storage");

  document.getElementById("estado-recarga").textContent = mensagem;
  document.getElementById("tipo-recarga").textContent = type;
  document.getElementById("data-recarga").textContent = date;
  document.getElementById("preco-recarga").textContent = preco;
}