'use strict';

const {when, match} = require('match-when');
const bytes = require('bytes');
const filesize = require('file-size');
const moment = require('moment');
const _ = require('lodash');

/**
 * convert a value to the format stored into the database for this value
 * @param  {Number} value      the value we want to convert
 * @param  {String} unit       the unit of the value
 * @param  {String} convertTo    the unit we want the value to be converted
 * @return {Number}            the converted value
 */
const convertDuration = (value, unit, convertTo = 's') => {
  // microseconds aren't supported by moment -> convert to ms
  if (unit.toLowerCase() === 'us') {
    unit = 'ms';
    value /= 1000;
  }
  var duration = moment.duration(value, unit);
  return match(convertTo, {
    [when('us')]: duration.asMilliseconds() * 1000,
    [when('ms')]: duration.asMilliseconds(),
    [when('m')]: duration.asMinutes(),
    [when()]: duration.asSeconds()
  });
};

const units = {
  time: {
    available: ['s', 'ms', 'us'],
    toRawValue: convertDuration,
    humanize: convertDuration
  },
  number: {
    available: [''],
    toRawValue: _.identity,
    humanize: _.identity
  },
  size: {
    available: ['B', 'KB', 'MB', 'GB', 'TB'],
    toRawValue: function(value, unit) {
      return bytes(value + unit);
    },
    humanize: function(value, unit, convertTo) {
      return Math.round(filesize(value).to(convertTo));
    }
  }
};

/**
 * get the value and unit from a humanized value (e.g. '10kb' -> [10, 'kb'])
 * @param  {String} humanizedValue       the humanized value (e.g. '10kb')
 * @return {Array[value, unit]}
 */
const parse = (humanizedValue) => ((/^((-|\+)?(\d+(?:\.\d+)?)) *(.*)$/i).exec(humanizedValue) || []).slice(3);

/**
 * find the type (time, number, size) of a unit
 * @param  {string} unit     the unit (e.g. 'kb')
 * @return {string}          the type of the unit (e.g. 'size')
 */
const findType = (unit = '') => _(_.keys(units))
  .find(type => _.includes(units[type].available.map(a => a.toLowerCase()), unit.toLowerCase()));

module.exports = {
  /**
   * convert to the unit needed by the human (e.g. humanize(5000, '', 'kb') -> 5)
   * @param  {Number} value               the value to convert
   * @param  {[type]} fromUnit [description]
   * @param  {[type]} toUnit   [description]
   * @return {[type]}          [description]
   */
  humanize: (value, fromUnit, toUnit) => {
    const fHumanize = (units[findType(toUnit)] || {}).humanize || _.noop;
    return fHumanize(value, fromUnit, toUnit);
  },
  toRawValue: (humanizedValue, toUnit) => {
    const [value, unit] = parse(humanizedValue);
    const fRawValue = (units[findType(toUnit)] || {}).toRawValue || _.noop;
    return fRawValue(parseFloat(value, 10), unit, toUnit);
  }
};
