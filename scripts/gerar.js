fetch("http://localhost:3333/api/bilhete")
  .then((data) => data.json())
  .then((res) => {
    document.getElementById("cod").innerHTML = res.id;
  });

// async function banana() {
//   const chamada = await fetch("http://localhost:3333/api/bilhete").then(
//     (data) => data.json()
//   );
//   return (document.getElementById("cod").innerHTML = chamada.id);
// }

// banana();
