var main = require('../lib/main');

main.fetch('http://vimeo.com/26355165', function (err, data) {
	console.log('==VIMEO==')
	console.log(data);
});

main.fetch('http://www.youtube.com/watch?v=9eHbqMayxv8', function (err, data) {
	console.log('==YOUTUBE==');
	console.log(data);
});

main.fetch('http://www.confreaks.com/videos/1288-rubyconf2012-ruby-vs-the-world', function (err, data) {
	console.log('==CONFREAKS==');
	console.log(data);
});