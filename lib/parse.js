var utils = require("util");
var _event = new require("events").EventEmitter;
var fs = require('fs');
var _log = require('./streamlogger');
var config = {};
try{
	config = JSON.parse(fs.readFileSync(__dirname+'/../etc/settings.json', 'utf8'));
}catch(ex){
	console.log(ex.stack);
}
var sms = require('./smsmail').createSmsMail(config);
var dateFormat = require('./dateFormat');
var async = require('async');
process.setMaxListeners(0);

var postError = function(messages){
 // sms.sendSms(new Date().toString()+messages);
}

var q = async.queue(function(item,cb){
  var _length = q.length();
  if(_length > 50){
   cb();
  }else{
   dealLogs(item.task,cb);
  }
},50);
var dealLogs = function(task,callback){
    var jsonObj = task.parse;
		var logPath = jsonObj.logPath;
		var projectName = jsonObj.projectName;
		var log = _log.logger(logPath);
		var msg = jsonObj.msg;
		var smsFlag = jsonObj.smsFlag;
		if(projectName != undefined){
			msg = '['+projectName+'] '+msg;
		}
		var logLevel = jsonObj.logLevel;
		if(logLevel == 1){
			log.info(msg);
		}else if(logLevel == 2){
			log.debug(msg);
		}else if(logLevel == 3){
			log.error(msg);
		}
		callback();
}
var SendLogs = function(){
	var self = this;
	self.on('has-parse',function(task){
		q.push({'task':task},function(){});
	});
}
utils.inherits(SendLogs, _event);
exports.createParse=function(){
	return new SendLogs();	
} 
