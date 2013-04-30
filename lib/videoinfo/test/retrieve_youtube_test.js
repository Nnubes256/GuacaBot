var rewire = require("rewire");
var assert = require('chai').assert;
var subject = rewire('../lib/retrieve_youtube');
var fakeResponse = require('./response_youtube');

subject.__set__('retriever', function (id, cb) {
	return cb(null, fakeResponse);
});

describe('vimeo', function () {

	var response = null;

	before(function (done) {
		subject.run('http://www.youtube.com/watch?v=9eHbqMayxv8', function (err, res) {
			response = res;
			done();
		});
	});

	it('has a run function', function () {
		assert.isFunction(subject.run);
	});

	it('has the title', function () {
		assert.equal(response.title, 'XRobots - Iron Man Arc Reactor prop made from dollar store parts');
	});

	it('has the description', function () {
		assert.match(response.description, /This is my Arc Reactor prop which s mostly/);
	});

	it('has the presenters', function () {
		assert.equal(response.presenters, '');
	});

	it('has thumbS', function () {
		assert.equal(response.thumbS, 'http://i.ytimg.com/vi/9eHbqMayxv8/default.jpg');
	});

	it('has thumbM', function () {
		assert.equal(response.thumbM, 'http://i.ytimg.com/vi/9eHbqMayxv8/default.jpg');
	});

	it('has thumbL', function () {
		assert.equal(response.thumbL, 'http://i.ytimg.com/vi/9eHbqMayxv8/default.jpg');
	});



});