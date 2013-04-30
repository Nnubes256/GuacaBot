var main = require('../lib/main');

main.fetch('http://www.confreaks.com/videos/1444288-rubyconNOTf2012-ruby-vs-the-world', function (err, data) {
	console.log(err);
	console.log(data);
});


main.fetch('http://www.confreaks.com/videos/', function (err, data) {
	console.log(err);
	console.log(data);
});