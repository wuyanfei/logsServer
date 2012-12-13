var pad = function(i){
  if (i < 10) {
      return '0' + i;
    }
    return i;
}

var DateFormat=function(pattern,date){
		var year4=date.getFullYear();
		var year2=year4.toString().substring(2);
		pattern=pattern.replace(/yyyy/,year4);
		pattern=pattern.replace(/yy/,year2);

		var month=date.getMonth();
		month = month + 1;
		month = pad(month);
		pattern=pattern.replace(/MM/,month);

		var dayOfMonth=date.getDate();
		var dayOfMonth2=pad(dayOfMonth);		
		pattern=pattern.replace(/dd/,dayOfMonth2);
		pattern=pattern.replace(/d/,dayOfMonth);

		var hours=date.getHours();
		var hours2=pad(hours);
		pattern=pattern.replace(/HH/,hours2);
		pattern=pattern.replace(/H/,hours);

		var minutes=date.getMinutes();
		var minutes2=pad(minutes);
		pattern=pattern.replace(/mm/,minutes2);
		pattern=pattern.replace(/m/,minutes);

		var seconds=date.getSeconds();
		var seconds2=pad(seconds);
		pattern=pattern.replace(/ss/,seconds2);
		pattern=pattern.replace(/s/,seconds);

		var milliSeconds=date.getMilliseconds();
		pattern=pattern.replace(/S+/,milliSeconds);
		var day=date.getDay();
		var kHours=hours;
		if(kHours==0){
		kHours=24;	
		}
		var kHours2=pad(kHours);
		pattern=pattern.replace(/kk/,kHours2);
		pattern=pattern.replace(/k/,kHours);
		var KHours=hours;
		if(hours>11){
		KHours=hours-12;	
		}
		var KHours2=pad(KHours);
		pattern=pattern.replace(/KK/,KHours2);
		pattern=pattern.replace(/K/,KHours);
		var hHours=KHours;
		if(hHours==0){
		hHours=12;	
		}
		var hHours2=pad(hHours);
		pattern=pattern.replace(/hh/,hHours2);
		pattern=pattern.replace(/h/,hHours);
		return pattern;
}
exports.DateFormat=DateFormat;
Date.prototype.toString = function(){
  return DateFormat('[yyyy-MM-dd HH:mm:ss]',new Date())
}
/*同一天内*/
Date.prototype.diffByMinute = function(date,type){
	if(type != undefined){
		var oldHour = date.getHours();
		var nowHour = this.getHours();
		var diffMinutes = 0;
		if(oldHour <= 12 && nowHour >=13){
			diffMinutes = 90;
		}
		var oldMinute = date.getMinutes();
		var nowMinute = this.getMinutes();
		console.log('oldMinute='+oldMinute+',nowMinute='+nowMinute+',nowHour='+nowHour+',oldHour='+oldHour);
		var val = (nowHour-oldHour)*60-diffMinutes+(nowMinute-oldMinute);
		return val;
	}else{
		var hour = date.getHours();
		var _hour = this.getHours();
		var minusHour = _hour-hour;
		var minutes = minusHour*60;
		var minute = date.getMinutes();
		var _minute = this.getMinutes();
		minutes = minutes+_minute-minute;
		return minutes;
	}
}
/*同一天内*/
Date.prototype.diffBySecond = function(date){
	return ((this.getHours() - date.getHours())*60 + this.getMinutes() - date.getMinutes())*60+this.getSeconds() - date.getSeconds();
}
/*同一天内*/
Date.prototype.diffByMillisecond = function(date){
	return (((this.getHours() - date.getHours())*60+this.getMinutes() - date.getMinutes())*60 + this.getSeconds() - date.getSeconds())*1000 +this.getMilliseconds()-date.getMilliseconds();
}
