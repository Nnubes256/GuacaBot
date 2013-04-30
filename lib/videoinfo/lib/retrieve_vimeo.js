var findId = require('./find_id');
var retriever = require('n-vimeo').video;

function run(url, cb) {
	var id = findId.run(url);

	return retriever(id, function (err, data){
		if (err) return cb(err);

		if (!data.raw) {
			return cb(null, 404);
		}

		// Here the API expose three new objects: raw, thumb, username
		var info = {
			provider: 'vimeo',
			providerId: id,
			title: data.raw.title,
			description: data.raw.description,
			presenters: '',
			thumbS: data.thumb.s,
			thumbM: data.thumb.m,
			thumbL: data.thumb.l
		};
		return cb(null, info);
	});
}

module.exports = {
	run: run
};