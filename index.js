
/**
 * Sovryn node health check
*/
const express= require('express');
const app = express();
const http = require('http')
const Web3 = require('web3');
const serverPort = 3001;
const server = http.createServer(app);


const http_options = {
  keepAlive: true,
  timeout: 20000, // milliseconds,
  headers: [{name: 'Access-Control-Allow-Origin', value: '*'}],
  withCredentials: false,
  agent: {http: http.Agent('health-check'), baseUrl: 'http://localhost'},
  // Enable auto reconnection
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: false
  }
};
  

const ws_options = {
  timeout: 30000, // ms
  clientConfig: {
    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60000 // ms
  },

  // Enable auto reconnection
  reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: false
  }
};



server.listen(serverPort, () => {
    console.log('listening on *:'+serverPort);
   });

app.get('/', async (req, res)=> {
      const web3_provider = new Web3.providers.HttpProvider("http://localhost:4444",http_options);
      const web3S_provider = new Web3.providers.WebsocketProvider("ws://localhost:4445/websocket",ws_options);
      const web3Iov_provider = new Web3.providers.HttpProvider('https://public-node.rsk.co',http_options);
     try{          
        var web3 = new Web3(web3_provider);
        var web3S = new Web3(web3S_provider);
        var web3Iov = new Web3(web3Iov_provider);
        const rpc = await web3.eth.getBlockNumber();
        const ws = await web3S.eth.getBlockNumber();
        const iov = await web3Iov.eth.getBlockNumber();
        const syncResult = new Date(Date.now())+ " processed blocks: rpc "+rpc+", wss: "+ws+" iov: "+iov+ "\n";
        console.log(syncResult);
        await web3.currentProvider.disconnect();
        await web3S.currentProvider.disconnect();
        await web3Iov.currentProvider.disconnect();
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
          await web3.currentProvider.disconnect();
          await web3S.currentProvider.disconnect();
          await web3Iov.currentProvider.disconnect();
         return res.status(504).send("rsk node not responding: " + err + "\n");
       
    }
});

