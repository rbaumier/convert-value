'use strict';

const t = require('chai').assert;
const converter = require('./');

describe('toRawValue', function() {
  describe('size', function() {
    it('should convert to raw value', function() {
      t.strictEqual(converter.toRawValue('10kb', 'b'), 10240);
    });

    it('should handle wrong values', function() {
      t.doesNotThrow(() => converter.toRawValue('10not-a-unit', 'b'));
      t.doesNotThrow(() => converter.toRawValue('I type things'));
      t.doesNotThrow(() => converter.toRawValue('still not good', 'rezrezrze'));
    });
  });
  describe('duration', function() {
    it('should convert to raw value with a specified output format', function() {
      t.strictEqual(converter.toRawValue('10m', 's'), 600);
    });

    it('handle wrong values', function() {
      t.doesNotThrow(() => converter.toRawValue('rezrez', 'rezrez'));
    });
  });
});

describe('humanizedValue', function() {
  describe('size', function() {
    it('should return the humanized value', function() {
      t.strictEqual(converter.humanize(5000, '', 'kb'), 5);
    });

    it('should handle wrong values', function() {
      t.doesNotThrow(() => converter.humanize('10not-a-unit', 'b'));
      t.doesNotThrow(() => converter.humanize('I type things'));
      t.doesNotThrow(() => converter.humanize('still not good', 'rezrezrze'));
    });
  });

  describe('duration', function() {
    it('should return ths humanized with a specified output format', function() {
      t.strictEqual(converter.humanize(10, 'm', 's'), 600);
    });

    it('handle wrong values', function() {
      t.doesNotThrow(() => converter.humanize('rezrez', 'rezrez', 'rzrezrez'));
    });
  });
});
