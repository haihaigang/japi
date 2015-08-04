var app = require('express'),
    fs = require('fs');
http.createServer(function(req, res) {
    console.log(req.url)
        // fs.writeFile('data/abc.json', '{"data":1}', function(err) {
        //     if (err) throw err;
        //     console.log('saved');
        // })
    var path = 'data/abc.json';
    res.writeHead(200, {
        'Content-Type': 'application/json;charset="utf-8"'
    });
    switch (req.url) {
        case 'collection/save':
            {

            }
            case 'collections/':{

            }
        default:{
        	res.end();
        }
    }
    fs.readFile(path, {
        flag: 'wx+'
    }, function(err, data) {
        if (err) {
            res.write('{"code":"' + err.code + '"}');
        } else {
            res.write(data);
        }
        res.end();
    });
    // res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
