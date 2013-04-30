var subject = require('../lib/main');
var assert = require('chai').assert;
var sinon = require('sinon');

var vimeoUrl = 'http://vimeo.com/26355165';
var youtubeUrl = 'http://www.youtube.com/watch?v=9eHbqMayxv8';
var cfUrl = 'http://www.confreaks.com/videos/3-mwrc2010-managing-ruby-projects-with-rvm';

describe('subject', function () {

	it('has a fetch function', function () {
		assert.isFunction(subject.fetch);
	});

	it('has a resolve function', function () {
		assert.isFunction(subject.getProvider);
	});

	describe('retrievers', function () {

		it('calls the vimeo retriever', function () {
			var mock = sinon.mock(subject._vimeo);
			mock.expects("run").withArgs(vimeoUrl);
			subject.fetch(vimeoUrl, null);
			mock.verify();
		});

		it('calls calls the youtube retriever', function () {
			var mock = sinon.mock(subject._youtube);
			mock.expects("run").withArgs(youtubeUrl);
			subject.fetch(youtubeUrl, null);
			mock.verify();
		});

		it('calls calls the youtube retriever', function () {
			var mock = sinon.mock(subject._confreaks);
			mock.expects("run").withArgs(cfUrl);
			subject.fetch(cfUrl, null);
			mock.verify();
		});

	});

	describe('provider', function () {

		it('finds the provider for vimeo', function () {
			var res = subject.getProvider(vimeoUrl);
			assert.equal(res, 'vimeo');
		});

		it('finds the provider for youtube', function () {
			var res = subject.getProvider(youtubeUrl);
			assert.equal(res, 'youtube');
		});

		it('finds the provider for confreaks', function () {
			var res = subject.getProvider(cfUrl);
			assert.equal(res, 'confreaks');
		});

		it('returns unknown provider if unknown', function () {
			var res = subject.getProvider("http://www.xyz.com");
			assert.equal(res, 'unknown');
		});

	});

});