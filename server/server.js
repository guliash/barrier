var http = require('http'),
    httpProxy = require('http-proxy');

httpProxy.createServer({
  target:'http://localhost:9003'
}).listen(8000);

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(9003);
console.log('running');
