// Load modules

var expect = require('chai').expect;
var Cache = process.env.TEST_COV ? require('../../lib-cov/cache/index') : require('../../lib/cache/index');
var Rules = process.env.TEST_COV ? require('../../lib-cov/cache/rules') : require('../../lib/cache/rules');
var Sinon = require('sinon');

describe('Client', function() {

    it('throws an error if not using the redis engine', function(done) {
        var fn = function() {
            var options = {
                engine: 'bob'
            };

            var client = new Cache.Client(options);
        };

        expect(fn).to.throw(Error);
        done();
    });

    it('creates a new connection when using redis', function(done) {
        var redisMock = Sinon.mock(require('redis'));
        require.cache[require.resolve('redis')] = redisMock;

        var options = {
            engine: 'redis'
        };

        var client = new Cache.Client(options);
        expect(client).to.exist;

        var fn = function() {
            redisMock.verify();
        };

        expect(fn).to.not.throw(Error);
        require.cache[require.resolve('redis')] = null;
        done();
    });
});

describe('Cache Rules', function() {

    describe('#compile', function() {

        it('compiles a single rule', function(done) {
            var config = {
                expiresInSec: 50
            } ;
            var rule = Rules.compile(config);

            expect(rule.expiresInSec).to.equal(config.expiresInSec);

            done();
        });

        it('assigns the expiresInSec when the rule is cached', function(done) {
            var config = {
                expiresInSec: 50
            } ;
            var rule = Rules.compile(config);

            expect(rule.expiresInSec).to.equal(config.expiresInSec);

            done();
        });

        it('returns an error when parsing a bad expiresAt value', function(done) {
            var config = {
                expiresAt: function() { }
            };
            var rule = Rules.compile(config);

            expect(rule).to.be.an.instanceOf(Error);

            done();
        });
    });

    describe('#isExpired', function() {

        it('returns true when a matching rule is expired', function(done) {
            var config = {
                expiresInSec: 50
            };
            var rule = Rules.compile(config);
            var created = new Date(Date.now());
            created = created.setMinutes(created.getMinutes() - 5);

            var isExpired = Rules.isExpired(rule, created);
            expect(isExpired).to.be.true;
            done();
        });
    });
});