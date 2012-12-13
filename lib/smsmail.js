var dateFormat = require('./dateFormat');
var mail = require('nodemailer'); 
var request = require('request');
var util = require("util");
process.setMaxListeners(0);
var SmsMail=function(settings){
	var self = this;
	var send=function(mobile,msg){
		var url = settings.sms.host.replace(/<1>/g,mobile).replace(/<2>/g,encodeURIComponent(msg));
		request({ uri:url, timeout:5000 }, function (error, response, body) {
			if(error || response.statusCode != 200) {
			//	console.log(utils.formatDate(),mobile,"发送短信失败！");
			}else{
			//	console.log(utils.formatDate(),mobile,"发送短信成功.");
			}
		});
	}
	this.sendSms=function(msg){
		var mobiles = settings.sms.mobile;
		for(var i=0;i<mobiles.length;i++){
			send(mobiles[i],msg);
		}
	};

	this.sendMail = function(msg){
		var user = settings.mail.user || 'appserver';
		var transport = mail.createTransport("SMTP", {
			host: settings.mail.host || 'mail.netgen.com.cn',     
			port: 25,     
			use_authentication: true,        
			user: user,   
			pass: settings.mail.pass || 'hand8888'
	    });
	    var from = settings.mail.from || 'appserver@netgen.com.cn';
	    var message = { 
	    	from: '行情报警<'+from+'>',
	    	to: settings.mail.to,
	    	subject: '预警信息', 
		    headers: {
		        'X-Laziness-level': 1000
		    },
	    	html: "<html><body>"+msg+"</body></html>"
		};

		console.log(utils.formatDate(),'Sending Mail...');
		transport.sendMail(message, function(error){
		    if(error){
		        console.log(utils.formatDate(),'Error occured');
		        console.log(utils.formatDate(),error.message);
		        return;
		    }
		    console.log(utils.formatDate(),'Message sent successfully!');
		});
	};
}
exports.createSmsMail=function(settings){
	return new SmsMail(settings);	
} 
