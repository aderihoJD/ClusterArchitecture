import cluster from 'cluster';
import {cpus} from 'os';
import express from 'express';
import {Server} from 'http';
import socketIO from 'socket.io';

const cpuCount = cpus().length;
const io = [];

if (cluster.isMaster){
    for (let i = 0; i < cpuCount; i++){
        const worker = cluster.fork();
    }
}

if (cluster.isWorker){

    const worker_id = cluster.worker.id;
    const app = express();
    const server = Server(app);
    io[worker_id] = socketIO(server);
    server.listen(3000+worker_id);

    io[worker_id].on('connection', (socket) => {
       console.log(socket.id);
       console.log(`Worked id : ${worker_id}`);
       socket.emit('news', {hello: 'world'});
       socket.on('my other event', (data) => {
          console.log(data);
       });
    });

    const expressApp = express();

    expressApp.listen(8000);

    expressApp.use(express.static('public'));

    expressApp.get('/', (req, res) => {
       res.send(`Hello from Worker: ${worker_id}`);
       console.log('------');
    });

    expressApp.get('/get_port', (req, res) => {
       res.send(3000+worker_id);
       console.log('get_port');
    });

}






