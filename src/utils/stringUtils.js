function charByteSize(ch) {
  if (ch == null || ch.length == 0) {
    return 0;
  }
  var charCode = ch.charCodeAt(0);
  if (charCode <= 0x00007f) {
    if (charCode == 0x00000a) {
      return 2;
    } else {
      return 1;
    }
  } else if (charCode <= 0x0007ff) {
    return 2;
  } else if (charCode <= 0x00ffff) {
    return 3;
  } else {
    return 4;
  }
}

export function getBytesLength(str) {
  let l = 0;
  for (let i = 0; i < str.length; i++) {
    l += charByteSize(str.charAt(i));
  }
  return l;
}

export function cutByMaxBytes(str, max) {
  let size = 0;
  for (let i = 0; i < str.length; i++) {
    let byteSize = charByteSize(str.charAt(i));
    size += byteSize;
    if (size > max) {
      return str.substring(0, i);
    }
  }
  return str;
}

export function isBlank(str) {
  return typeof str === 'undefined' || str === null || str.trim() === '';
}

export function isNotBlank(str) {
  return !isBlank(str);
}
