function run(url) {
	if (url.match(/youtube.com\//)) {
		return 'youtube';
	}

	if (url.match(/vimeo.com\//)) {
		return 'vimeo';
	}

	if (url.match(/confreaks.com\//)) {
		return 'confreaks';
	}

	return 'unknown';
}

module.exports = {
	/*
	@public
	@param {String} url
	*/
	run: run
};