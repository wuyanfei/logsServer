/**
 * 接收数据主程序
 **/
var express = require('express');
var fs = require('fs');
var dive = require('dive');
var dateFormat = require('./lib/dateFormat');
var app = express();
var configs = {};
try {
	configs = JSON.parse(fs.readFileSync(__dirname + '/etc/settings.json', 'utf8'));
} catch(ex) {
	console.log(ex.stack);
}

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
fs.writeFileSync(__dirname + '/process.pid', process.pid.toString(), 'ascii');
var pkParse = require('./lib/parse').createParse();
app.post('/logsPost', function(req, res) {
	res.header("Content-Type", "application/json; charset=utf-8");
	var parse = {
		'parse': req.body,
		'res': res
	};
	pkParse.emit("has-parse", parse);
	res.end('ok');
});

app.listen(configs.port);
console.log('******logsServer [port=' + configs.port + '] has Started****** ');

process.on('uncaughtException', function(e) {
	if(e && e.stack) {
		console.log(e.stack + '###############');
	} else {
		console.log(e + '***********');
	}
});

var deletLog = function(){
	dive(configs.logPath,function(err,res){
		if(res){
			fs.unlinkSync(res);
		}
	})
}
var check = function() {
		var open_time = new Date();
		open_time.setHours('9');
		open_time.setMinutes('0');
		open_time.setSeconds('0');
		var now_time = new Date();
		var diff = open_time.getTime() - now_time.getTime();
		if(diff<=0){
			setTimeout(function(){
				check();
			},1000*60*60);
		}else{
			diff = parseInt(diff) - 1000*30;//提前30秒删除
			setTimeout(function(){
				deletLog();
			},diff);
		}
	}

check();
process.on('exit', function() {
	console.log('Exit AppServer.');
});