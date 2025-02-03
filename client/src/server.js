const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname,'..', 'build')));
app.use(express.static("public"));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname,'..', 'build', 'index.html'));
});

// const server = http.createServer(app);

const port =  4000; // Changed port to 4000

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
