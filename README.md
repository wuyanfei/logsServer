logsServer
日志接收服务器

######日志系统启动######

npm install -d

cd logsServer

node logsServer.js

######test######

curl -d "logPath=log.log&logLevel=1&msg=sdfdfdfdfdffffffffffffffdf&projectName=receiveData" http://127.0.0.1:10060/logsPost

########使用说明##########

在使用logsServer来存储log日志时，要用到一个额外的js，./package/web-log.js

例如：

通过以下代码引入

var info_sh_sz = require('info_sh_sz.log');

log.debug('测试debug');

log.info('测试info');

log.error('测试error');







