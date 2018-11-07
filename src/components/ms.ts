/* eslint-disable complexity, one-var, no-undefined*/

const s = 1000,
  m = s * 60,
  h = m * 60,
  d = h * 24,
  w = d * 7,
  y = d * 365.25;

const parse = (str : string) => {
  const match = (/^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i).exec(
    str
  );

  const n = parseFloat(match[1]),
    type = (match[2] || 'ms').toLowerCase();

  switch (type) {
  case 'years':
  case 'year':
  case 'yrs':
  case 'yr':
  case 'y':
    return n * y;
  case 'weeks':
  case 'week':
  case 'w':
    return n * w;
  case 'days':
  case 'day':
  case 'd':
    return n * d;
  case 'hours':
  case 'hour':
  case 'hrs':
  case 'hr':
  case 'h':
    return n * h;
  case 'minutes':
  case 'minute':
  case 'mins':
  case 'min':
  case 'm':
    return n * m;
  case 'seconds':
  case 'second':
  case 'secs':
  case 'sec':
  case 's':
    return n * s;
  case 'milliseconds':
  case 'millisecond':
  case 'msecs':
  case 'msec':
  case 'ms':
    return n;
  default:
    return undefined;
  }
};

export default (val : string) => {
  if (val.length > 0) {
    return parse(val);
  }

  throw new Error(`val is an empty string. val=${JSON.stringify(val)}`);
};