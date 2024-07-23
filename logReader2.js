const EventEmmiter = require('events');
const fs = require('fs');
const express = require('express');
const app = express();
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer);
const filePath = './system.log';
let file = "Loading...";
let connections = [];

app.get('', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
})

app.get('/file', (req, res) => {
    res.send({ file });
})

io.on("connection", (socket) => {
    console.log(socket.id);
    connections.push(socket.id);
  });
  

httpServer.listen(8000, ()=> {
    console.log(`app started on port 8000`);
})

class LogReader extends EventEmmiter {
    constructor(initialLength, interval) {
        super();
        this.initialLength = initialLength || 10;
        this.interval = interval || 1000;
    }

    readFile() {
        fs.open(filePath, 'r', (err, fd) => {
            fs.readFile(fd, (err, file) => {
                this.emit('file', file.toString());
            })
        })
    }

    watchFile() {
        fs.watchFile(filePath, (current, previous) => {
            if (current.size > previous.size) {
                let chunkSize = current.size - previous.size;
                let readBuffer = new Buffer.alloc(1024);
                fs.open(filePath, 'r', (err, fd) => {
                    //fs.read(fd, buffer, offset, length, position, callback)
                    fs.read(fd, readBuffer, 0, chunkSize, previous.size, ()=> {
                        this.emit('updates', readBuffer.toString());
                    });
                })
            }
        })
    }
}

const logReader = new LogReader();
logReader.readFile();
logReader.watchFile();
logReader.on('file', (data) => {
    file = data;
})
logReader.on('updates', (data) => {
    file = file + data;
    if(connections.length) {
        io.emit('updates', data);
    }
})