var main = require('../lib/main');

main.fetch('http://www.youtube.com/watch?v=9eHbq55Mayxv8', function (err, data) {
	console.log('==YOUTUBE==');
	console.log(data);
});