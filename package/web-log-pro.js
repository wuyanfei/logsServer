var request = require('request');
var async = require('async');
var fs = require('fs');
var configs = {};
try {
	configs = JSON.parse(fs.readFileSync(__dirname + '/../etc/log-set.json', 'utf8'));
} catch(ex) {
	console.log(ex.stack);
}
var URL = configs.logIp || '219.142.31.134:10060';
URL = 'http://' + URL + '/logsPost';

process.on('message', function(obj) {
	putLog(obj.task);
});

var post = function(url, sdata, cb) {
		var option = {
			url: url,
			json: sdata,
			timeout: 10000,
			pool: {
				maxSockets: 2000
			}
		};
		request.post(option, function(e, r, body) {
			cb();
		});
	}
var workerQueue = function() {
		var self = this;
		self.q = async.queue(function(item, cb) {
			if(self.q.length() % 200 == 0) {
				console.log('日志队列大小：' + self.q.length());
			}
			post(URL, item.task, cb);
		}, 10);

		self.push = function(task) {
			self.q.push({
				'task': task
			}, function() {});
		}
	}
var WorkerQueue = null;
var putLog = function(task) {
		if(WorkerQueue == null) {
			WorkerQueue = new workerQueue();
		}
		WorkerQueue.push(task);
	}