var mkdir = require('./mkdir');
var dateFormat = require('./dateFormat');
var sys = require('util'),
  fs = require('fs'),
  events = require('events'),
  clone = function(obj) {
    if(obj == null || typeof(obj) != 'object') return obj;
    var temp = obj.constructor(); // changed
    for(var key in obj)
    temp[key] = clone(obj[key]);
    return temp;
  };

var StreamLogger = exports.StreamLogger = function() {
    this.filePaths = [];
    for(var i = arguments.length; i != 0; i--)
    this.filePaths.push(arguments[i - 1]);
    this.fstreams = [];
    this.emitter = new events.EventEmitter();
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.level = this.levels.info;
    this.open();
  };

StreamLogger.prototype.__defineGetter__("levels", function() {
  return clone(this.levelList);
});
StreamLogger.prototype.__defineSetter__("levels", function(newLevels) {
  this.levelList = this.levelList || {};

  // Make sure the level name doesn't conflict with an existing function name
  for(var newLevel in newLevels) {
    if(this[newLevel] && (this.levelList[newLevel] == undefined)) {
      this.emitter.emit("error", "Invalid log level '" + newLevel + "', conflicting name");
      delete(newLevels[newLevel]);
    }
  }

  this.levelList = newLevels;

  // Build a reverse mapping of level values to keys, for fast lookup later
  this.revLevels = {};
  for(var lName in this.levelList) {
    var lVal = this.levels[lName];
    this.revLevels[lVal] = lName;
  }

  // Remove old levels
  for(var oldLevel in this.levelList)
  delete(this[oldLevel]);

  // Setup a method for each log level
  for(var logLevel in this.levelList) {
    this[logLevel] = (function(logLevel) {
      return function(message, callback) {
        this.logAtLevel(message, this.levelList[logLevel], callback);
      };
    })(logLevel);
  }
});

// Create write streams for all the files, emit 'open', if/when
// all streams open. Will fire callback after as well
StreamLogger.prototype.open = function(callback) {
  //console.log(this.filePaths);
  var emitter = this.emitter;
  for(var i = this.filePaths.length; i != 0; i--) {
    var filePath = this.filePaths[i - 1];
    var unopenedFilePathCount = this.filePaths.length;
    //console.log(filePath);
    var dir = filePath.substring(0, filePath.lastIndexOf('/'));
    //console.log(dir);
    mkdir.mkdirsSync(dir);
    var stream = fs.createWriteStream(filePath, {
      flags: 'a',
      mode: 0644,
      encoding: 'utf8'
    }).addListener('open', function(fd) {
      unopenedFilePathCount--;
      if(unopenedFilePathCount == 0) {
        emitter.emit("open");
        if(callback) callback();
      }
    }).addListener('error', function(err) {
      emitter.emit('error', err, filePath);
    });
    this.fstreams.push(stream);
  }
};

// Close all write streams, fire the callback after all streams are closed
// Also emits 'close' after all streams are closed
StreamLogger.prototype.close = function(callback) {
  for(var i = this.fstreams.length; i != 0; i--) {
    this.fstreams[i - 1].end();
  }
  // We're done closing, so emit the callbacks, then remove the fstreams
  this.fstreams = [];
  this.emitter.emit("close");
  if(callback) callback();
};

StreamLogger.prototype.reopen = function(callback) {
  var slSelf = this;
  this.close(function() {
    slSelf.open(function() {
      if(callback) callback();
    });
  });
};

StreamLogger.prototype.logAtLevel = function(message, level, callback) {
  var self = this;
  var levelName = this.revLevels[level];
  this.emitter.emit('message', message, levelName);
  this.emitter.emit('message-' + levelName, message);

  if(level < this.level) return false / this.emitter.emit('loggedMessage', message, levelName);
  this.emitter.emit('loggedMessage-' + levelName, message);

  // Check if there's a custom formatting callback
  if(this.format) {
    var outMessage = this.format(message, levelName);
  } else {
    var outMessage = (new Date).toLocaleISOString() + ' - ' + levelName + ': ' + message;
  }

  var fstream = this.fstreams[0];
  var logPath = fstream.path;
  //console.log(logPath);
  var logDir = logPath.substring(0, logPath.lastIndexOf('/'));
  mkdir.mkdirsSync(logDir);
  var flg = fs.existsSync(logPath);
  if(flg) {
    writeFile(fstream, outMessage, callback);
  } else {
    console.log(new Date().format('[yyyy-MM-dd hh:MM:ss] [')+logPath+']文件不存在重建文件.');
    self.reopen(function() {
      writeFile(self.fstreams[0], outMessage, callback);
    });
  }
};
var writeFile = function(fstream, outMessage, callback) {
    if(fstream.writable) {
      fstream.write(outMessage + "\n\n");
      if(callback) callback();
    } else {
      console.error(fstream.path + '文件不可写');
      this.emitter.emit('error', "Stream not writable", fstream.path);
    }
  };

Date.prototype.toLocaleISOString = function() {
  var date = this;
  var pad = function(i) {
      if(i < 10) {
        return '0' + i;
      }
      return i;
    };
  var pad3 = function(i) {
      if(i < 100) {
        return '0' + i;
      } else if(i < 10) {
        return '00' + i;
      }
      return i;
    };
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') + ' ' + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':');
};

exports.logger = function(logfile) {
  var _logger = new StreamLogger(logfile || '/opt/debug.log');
  _logger.level = _logger.levels.debug;

  process.on('SIGUSR2', function() {
    _logger.reopen(function() {
      console.log('log file reopened!');
    });
  });
  return {
    info: function(msg) {
      _logger.info(msg);
    },
    debug: function(msg) {
      _logger.debug(msg);
    },
    error: function(msg) {
      _logger.error(msg);
    }
  };
};