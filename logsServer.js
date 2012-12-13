/**
 * 接收数据主程序
 **/
var express = require('express');
var fs = require('fs');
var app = express();
var configs = {};
try{
	configs = JSON.parse(fs.readFileSync(__dirname+'/etc/settings.json', 'utf8'));
}catch(ex){
	console.log(ex.stack);
}

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
fs.writeFileSync(__dirname+'/process.pid',process.pid.toString(),'ascii');
var pkParse = require('./lib/parse').createParse();
app.post('/logsPost', function(req, res) {
	res.header("Content-Type","application/json; charset=utf-8");
	var parse = { 'parse':req.body,'res':res};
	pkParse.emit("has-parse",parse);
	res.end('ok');
});

app.listen(configs.port);
console.log('******logsServer [port='+configs.port+'] has Started****** ');

process.on('uncaughtException', function(e){
	if(e && e.stack){ 
		console.log(e.stack+'###############');
	}else{
		console.log(e+'***********');
	}
});

process.on('exit',function(){
	console.log('Exit AppServer.');
});
