// http://localhost:3333/api/
/**
 * connectionString: "172.16.12.48:1521/xe"
 * connectionString: "ceatudb02:1521/xe"
 */

const oracledb = require("oracledb");
const express = require("express");
const cors = require("cors");

function generateCodigo() {
  const code = Math.floor(Math.random() * 9999999999);
  return code;
}

function BD() {
  process.env.ORA_SDTZ = "UTC-3"; // garante horário de Brasília

  this.getConexao = async function () {
    if (global.conexao) return global.conexao;

    try {
      global.conexao = await oracledb.getConnection({
        user: "EBD1ES82226",
        password: "Omhsw7",
        connectionString: "ceatudb02:1521/xe",
      });
    } catch (err) {
      console.log("Não foi possível estabelecer conexão com o BD!");
      console.log(err);
      process.exit(1);
    }

    return global.conexao;
  };

  this.estrutureSe = async function () {
    try {
      const conexao = await this.getConexao();
      const sql =
        "CREATE TABLE Bilhete (cod_bilhete integer CONSTRAINT pk_COD_BILHETE PRIMARY KEY, data_hora_geracao_bilhete timestamp)";
      await conexao.execute(sql);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };
}

function Bilhete(bd) {
  this.bd = bd;

  this.insert = async function () {
    const conexao = await this.bd.getConexao();
    
    const temp_codigo = generateCodigo();

    const checkCodigo = await conexao.execute(
      "SELECT * FROM Bilhete WHERE cod_bilhete = :0",
      [temp_codigo]
    );
    console.log(checkCodigo);

    try {
      const sql1 =
        "INSERT INTO Bilhete (cod_bilhete, data_hora_geracao_bilhete) VALUES (:0, SYSTIMESTAMP(0))";
      const dado = [temp_codigo];
      await conexao.execute(sql1, dado);

      const sql2 = "COMMIT";
      await conexao.execute(sql2);

      return temp_codigo;
    } catch (err) {
      this.insert()
    }
  };
}

function middleWareGlobal(req, res, next) {
  console.time("Request"); // marca o início da requisição
  console.log("Method: " + req.method + "; URL: " + req.url); // retorna qual o método e url foi chamada

  next(); // função que chama as próximas ações

  console.log("Finished"); // será chamado após a requisição ser concluída

  console.timeEnd("Request"); // marca o fim da requisição
}

async function ativacaoDoServidor() {
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

  const bd = new BD();
  await bd.estrutureSe();
  global.Bilhete = new Bilhete(bd);

  const app = express();

  app.use(cors()); // elimina problemas com a Google de bloqueio de API

  app.use(express.json()); // faz com que o express consiga processar JSON
  app.use(middleWareGlobal); // app.use cria o middleware global

  app.get("/api/bilhete", async (req, res) => {
    const codigo = await global.Bilhete.insert();

    return res.json({
      id: codigo,
    });
  });

  console.log("Servidor ativo na porta 3333...");
  app.listen(3333);
}

ativacaoDoServidor();
