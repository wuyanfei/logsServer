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

var getLogPath = function(req) {
		var remote_ip = req.connection.remoteAddress;
		var ip_obj = configs.ip ||{};
		var remote_appName = ip_obj[remote_ip]||'服务器';
		var logPath = configs.logDir || '/opt/log';
		var suffix = logPath.substring(logPath.length - 1, logPath.length);
		if(suffix != '/') {
			logPath = logPath + '/';
		}
		var remote_logPath = req.body.logPath;
		var prefix = remote_logPath.substring(0,1);
		if(prefix == '/'){
			remote_logPath = remote_logPath.substring(1);
		}
		if(remote_logPath.substring(remote_logPath.length-1) != '/'){
			remote_logPath = '/'+remote_logPath;
		}
		logPath = logPath + remote_appName+remote_logPath;
		var dirName = logPath.substring(0, parseInt(logPath.lastIndexOf('/')));
		var logName = logPath.substring(parseInt(logPath.lastIndexOf('/')) + 1);
		logPath = dirName + '/' + logName;
		return logPath;
	};

app.post('/logsPost', function(req, res) {
	res.header("Content-Type", "application/json; charset=utf-8");
	req.body.logPath = getLogPath(req);
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
			console.log(new Date().format('[yyyy-MM-dd hh:MM:ss] ') + '日志目录下为当天日志信息不需要设定日志清空任务');
			setTimeout(function() {
				check();
			}, 1000 * 60 * 240); //每4小时检查一次
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