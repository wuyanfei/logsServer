logsServer
日志接收服务器

######日志系统启动######

npm install -d

cd logsServer

node logsServer.js

######测试是否安装成功######

curl -d "logPath=online/test.log&logLevel=1&msg=恭喜，日志服务器安装成功&projectName=测试" http://127.0.0.1:10060/logsPost
tail -f /opt/node-pro/logsServer/log/fundFlow/online/test.log

########使用说明##########

在使用logsServer来存储log日志时，要用到一个额外的js，./package/web-log.js
以及一个配置文件 ./package/log-set.json
把web-log.js放到引用项目的lib下，log-set.json放到引用项目的etc下，即可成功使用。
Enjoy!!

Example：
通过以下代码引入

var info_sh_sz = require('info_sh_sz.log');

log.debug('测试debug');

log.info('测试info');

log.error('测试error');







