const fs = require('fs');
const filePAth = './system.log'

setInterval(()=> {
    const logNumber = Math.round(Math.random() * 10000);
    fs.appendFile(filePAth, `\n Hello log number ${logNumber}`, (err) => {
        console.log(err);
    });
    console.log(`append completed`);
}, 5000)