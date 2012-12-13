#!/bin/bash

PATH=/bin:/sbin:/usr/bin:/usr/sbin:$PATH
export PATH

cd /opt/node-pro/logsServer
pid=`cat process.pid`
if [ -z $pid ]
then 
 echo "logsServer is not running."
else 
 kill -9 $pid
fi
/usr/local/bin/node logsServer.js &

