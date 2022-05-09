
/**
 * Sovryn node health check
*/
const express= require('express');
const app = express();
const http = require('http').createServer(app);
const Web3 = require('web3');
const serverPort = 3001;


const options = {
  // Enable auto reconnection
  reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: false
  }
};
const web3_provider = new Web3.providers.HttpProvider("http://localhost:4444",options);
const web3S_provider = new Web3.providers.WebsocketProvider("ws://localhost:4445/websocket",options);
const web3Iov_provider = new Web3.providers.HttpProvider('https://public-node.rsk.co',options);

let web3 = new Web3(web3_provider);
let web3S = new Web3(web3S_provider);
let web3Iov = new Web3(web3Iov_provider);

console.log('fin q')

http.listen(serverPort, () => {
    console.log('listening on *:'+serverPort);
   });

app.get('/', async (req, res)=> {

     try{          
        const rpc = await web3.eth.getBlockNumber();
        const ws = await web3S.eth.getBlockNumber();
        const iov = await web3Iov.eth.getBlockNumber();
        const syncResult = new Date(Date.now())+ " processed blocks: rpc "+rpc+", wss: "+ws+" iov: "+iov+ "\n";
        console.log(syncResult);
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
       console.log(err);
       if(err = 'Error: connection not open on send()')
          {
           return res.status(502).send("rsk node not responding: " + err + "\n");
          }
       else{
           return res.status(504).send("rsk node not responding: " + err + "\n");
       }
    }
});

