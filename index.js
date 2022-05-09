
/**
 * Sovryn node health check
*/
const express= require('express');
const app = express();
const http = require('http').createServer(app);
const Web3 = require('web3');
const serverPort = 3001;





http.listen(serverPort, () => {
    console.log('listening on *:'+serverPort);
   });

app.get('/', async (req, res)=> {
      const web3_provider = new Web3.providers.HttpProvider("http://localhost:4444",{
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
      });
      const web3S_provider = new Web3.providers.WebsocketProvider("ws://localhost:4445/websocket",{
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
      });
      const web3Iov_provider = new Web3.providers.HttpProvider('https://public-node.rsk.co',{
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
      });
     try{  
        var web3 = new Web3(web3_provider);
        var web3S = new Web3(web3S_provider);
        var web3Iov = new Web3(web3Iov_provider);
        
        console.log('fin q')
        
        const rpc = await web3.eth.getBlockNumber();
        console.log('1')
        const ws = await web3S.eth.getBlockNumber();
        console.log('2')
        const iov = await web3Iov.eth.getBlockNumber();
        console.log('3')
        const syncResult = new Date(Date.now())+ " processed blocks: rpc "+rpc+", wss: "+ws+" iov: "+iov+ "\n";
        console.log(syncResult);
	   if(Math.abs(iov - rpc) <= 3 ) {
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
       await web3.setProvider(web3_provider)
       await web3S.setProvider(web3S_provider)
       await web3Iov.setProvider(web3Iov_provider)
       return res.status(504).send("rsk node not responding: " + err + "\n");
    }
});

