var fs = require('fs');
var configs = {};
try {
	configs = JSON.parse(fs.readFileSync(__dirname + '/../etc/log-set.json', 'utf8'));
} catch(ex) {
	console.log(ex.stack);
}

var Logger = function(logPath) {
		this.logPath = (configs.logType || 'online') + '/' + logPath;
		this.debug = function(msg) {
			var jsonObj = {};
			jsonObj.logPath = this.logPath;
			jsonObj.logLevel = 2;
			jsonObj.msg = msg;
			proc.send({
				'task': jsonObj
			});
		};
		this.info = function(msg) {
			var jsonObj = {};
			jsonObj.logPath = this.logPath;
			jsonObj.logLevel = 1;
			jsonObj.msg = msg;
			proc.send({
				'task': jsonObj
			});
		};
		this.error = function(msg) {
			var jsonObj = {};
			jsonObj.logPath = this.logPath;
			jsonObj.logLevel = 3;
			jsonObj.msg = msg;
			proc.send({
				'task': jsonObj
			});
		};
	}
var proc = null;
exports.log = function(logPath) {
	if(proc == null) {
		var child_process = require('child_process');
		proc = child_process.fork(__dirname+'/web-log-pro.js');
		console.log('启用日志子进程,pid：'+proc.pid);
	}
	return new Logger(logPath);
}