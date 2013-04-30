var rewire = require("rewire");
var assert = require('chai').assert;
var subject = rewire('../lib/retrieve_confreaks');
var fakeResponse = require('./response_confreaks');

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
		assert.equal(response.title, 'Ruby vs. the world');
	});

	it('has the description', function () {
		assert.match(response.description, /Ruby is an awesome programming language,/);
	});

	it('has the presenters', function () {
		assert.equal(response.presenters, 'Matt Aimonetti');
	});

	it('has thumbS', function () {
		assert.equal(response.thumbS, '');
	});

	it('has thumbM', function () {
		assert.equal(response.thumbM, '');
	});

	it('has thumbL', function () {
		assert.equal(response.thumbL, '');
	});



});