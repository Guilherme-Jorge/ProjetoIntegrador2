function fazRelatorio() {
  const cod = document.getElementById("cod").value;

  localStorage.setItem("code-storage", cod);

  event.preventDefault();

  window.location.href = "relatorio_bilhete.html";
}
