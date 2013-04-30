var findProvider = require('./find_provider');

module.exports = {
	/*
	@public
	@param {String} url
	*/
	run: function (url) {
		var provider = findProvider.run(url);

		switch(provider) {
			case 'vimeo':
				return 	url.split('/').pop();
				break;
			case 'youtube':
				return url.split('=').pop();
				break;
			case 'confreaks':
				return url.match(/\d+/i)[0];
				break;
			default:
				return undefined;
		}
	}
};