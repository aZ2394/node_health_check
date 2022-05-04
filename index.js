
/**
 * Sovryn node health check
*/
const express= require('express');
const app = express();
const http = require('http').createServer(app);
const Web3 = require('web3');
const serverPort = 3001;
let web3;
let web3S;
let web3Iov;


http.listen(serverPort, () => {
    console.log('listening on *:'+serverPort);
   });

app.get('/', async (req, res)=> {

    try{
        web3 = new Web3("http://127.0.0.1:4444");
        web3S = new Web3("ws://127.0.0.1:4445/websocket");
        web3Iov = new Web3('https://public-node.rsk.co');
        const rpc = await web3.eth.getBlockNumber();
        const ws = await web3S.eth.getBlockNumber();
        const iov = await web3Iov.eth.getBlockNumber();
        const account = await web3.eth.accounts.create();  
        const rpcQuery1 = await web3.eth.getBalance((account.address).toString(),'latest');
        const rpcQuery2 = await web3.eth.getCode((account.address).toString(), "latest");
        const syncResult = new Date(Date.now())+ " processed blocks: rpc "+rpc+", wss: "+ws+"  iov: "+iov+" getBalance:"+rpcQuery1+" getCode:"+rpcQuery2+"\n";
        if(Math.abs(rpc - ws) <= 3 && Math.abs(iov - rpc) <=3 ) {
            return res.status(200).send(syncResult);
          } 
        else if(rpc > iov ) {
            return res.status(200).send(syncResult);
          }    
        else {
            return res.status(503).send("not in sync - " + syncResult);
        } 
     }  
    catch(err){
        return res.status(503).send("rsk node not responding: " + err + "\n");
    }
});
