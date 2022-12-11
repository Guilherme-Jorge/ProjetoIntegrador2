const cod = localStorage.getItem("code-storage");

let url = `http://localhost:3333/api/bilhete/${cod}`;

axios
  .get(url)
  .then((res) => {
    resultado(res);
  })
  .catch((err) => {});

function resultado(res) {
  const { data } = res;

  document.getElementById("codigo").innerHTML = "Código:";
  document.getElementById("codigo_cod").innerHTML = res.data[0].COD_BILHETE;
  document.getElementById("data").innerHTML = "Data da geração de bilhete:";
  document.getElementById("data_cod").innerHTML = res.data[0].DATA_HORA_GERACAO_BILHETE;

  const table = document.getElementById("table");

  let tableRows = "";

  for (let row of data) {
    tableRows += `
    <tr>
      <td>${row.TIPO_RECARGA}</td>
      <td>${row.DATA_HORA_RECARGA}</td>
      <td>${row.DATA_HORA_UTILIZACAO}</td>
    </tr>
    `;
  }

  table.innerHTML = tableRows;
}
function erro(err) {}
