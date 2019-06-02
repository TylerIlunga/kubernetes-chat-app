const { toUTF8Array, fromUTF8Array } = require('../../config');

class Converter {
  constructor() {}
  dataAsBytes(data) {
    return toUTF8Array(JSON.stringify(data));
  }
  fromBytesToObject(data) {
    return JSON.parse(fromUTF8Array(data));
  }
}

module.exports = Converter;
