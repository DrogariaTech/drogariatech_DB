//192.168.0.26:2000/medicamentos
require("dotenv").config();

const {
    USER_DB,
    HOST_DB,
    DATABASE_DB,
    PASSWORD_DB,
    PORT_DB
} = process.env;

const { Client }   = require('pg');
const {v4: uuidv4} = require("uuid");
const axios        = require("axios");
const mysql        = require("mysql2");
const express      = require("express");

const app = express();

app.use(express.json());

//---------------------------------------------------------------------

const jfuncs = {
    getClientDb : () => {
        return new Client({
            user:     USER_DB,
            host:     HOST_DB,
            database: DATABASE_DB,
            password: PASSWORD_DB,
            port:     PORT_DB
          })
    },
    //------------------------------------------------------------------
    //                  TESTE DE FUNCIONALIDADES(NAO FUNCIONA :( !)
    // checkItemInDb : async (tabela, item) => {//depende do jfuncs.getClientDb() ! 
    //     const { 
    //         rows 
    //     } = await client.query(`SELECT * FROM ${tabela} WHERE ${item} = ${mysql.escape(req.body.item)}`)
    //     //

    //     return rows>0 ? True : False 
    // },
    // //------------------------------------------------------------------
    // consultDb : async (tabela) => { //depende do jfuncs.getClientDb() !
    //     const {
    //         rows
    //     } = await client.query(`SELECT * FROM ${tabela}`)
    //     //

    //     return rows
    // }
}

//---------------------------------------------------------------------

app.get("/medicamentos", async (req,res)=>{
    let client = jfuncs.getClientDb()
    client.connect()
    //

    const { rows } = await client.query("SELECT * FROM table_med")
    //

    res.send(rows)
    await client.end()  
    //

})

app.post("/medicamentos", async (req,res)=>{
    let client = jfuncs.getClientDb()
    client.connect()
    //

    const {
        nome,
        nivel,
        empresa,
        estoque
    } = req.body
    //

    const {
        rows
    } = await client.query(`SELECT * FROM table_med WHERE nome = ${mysql.escape(req.body.nome)}`)
    //

    const sql = "INSERT INTO table_med (nome,id,nivel,empresa,estoque) VALUES ($1,$2,$3,$4,$5)"
    //

    if(rows.length > 0){
        res.status(409).send({msg:"O nome desse medicamento est?? em uso!"})
    }else{
        const result = await client.query(sql, [nome,uuidv4(),nivel,empresa,estoque])
        res.status(201).send({Sistema:"Medicamento registrado com sucesso!"})
        console.log(result)
    }
    //


    try{
        axios.post("http://beventos-service:10000/eventos",`MED event: ${req.body}`)
    }catch(err){
        console.log("Nao foi possivel enviar evento na porta 10000: ERROR=",err)
        res.status(400).send({msg:"ERROR: System stopped due to bad connection. Refresh"})
    }
    //


    await client.end()
    res.end()
    //
})

app.post("/eventos", (req,res)=>{
    console.log(req.body)
    //

    res.status(201).send({  msg : "WORKING"  })
    //

})

//---------------------------------------------------------------------

app.listen(2000, async (req,res)=>{ 
    try{
        console.log("Medicamentos PORTA 2000")
        console.log("Chamando beventos-service!")
        //

        const resp = await axios.get("http://beventos-service:10000/eventos")
        //

    } 
    catch(err){
        console.log("Medicamentos ---ERRO---")
    }
    //

}) 