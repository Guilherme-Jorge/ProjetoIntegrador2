function checkFormAccept(form) {
  if (!form.accept.checked) {
    alert("Por favor aceite os termos de uso");
    form.accept.focus();
    return false;
  }
  return true;
}
