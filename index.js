
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
    const web3_provider = new Web3.providers.HttpProvider("http://localhost:8545",http_options);
    const web3WS_provider = new Web3.providers.WebsocketProvider("ws://localhost:8546",ws_options);
    const web3BSN_0_provider = new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org',http_options);
    const web3BSN_1_provider = new Web3.providers.HttpProvider('https://bsc-dataseed1.defibit.io',http_options);
    const web3BSN_2_provider = new Web3.providers.HttpProvider('https://bsc-dataseed1.ninicoin.io/',http_options);
    try {
         var web3 = new Web3(web3_provider);
         var web3WS = new Web3(web3WS_provider);
         var web3public0 = new Web3(web3BSN_0_provider);
         var web3public1 = new Web3(web3BSN_1_provider);
         var web3public2 = new Web3(web3BSN_2_provider);
         const rpc = await web3.eth.getBlockNumber();
         const ws = await web3WS.eth.getBlockNumber();
	 try {
             var web3_public = await web3public0.eth.getBlockNumber();
	 } catch {
	     try {
                 var web3_public = await web3public1.eth.getBlockNumber();
	     } catch {
		 try {
		     var web3_public = await web3public2.eth.getBlockNumber();
		 } catch {
		     var web3_public = 0;
                 }
	     }
	 }
         const syncResult = new Date(Date.now())+ " processed blocks: rpc "+rpc+", wss: "+ws+" iov: "+web3_public+ "\n";
         await web3.currentProvider.disconnect();
         await web3WS.currentProvider.disconnect();
         await web3public0.currentProvider.disconnect();
         await web3public1.currentProvider.disconnect();
         await web3public2.currentProvider.disconnect();
         if(Math.abs(rpc - ws) <= 3 && Math.abs(web3_public - rpc) <=3 ) {
             return res.status(200).send(syncResult);
         }
         else if(rpc > web3_public) {
             return res.status(200).send(syncResult);
         }
         else {
             return res.status(503).send("not in sync - " + syncResult);
         }
     }
     catch(err){
         await web3.currentProvider.disconnect();
         await web3WS.currentProvider.disconnect();
         await web3public0.currentProvider.disconnect();
         await web3public1.currentProvider.disconnect();
         await web3public2.currentProvider.disconnect();
         return res.status(504).send("rsk node not responding: " + err + "\n");
    }
});
