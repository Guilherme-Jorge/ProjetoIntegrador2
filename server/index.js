/**
 * http://localhost:3333/api/
 *
 * connectionString: "172.16.12.48:1521/xe"
 * connectionString: "ceatudb02:1521/xe"
 */

const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
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
        connectionString: "172.16.12.48:1521/xe",
      });
    } catch (err) {
      console.log("Não foi possível estabelecer conexão com o BD!");
      console.log(err);
      process.exit(1);
    }

    return global.conexao;
  };

  this.estrutureSeBilhete = async function () {
    try {
      const conexao = await this.getConexao();
      const sql1 =
        "CREATE TABLE Bilhete (cod_bilhete integer CONSTRAINT pk_COD_BILHETE PRIMARY KEY, data_hora_geracao_bilhete timestamp)";
      await conexao.execute(sql1);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSeRecarga = async function () {
    try {
      const conexao = await this.getConexao();
      const sql2 =
        "CREATE TABLE Recarga (cod_recarga integer CONSTRAINT pk_COD_RECARGA PRIMARY KEY, data_hora_recarga timestamp, tipo_recarga varchar2(10), check_recarga number(1), qtd_recarga number(1), fk_BILHETE_cod integer, FOREIGN KEY (fk_BILHETE_cod) REFERENCES Bilhete (cod_bilhete))";
      await conexao.execute(sql2);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSeSequenceRecarga = async function () {
    try {
      const conexao = await this.getConexao();
      const sql3 =
        "CREATE SEQUENCE SEQUENCE_COD_RECARGA MINVALUE 1 MAXVALUE 9999999999 INCREMENT BY 1";
      await conexao.execute(sql3);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSeTriggerRecarga = async function () {
    try {
      const conexao = await this.getConexao();
      const sql4 =
        "CREATE TRIGGER TRIGGER_COD_RECARGA BEFORE INSERT ON RECARGA FOR EACH ROW BEGIN SELECT 'SEQUENCE_COD_RECARGA'.NEXTVAL INTO:NEW.COD_RECARGA FROM DUAL; END TRIGGER_COD_RECARGA";
      await conexao.execute(sql4);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSeUtilizacao = async function () {
    try {
      const conexao = await this.getConexao();
      const sql5 =
        "CREATE TABLE Utilizacao (cod_utilizacao integer CONSTRAINT pk_COD_UTILIZACAO PRIMARY KEY, data_hora_utilizacao timestamp, fk_RECARGA_cod integer, FOREIGN KEY (fk_RECARGA_cod) REFERENCES Recarga (cod_recarga))";
      await conexao.execute(sql5);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSeSequenceUtilizacao = async function () {
    try {
      const conexao = await this.getConexao();
      const sql6 =
        "CREATE SEQUENCE SEQUENCE_COD_UTILIZACAO MINVALUE 1 MAXVALUE 9999999999 INCREMENT BY 1";
      await conexao.execute(sql6);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSeTriggerUtilizacao = async function () {
    try {
      const conexao = await this.getConexao();
      const sql7 =
        "CREATE TRIGGER TRIGGER_COD_UTILIZACAO BEFORE INSERT ON UTILIZACAO FOR EACH ROW BEGIN SELECT 'SEQUENCE_COD_UTILIZACAO'.NEXTVAL INTO:NEW.COD_UTILIZACAO FROM DUAL; END TRIGGER_COD_UTILIZACAO";
      await conexao.execute(sql7);
    } catch (err) {} // se a já existe, ignora e toca em frente
  };

  this.estrutureSe = async function () {
    await this.estrutureSeBilhete();
    await this.estrutureSeRecarga();
    await this.estrutureSeSequenceRecarga();
    await this.estrutureSeTriggerRecarga();
    await this.estrutureSeUtilizacao();
    await this.estrutureSeSequenceUtilizacao();
    await this.estrutureSeTriggerUtilizacao();
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

      return (temp_codigo = this.insert());
    }
  };

  this.recharge = async function (req, res) {
    const conexao = await this.bd.getConexao();
    const code = parseInt(req.params.id);
    let type = req.params.recharge;
    let qtd = 1;

    if (type == "0") {
      type = "Único";
    }

    if (type == "1") {
      type = "Duplo";
      qtd = 2;
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
    console.log(checkCodigo.rows);

    if (checkCodigo.rows.length != 0) {
      try {
        const sql1 =
          "INSERT INTO Recarga (data_hora_recarga, tipo_recarga, check_recarga, qtd_recarga, fk_BILHETE_cod) VALUES (SYSTIMESTAMP(0), :0, 0, :1, :2)";
        const instruction = [type, qtd, code];
        await conexao.execute(sql1, instruction);

        const sql2 = "COMMIT";
        await conexao.execute(sql2);

        return res.status(200).json();
      } catch (err) {
        console.log(err);

        return res.status(403).json();
      }
    }

    return res.status(403).json();
  };

  this.utilize = async function (req, res) {
    const conexao = await this.bd.getConexao();
    const code = parseInt(req.params.id);
    let cont = 0;

    let checkCodigo = await conexao.execute(
      "SELECT * FROM Bilhete WHERE cod_bilhete = :0",
      [code]
    );
    console.log(checkCodigo.rows);

    if (checkCodigo.rows.length != 0) {
      checkCodigo = await conexao.execute(
        "SELECT * FROM Recarga WHERE fk_BILHETE_cod = :0",
        [code]
      );
      console.log(checkCodigo.rows);
      console.log(checkCodigo.rows[cont].CHECK_RECARGA);

      if (checkCodigo.rows[cont].CHECK_RECARGA == 0) {
        try {
          const sql1 =
            "INSERT INTO Utilizacao (data_hora_utilizacao, fk_RECARGA_cod) VALUES (SYSTIMESTAMP(0), :0)";
          const instruction = [checkCodigo.rows[cont].COD_RECARGA];
          await conexao.execute(sql1, instruction);

          const sql2 = "COMMIT";
          await conexao.execute(sql2);

          const sql3 =
            "UPDATE Recarga SET check_recarga = 1 WHERE cod_recarga = :0";
          await conexao.execute(sql3, instruction);

          const sql4 = "COMMIT";
          await conexao.execute(sql4);

          const sql5 =
            'SELECT EXTRACT(DAY FROM "difference") *86400 + EXTRACT(HOUR FROM "difference") *3600 + EXTRACT(MINUTE FROM "difference") *60 + EXTRACT(SECOND FROM "difference") as "Tempo" FROM (SELECT SYSTIMESTAMP(0) - UTILIZACAO.DATA_HORA_UTILIZACAO  AS "difference" FROM Utilizacao WHERE fk_RECARGA_cod IN (:0) ORDER BY data_hora_utilizacao DESC)';
          const select = await conexao.execute(sql5, instruction);

          console.log(select);

          return res.status(200).json(select.rows[0]);
        } catch (err) {
          console.log(err);

          return res.status(403).json();
        }
      }

      // if (checkCodigo.rows[cont].check_recarga == 1) {
      //   if (checkCodigo[0].qtd_recarga != 0) {
      //   }
      // }
    }
  };

  this.report = async function (req, res) {
    const conexao = await this.bd.getConexao();
    const code = parseInt(req.params.id);

    const checkCodigo = await conexao.execute(
      "SELECT * FROM Bilhete WHERE cod_bilhete = :0",
      [code]
    );
    console.log(checkCodigo);
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
  const bd = new BD();
  await bd.estrutureSe();
  global.Bilhete = new Bilhete(bd);

  const app = express();
  app.use(cors()); // elimina problemas com a Google de bloqueio de API

  app.use(express.json()); // faz com que o express consiga processar JSON
  app.use(middleWareGlobal); // app.use cria o middleware global

  app.get("/api/bilhete", async (req, res) => {
    const codigo = await global.Bilhete.insert();

    return res.status(200).json({
      id: codigo,
    });
  });

  app.post("/api/bilhete/:recharge/:id", async (req, res) => {
    await global.Bilhete.recharge(req, res);
  });

  app.post("/api/bilhete/:id", async (req, res) => {
    await global.Bilhete.utilize(req, res);
  });

  app.get("/api/bilhete/:id", async (req, res) => {
    await global.Bilhete.report(req, res);
  });

  console.log("Servidor ativo na porta 3333...");
  app.listen(3333);
}

ativacaoDoServidor();
