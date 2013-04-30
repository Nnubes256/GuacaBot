var rewire = require("rewire");
var assert = require('chai').assert;
var subject = rewire('../lib/retrieve_vimeo');
var fakeResponse = require('./response_vimeo');

subject.__set__('retriever', function (id, cb) {
	return cb(null, fakeResponse);
});

describe('vimeo', function () {

	var response = null;

	before(function (done) {
		subject.run('http://vimeo.com/26355165', function (err, res) {
			response = res;
			done();
		});
	});

	it('has a run function', function () {
		assert.isFunction(subject.run);
	});

	it('has the title', function () {
		assert.equal(response.title, 'Stay With Me - Janae Jones - United States');
	});

	it('has the description', function () {
		assert.match(response.description, /This multimedia piece is part of the Stay/);
	});

	it('has the presenters', function () {
		assert.equal(response.presenters, '');
	});

	it('has thumbS', function () {
		assert.equal(response.thumbS, 'http://b.vimeocdn.com/ts/174/014/174014885_100.jpg');
	});

	it('has thumbM', function () {
		assert.equal(response.thumbM, 'http://b.vimeocdn.com/ts/174/014/174014885_200.jpg');
	});

	it('has thumbL', function () {
		assert.equal(response.thumbL, 'http://b.vimeocdn.com/ts/174/014/174014885_640.jpg');
	});



});