function fazUtilizacao() {
  const cod = document.getElementById("cod").value;

  localStorage.setItem("code-storage", cod);

  event.preventDefault();

  window.location.href = "utilizacao_final.html";
}
