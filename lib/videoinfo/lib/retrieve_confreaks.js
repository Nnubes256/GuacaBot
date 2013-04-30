var findId = require('./find_id');
var retriever = require('confreaks').scrape;

function run(url, cb) {

	var id = findId.run(url);

	return retriever(url, function (err, data){
		if (err) return cb(err);
		if (data === 404) return cb(null, 404);

		var info = {
			provider: 'confreaks',
			providerId: id,
			title: data.title,
			description: data.description,
			presenters: data.presenters,
			thumbS: "",
			thumbM: "",
			thumbL: ""
		};
		return cb(null, info);
	});
}

module.exports = {
	run: run
};