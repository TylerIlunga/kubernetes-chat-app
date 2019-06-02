module.exports = {
  jwt: {
    J_SECRET: process.env.J_SECRET || 'takeover2020s',
  },
  port: process.env.PORT || '2222',
  redis: {
    host: process.env.REDISHOST || 'localhost',
    port: process.env.REDISPORT || 6379,
  },
  session: {
    S_SECRET: process.env.S_SECRET || 'takeoverthe2020s',
  },
  web_base: 'http://127.0.0.1:4444',
  fromUTF8Array: data => {
    // array of bytes
    var str = '',
      i;

    for (i = 0; i < data.length; i++) {
      var value = data[i];

      if (value < 0x80) {
        str += String.fromCharCode(value);
      } else if (value > 0xbf && value < 0xe0) {
        str += String.fromCharCode(
          ((value & 0x1f) << 6) | (data[i + 1] & 0x3f),
        );
        i += 1;
      } else if (value > 0xdf && value < 0xf0) {
        str += String.fromCharCode(
          ((value & 0x0f) << 12) |
            ((data[i + 1] & 0x3f) << 6) |
            (data[i + 2] & 0x3f),
        );
        i += 2;
      } else {
        // surrogate pair
        var charCode =
          (((value & 0x07) << 18) |
            ((data[i + 1] & 0x3f) << 12) |
            ((data[i + 2] & 0x3f) << 6) |
            (data[i + 3] & 0x3f)) -
          0x010000;

        str += String.fromCharCode(
          (charCode >> 10) | 0xd800,
          (charCode & 0x03ff) | 0xdc00,
        );
        i += 3;
      }
    }

    return str;
  },
  toUTF8Array: str => {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(
          0xe0 | (charcode >> 12),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f),
        );
      }
      // surrogate pair
      else {
        i++;
        charcode = ((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff);
        utf8.push(
          0xf0 | (charcode >> 18),
          0x80 | ((charcode >> 12) & 0x3f),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f),
        );
      }
    }
    return utf8;
  },
};
