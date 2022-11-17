// http://localhost:3333/api/
/**
 * connectionString: "172.16.12.48:1521/xe"
 * connectionString: "ceatudb02:1521/xe"
 *
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

  this.estrutureBilheteSe = async function () {
    try {
      const conexao = await this.getConexao();
      const sql1 =
        "CREATE TABLE Bilhete (cod_bilhete integer CONSTRAINT pk_COD_BILHETE PRIMARY KEY, data_hora_geracao_bilhete timestamp)";
      await conexao.execute(sql1);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureRecargaSe = async function () {
    try {
      const conexao = await this.getConexao();
      const sql2 =
        "CREATE TABLE Recarga (cod_recarga integer CONSTRAINT pk_COD_BILHETE PRIMARY KEY, data_hora_recarga timestamp, tipo_recarga varchar2(10), fk_BILHETE_cod integer, FOREIGN KEY (fk_BILHETE_cod) REFERENCES Bilhete (cod_bilhete))";
      await conexao.execute(sql2);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSequenceSe = async function () {
    try {
      const conexao = await this.getConexao();
      const sql3 =
        "CREATE SEQUENCE SEQUENCE_COD_RECARGA MINVALUE 1 MAXVALUE 9999999999 INCREMENT BY 1";
      await conexao.execute(sql3);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureTriggerSe = async function () {
    try {
      const conexao = await this.getConexao();
      const sql4 =
        "CREATE TRIGGER TRIGGER_COD_RECARGA BEFORE INSERT ON RECARGA FOR EACH ROW BEGIN SELECT 'SEQUENCE_COD_RECARGA'.NEXTVAL INTO:NEW.COD_RECARGA FROM DUAL; END TRIGGER_COD_RECARGA";
      await conexao.execute(sql4);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };
}

function Bilhete(bd) {
  this.bd = bd;

  this.insert = async function () {
    const conexao = await this.bd.getConexao();

    let temp_codigo = generateCodigo();

    try {
      const sql1 =
        "INSERT INTO Bilhete (cod_bilhete, data_hora_geracao_bilhete) VALUES (:0, SYSTIMESTAMP(0))";
      const dado = [temp_codigo];
      await conexao.execute(sql1, dado);

      const sql2 = "COMMIT";
      await conexao.execute(sql2);

      return temp_codigo;
    } catch (err) {
      console.log(err);

      return temp_codigo = this.insert();
    }
  };

  this.recharge = async function (req, res) {
    const conexao = await this.bd.getConexao();
    const code = parseInt(req.params.id);
    let type = req.params.recharge;

    if (type == "0") {
      type = "Único";
    }

    if (type == "1") {
      type = "Duplo";
    }

    if (type == "2") {
      type = "7 Dias";
    }

    if (type == "3") {
      type = "30 Dias";
    }

    const checkCodigo = await conexao.execute(
      "SELECT * FROM Bilhete WHERE cod_bilhete = :0",
      [code]
    );
    console.log(checkCodigo);

    if (checkCodigo.rows != []) {
      try {
        const sql1 =
          "INSERT INTO Recarga (cod_recarga, data_hora_recarga, tipo_recarga, fk_BILHETE_cod) VALUES (0, SYSTIMESTAMP(0), :0, :1)";
        const instruction = [type, code];
        await conexao.execute(sql1, instruction);

        const sql2 = "COMMIT";
        await conexao.execute(sql2);

        return res.status(200).json();
      } catch (err) {
        console.log(err);

        return res.status(404).json();
      }
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
  await bd.estrutureBilheteSe();
  await bd.estrutureRecargaSe();
  await bd.estrutureSequenceSe();
  await bd.estrutureTriggerSe();
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

  app.post(
    "/api/bilhete/:recharge/:id",
    // { recharge: type, id: code },
    async (req, res) => {
      await global.Bilhete.recharge(req, res);
    }
  );

  console.log("Servidor ativo na porta 3333...");
  app.listen(3333);
}

ativacaoDoServidor();
