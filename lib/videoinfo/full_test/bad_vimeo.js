var main = require('../lib/main');

main.fetch('http://vimeo.com/263551645', function (err, data) {
	console.log('==VIMEO==')
	console.log(data);
});