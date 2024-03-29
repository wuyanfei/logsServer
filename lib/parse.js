var utils = require("util");
var _event = new require("events").EventEmitter;
var dateFormat = require('./dateFormat');
var fs = require('fs');
var _log = require('./streamlogger');
var config = {};
try {
	config = JSON.parse(fs.readFileSync(__dirname + '/../etc/settings.json', 'utf8'));
} catch(ex) {
	console.log(ex.stack);
}
var sms = require('./smsmail').createSmsMail(config);
var dateFormat = require('./dateFormat');
var async = require('async');
process.setMaxListeners(0);

var postError = function(messages) {
		// sms.sendSms(new Date().toString()+messages);
	}

var q = async.queue(function(item, cb) {
	var _length = q.length();
	if(_length % 100 == 0 && _length != 0) {
		console.log('log队列大小：' + _length);
	}
	dealLogs(item.task, cb);
}, 10);
var logInstance = {};
var dealLogs = function(task, callback) {
		var jsonObj = task.parse;
		var logPath = jsonObj.logPath;
		var projectName = jsonObj.projectName;
		var log = logInstance[logPath];
		if(log == undefined) {
			log = _log.logger(logPath);
			logInstance[logPath] = log;
			console.log(new Date().format('[yyyy-MM-dd hh:MM:ss] ') + '[' + logPath + ']初始化log实例成功');
		}
		var msg = jsonObj.msg;
		var smsFlag = jsonObj.smsFlag;
		if(projectName != undefined) {
			msg = '[' + projectName + '] ' + msg;
		}
		var logLevel = jsonObj.logLevel;
		if(logLevel == 1) {
			log.info(msg);
		} else if(logLevel == 2) {
			log.debug(msg);
		} else if(logLevel == 3) {
			log.error(msg);
		}
		callback();
	}
var SendLogs = function() {
		var self = this;
		self.on('has-parse', function(task) {
			q.push({
				'task': task
			}, function() {});
		});
	}
utils.inherits(SendLogs, _event);
exports.createParse = function() {
	return new SendLogs();
}