var findProvider = require('./find_provider');
var findId = require('./find_id');
var youtube = require('./retrieve_youtube');
var vimeo = require('./retrieve_vimeo');
var confreaks = require('./retrieve_confreaks');

module.exports = {
	//dependencies
	_vimeo: vimeo,
	_youtube: youtube,
	_confreaks: confreaks,

	fetch: function (url, cb) {
		var provider = findProvider.run(url);
		
		var retriever = this["_" + provider];

		if (retriever) {
			return retriever.run(url, cb);
		} else {
			return cb(new Error('Provider not found'));
		}
	},

	getProvider: function (url) {
		return findProvider.run(url);
	},

	getId: function (url) {
		return findId.run(url);
	}
};