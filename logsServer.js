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
	var remote_ip = req.connection.remoteAddress;
	var remote_appName = configs.ip[remote_ip];
	var logPath = configs.logPath || '/opt';
	var suffix = logPath.substring(logPath.length - 1, logPath.length);
	if(suffix != '/') {
		logPath = logPath + '/';
	}
	logPath = logPath +req.body.logPath;
	var dirName = logPath.substring(0,parseInt(logPath.lastIndexOf('/'))+1)+remote_appName;
	console.log('dirName='+dirName);
	var logName = logPath.substring(parseInt(logPath.lastIndexOf('/'))+1);
	console.log('logName='+logName);
	logPath = dirName+'/'+logName;
	console.log(logPath);
	req.body.logPath = logPath;
	// console.log(res);
	var parse = {
		'parse': req.body,
		'res': res
	};
	pkParse.emit("has-parse", parse);
	res.end('ok');
});

app.listen(configs.port);
console.log(new Date().format('[yyyy-MM-dd hh:MM:ss] ') + 'logsServer [port=' + configs.port + '] has Started');

process.on('uncaughtException', function(e) {
	if(e && e.stack) {
		console.log(e.stack + '###############');
	} else {
		console.log(e + '***********');
	}
});

var deletLog = function() {
		dive(configs.logPath, function(err, res) {
			if(res) {
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
		if(diff <= 0) {
			setTimeout(function() {
				check();
			}, 1000 * 60 * 60);
		} else {
			diff = parseInt(diff) - 1000 * 30; //提前30秒删除
			console.log(new Date().format('[yyyy-MM-dd hh:MM:ss] ') + parseInt(diff / 1000 / 60) + '分钟后删除log文件');
			setTimeout(function() {
				deletLog();
			}, diff);
		}
	}

check();
process.on('exit', function() {
	console.log('Exit AppServer.');
});