var assert = require('chai').assert;
var subject = require('../lib/find_provider');

describe('find_provider', function () {

	it('finds vimeo', function () {
		var res = subject.run('http://vimeo.com/26355165');
		assert.equal(res, 'vimeo');
	});

	it('finds vimeo', function () {
		var res = subject.run('http://www.vimeo.com/26355165');
		assert.equal(res, 'vimeo');
	});

	it("doesn't vimeo", function () {
		var res = subject.run('http://www.vimeod.com/26355165');
		assert.equal(res, 'unknown');
	});

	it("doesn't vimeo", function () {
		var res = subject.run('http://www.vimeo.com.fake.net/26355165');
		assert.equal(res, 'unknown');
	});

	it('finds youtube', function () {
		var res = subject.run('http://youtube.com/watch?v=9eHbqMayxv8');
		assert.equal(res, 'youtube');
	});

	it('finds youtube', function () {
		var res = subject.run('http://www.youtube.com/watch?v=9eHbqMayxv8');
		assert.equal(res, 'youtube');
	});

	it("doesn't youtube", function () {
		var res = subject.run('http://www.youtube3.com/watch?v=9eHbqMayxv8');
		assert.equal(res, 'unknown');
	});

	it("doesn't youtube", function () {
		var res = subject.run('http://www.youtube.com.fake.net/watch?v=9eHbqMayxv8');
		assert.equal(res, 'unknown');
	});

	it('finds confreaks', function () {
		var res = subject.run('http://confreaks.com/videos/3-mwrc2010-managing-ruby-projects-with-rvm');
		assert.equal(res, 'confreaks');
	});

	it('finds confreaks', function () {
		var res = subject.run('http://www.confreaks.com/videos/3-mwrc2010-managing-ruby-projects-with-rvm');
		assert.equal(res, 'confreaks');
	});

	it("doesn't confreaks", function () {
		var res = subject.run('http://www.confreaks4.com/videos/3-mwrc2010-managing-ruby-projects-with-rvm');
		assert.equal(res, 'unknown');
	});

	it("doesn't confreaks", function () {
		var res = subject.run('http://www.confreaks.com.fake.net/videos/3-mwrc2010-managing-ruby-projects-with-rvm');
		assert.equal(res, 'unknown');
	});

});