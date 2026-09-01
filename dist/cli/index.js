#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, cpSync, renameSync, rmSync } from 'fs';
import { styleText, promisify, parseArgs } from 'util';
import { execFile, spawn } from 'child_process';
import { resolve, basename, join } from 'path';
import process$1, { stdin, stdout } from 'process';
import * as l from 'readline';
import l__default from 'readline';
import { ReadStream } from 'tty';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

// node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js"(exports, module) {
    var p = process || {};
    var argv = p.argv || [];
    var env = p.env || {};
    var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input, index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let result = "", cursor3 = 0;
      do {
        result += string.substring(cursor3, index) + replace;
        cursor3 = index + close.length;
        index = string.indexOf(close, cursor3);
      } while (~index);
      return result + string.substring(cursor3);
    };
    var createColors = (enabled = isColorSupported) => {
      let f = enabled ? formatter : () => String;
      return {
        isColorSupported: enabled,
        reset: f("\x1B[0m", "\x1B[0m"),
        bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: f("\x1B[3m", "\x1B[23m"),
        underline: f("\x1B[4m", "\x1B[24m"),
        inverse: f("\x1B[7m", "\x1B[27m"),
        hidden: f("\x1B[8m", "\x1B[28m"),
        strikethrough: f("\x1B[9m", "\x1B[29m"),
        black: f("\x1B[30m", "\x1B[39m"),
        red: f("\x1B[31m", "\x1B[39m"),
        green: f("\x1B[32m", "\x1B[39m"),
        yellow: f("\x1B[33m", "\x1B[39m"),
        blue: f("\x1B[34m", "\x1B[39m"),
        magenta: f("\x1B[35m", "\x1B[39m"),
        cyan: f("\x1B[36m", "\x1B[39m"),
        white: f("\x1B[37m", "\x1B[39m"),
        gray: f("\x1B[90m", "\x1B[39m"),
        bgBlack: f("\x1B[40m", "\x1B[49m"),
        bgRed: f("\x1B[41m", "\x1B[49m"),
        bgGreen: f("\x1B[42m", "\x1B[49m"),
        bgYellow: f("\x1B[43m", "\x1B[49m"),
        bgBlue: f("\x1B[44m", "\x1B[49m"),
        bgMagenta: f("\x1B[45m", "\x1B[49m"),
        bgCyan: f("\x1B[46m", "\x1B[49m"),
        bgWhite: f("\x1B[47m", "\x1B[49m"),
        blackBright: f("\x1B[90m", "\x1B[39m"),
        redBright: f("\x1B[91m", "\x1B[39m"),
        greenBright: f("\x1B[92m", "\x1B[39m"),
        yellowBright: f("\x1B[93m", "\x1B[39m"),
        blueBright: f("\x1B[94m", "\x1B[39m"),
        magentaBright: f("\x1B[95m", "\x1B[39m"),
        cyanBright: f("\x1B[96m", "\x1B[39m"),
        whiteBright: f("\x1B[97m", "\x1B[39m"),
        bgBlackBright: f("\x1B[100m", "\x1B[49m"),
        bgRedBright: f("\x1B[101m", "\x1B[49m"),
        bgGreenBright: f("\x1B[102m", "\x1B[49m"),
        bgYellowBright: f("\x1B[103m", "\x1B[49m"),
        bgBlueBright: f("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
        bgCyanBright: f("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: f("\x1B[107m", "\x1B[49m")
      };
    };
    module.exports = createColors();
    module.exports.createColors = createColors;
  }
});

// node_modules/.pnpm/sisteransi@1.0.5/node_modules/sisteransi/src/index.js
var require_src = __commonJS({
  "node_modules/.pnpm/sisteransi@1.0.5/node_modules/sisteransi/src/index.js"(exports, module) {
    var ESC2 = "\x1B";
    var CSI2 = `${ESC2}[`;
    var beep = "\x07";
    var cursor3 = {
      to(x, y) {
        if (!y) return `${CSI2}${x + 1}G`;
        return `${CSI2}${y + 1};${x + 1}H`;
      },
      move(x, y) {
        let ret = "";
        if (x < 0) ret += `${CSI2}${-x}D`;
        else if (x > 0) ret += `${CSI2}${x}C`;
        if (y < 0) ret += `${CSI2}${-y}A`;
        else if (y > 0) ret += `${CSI2}${y}B`;
        return ret;
      },
      up: (count = 1) => `${CSI2}${count}A`,
      down: (count = 1) => `${CSI2}${count}B`,
      forward: (count = 1) => `${CSI2}${count}C`,
      backward: (count = 1) => `${CSI2}${count}D`,
      nextLine: (count = 1) => `${CSI2}E`.repeat(count),
      prevLine: (count = 1) => `${CSI2}F`.repeat(count),
      left: `${CSI2}G`,
      hide: `${CSI2}?25l`,
      show: `${CSI2}?25h`,
      save: `${ESC2}7`,
      restore: `${ESC2}8`
    };
    var scroll = {
      up: (count = 1) => `${CSI2}S`.repeat(count),
      down: (count = 1) => `${CSI2}T`.repeat(count)
    };
    var erase3 = {
      screen: `${CSI2}2J`,
      up: (count = 1) => `${CSI2}1J`.repeat(count),
      down: (count = 1) => `${CSI2}J`.repeat(count),
      line: `${CSI2}2K`,
      lineEnd: `${CSI2}K`,
      lineStart: `${CSI2}1K`,
      lines(count) {
        let clear = "";
        for (let i2 = 0; i2 < count; i2++)
          clear += this.line + (i2 < count - 1 ? cursor3.up() : "");
        if (count)
          clear += cursor3.left;
        return clear;
      }
    };
    module.exports = { cursor: cursor3, scroll, erase: erase3, beep };
  }
});

// src/cli/index.ts
var import_picocolors2 = __toESM(require_picocolors());

// src/cli/refs.ts
var LIB_REF = "v2.0.0";
var TEMPLATE_REF = "template-v2.0.0";
var REGISTRY_REF = "v2.0.0";
var SHADCN_VERSION = "4.19.1";
var TEMPLATE_REPO = "4T5Labs/frontend-template";
var LIB_REPO = "NETIX-AI-OSS/netix-frontend";
var REGISTRY_URL = `https://raw.githubusercontent.com/${LIB_REPO}/${REGISTRY_REF}/r/{name}.json`;

// src/cli/commands/add.ts
function qualifyItems(items) {
  return items.map(
    (item) => item.startsWith("@") || item.includes("/") || item.includes(":") ? item : `@netix/${item}`
  );
}
function addItems(items, passthrough = []) {
  const args = ["dlx", `shadcn@${SHADCN_VERSION}`, "add", ...qualifyItems(items), ...passthrough];
  return new Promise((resolve2) => {
    const child = spawn("pnpm", args, { stdio: "inherit" });
    child.on("close", (code) => resolve2(code ?? 1));
    child.on("error", () => resolve2(1));
  });
}

// node_modules/.pnpm/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/utils.js
var getCodePointsLength = /* @__PURE__ */ (() => {
  const SURROGATE_PAIR_RE = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return (input) => {
    let surrogatePairsNr = 0;
    SURROGATE_PAIR_RE.lastIndex = 0;
    while (SURROGATE_PAIR_RE.test(input)) {
      surrogatePairsNr += 1;
    }
    return input.length - surrogatePairsNr;
  };
})();
var isFullWidth = (x) => {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
};
var isWideNotCJKTNotEmoji = (x) => {
  return x === 8987 || x === 9001 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12771 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 19903 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
};

// node_modules/.pnpm/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/index.js
var ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]|\u001b\]8;[^;]*;.*?(?:\u0007|\u001b\u005c)/y;
var CONTROL_RE = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y;
var CJKT_WIDE_RE = /(?:(?![\uFF61-\uFF9F\uFF00-\uFFEF])[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Tangut}]){1,1000}/yu;
var TAB_RE = /\t{1,1000}/y;
var EMOJI_RE = new RegExp("[\\u{1F1E6}-\\u{1F1FF}]{2}|\\u{1F3F4}[\\u{E0061}-\\u{E007A}]{2}[\\u{E0030}-\\u{E0039}\\u{E0061}-\\u{E007A}]{1,3}\\u{E007F}|(?:\\p{Emoji}\\uFE0F\\u20E3?|\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|\\p{Emoji_Presentation})(?:\\u200D(?:\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|\\p{Emoji_Presentation}|\\p{Emoji}\\uFE0F\\u20E3?))*", "yu");
var LATIN_RE = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y;
var MODIFIER_RE = new RegExp("\\p{M}+", "gu");
var NO_TRUNCATION = { limit: Infinity, ellipsis: "" };
var getStringTruncatedWidth = (input, truncationOptions = {}, widthOptions = {}) => {
  const LIMIT = truncationOptions.limit ?? Infinity;
  const ELLIPSIS = truncationOptions.ellipsis ?? "";
  const ELLIPSIS_WIDTH = truncationOptions?.ellipsisWidth ?? (ELLIPSIS ? getStringTruncatedWidth(ELLIPSIS, NO_TRUNCATION, widthOptions).width : 0);
  const ANSI_WIDTH = 0;
  const CONTROL_WIDTH = widthOptions.controlWidth ?? 0;
  const TAB_WIDTH = widthOptions.tabWidth ?? 8;
  const EMOJI_WIDTH = widthOptions.emojiWidth ?? 2;
  const FULL_WIDTH_WIDTH = 2;
  const REGULAR_WIDTH = widthOptions.regularWidth ?? 1;
  const WIDE_WIDTH = widthOptions.wideWidth ?? FULL_WIDTH_WIDTH;
  const PARSE_BLOCKS = [
    [LATIN_RE, REGULAR_WIDTH],
    [ANSI_RE, ANSI_WIDTH],
    [CONTROL_RE, CONTROL_WIDTH],
    [TAB_RE, TAB_WIDTH],
    [EMOJI_RE, EMOJI_WIDTH],
    [CJKT_WIDE_RE, WIDE_WIDTH]
  ];
  let indexPrev = 0;
  let index = 0;
  let length = input.length;
  let lengthExtra = 0;
  let truncationEnabled = false;
  let truncationIndex = length;
  let truncationLimit = Math.max(0, LIMIT - ELLIPSIS_WIDTH);
  let unmatchedStart = 0;
  let unmatchedEnd = 0;
  let width = 0;
  let widthExtra = 0;
  outer: while (true) {
    if (unmatchedEnd > unmatchedStart || index >= length && index > indexPrev) {
      const unmatched = input.slice(unmatchedStart, unmatchedEnd) || input.slice(indexPrev, index);
      lengthExtra = 0;
      for (const char of unmatched.replaceAll(MODIFIER_RE, "")) {
        const codePoint = char.codePointAt(0) || 0;
        if (isFullWidth(codePoint)) {
          widthExtra = FULL_WIDTH_WIDTH;
        } else if (isWideNotCJKTNotEmoji(codePoint)) {
          widthExtra = WIDE_WIDTH;
        } else {
          widthExtra = REGULAR_WIDTH;
        }
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, Math.max(unmatchedStart, indexPrev) + lengthExtra);
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break outer;
        }
        lengthExtra += char.length;
        width += widthExtra;
      }
      unmatchedStart = unmatchedEnd = 0;
    }
    if (index >= length) {
      break outer;
    }
    for (let i2 = 0, l2 = PARSE_BLOCKS.length; i2 < l2; i2++) {
      const [BLOCK_RE, BLOCK_WIDTH] = PARSE_BLOCKS[i2];
      BLOCK_RE.lastIndex = index;
      if (BLOCK_RE.test(input)) {
        lengthExtra = BLOCK_RE === CJKT_WIDE_RE ? getCodePointsLength(input.slice(index, BLOCK_RE.lastIndex)) : BLOCK_RE === EMOJI_RE ? 1 : BLOCK_RE.lastIndex - index;
        widthExtra = lengthExtra * BLOCK_WIDTH;
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / BLOCK_WIDTH));
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break outer;
        }
        width += widthExtra;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = BLOCK_RE.lastIndex;
        continue outer;
      }
    }
    index += 1;
  }
  return {
    width: truncationEnabled ? truncationLimit : width,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    ellipsed: truncationEnabled && LIMIT >= ELLIPSIS_WIDTH
  };
};
var dist_default = getStringTruncatedWidth;

// node_modules/.pnpm/fast-string-width@3.0.2/node_modules/fast-string-width/dist/index.js
var NO_TRUNCATION2 = {
  limit: Infinity,
  ellipsis: "",
  ellipsisWidth: 0
};
var fastStringWidth = (input, options = {}) => {
  return dist_default(input, NO_TRUNCATION2, options).width;
};
var dist_default2 = fastStringWidth;

// node_modules/.pnpm/fast-wrap-ansi@0.2.2/node_modules/fast-wrap-ansi/lib/main.js
var ESC = "\x1B";
var CSI = "\x9B";
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var GROUP_REGEX = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`, "y");
var getClosingCode = (openingCode) => {
  if (openingCode >= 30 && openingCode <= 37)
    return 39;
  if (openingCode >= 90 && openingCode <= 97)
    return 39;
  if (openingCode >= 40 && openingCode <= 47)
    return 49;
  if (openingCode >= 100 && openingCode <= 107)
    return 49;
  if (openingCode === 1 || openingCode === 2)
    return 22;
  if (openingCode === 3)
    return 23;
  if (openingCode === 4)
    return 24;
  if (openingCode === 7)
    return 27;
  if (openingCode === 8)
    return 28;
  if (openingCode === 9)
    return 29;
  if (openingCode === 0)
    return 0;
  return void 0;
};
var wrapAnsiCode = (code) => `${ESC}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESC}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wrapWord = (rows, word, columns) => {
  const characters = word[Symbol.iterator]();
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let lastRow = rows.at(-1);
  let visible = lastRow === void 0 ? 0 : dist_default2(lastRow);
  let currentCharacter = characters.next();
  let nextCharacter = characters.next();
  let rawCharacterIndex = 0;
  while (!currentCharacter.done) {
    const character = currentCharacter.value;
    const characterLength = dist_default2(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (character === ESC || character === CSI) {
      isInsideEscape = true;
      isInsideLinkEscape = word.startsWith(ANSI_ESCAPE_LINK, rawCharacterIndex + 1);
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
    } else {
      visible += characterLength;
      if (visible === columns && !nextCharacter.done) {
        rows.push("");
        visible = 0;
      }
    }
    currentCharacter = nextCharacter;
    nextCharacter = characters.next();
    rawCharacterIndex += character.length;
  }
  lastRow = rows.at(-1);
  if (!visible && lastRow !== void 0 && lastRow.length && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last) {
    if (dist_default2(words[last - 1])) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const words = string.split(" ");
  let rows = [""];
  let rowLength = 0;
  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    if (options.trim !== false) {
      const row = rows.at(-1) ?? "";
      const trimmed = row.trimStart();
      if (row.length !== trimmed.length) {
        rows[rows.length - 1] = trimmed;
        rowLength = dist_default2(trimmed);
      }
    }
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    const wordLength = dist_default2(word);
    if (options.hard && wordLength > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((wordLength - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((wordLength - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    if (rowLength + wordLength > columns && rowLength && wordLength) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        rowLength = dist_default2(rows.at(-1) ?? "");
        continue;
      }
      rows.push("");
      rowLength = 0;
    }
    if (rowLength + wordLength > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    rows[rows.length - 1] += word;
    rowLength += wordLength;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join("\n");
  let inSurrogate = false;
  for (let i2 = 0; i2 < preString.length; i2++) {
    const character = preString[i2];
    returnValue += character;
    if (!inSurrogate) {
      inSurrogate = character >= "\uD800" && character <= "\uDBFF";
      if (inSurrogate) {
        continue;
      }
    } else {
      inSurrogate = false;
    }
    if (character === ESC || character === CSI) {
      GROUP_REGEX.lastIndex = i2 + 1;
      const groupsResult = GROUP_REGEX.exec(preString);
      const groups = groupsResult?.groups;
      if (groups?.code !== void 0) {
        const code = Number.parseFloat(groups.code);
        escapeCode = code === END_CODE ? void 0 : code;
      } else if (groups?.uri !== void 0) {
        escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
      }
    }
    if (preString[i2 + 1] === "\n") {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      const closingCode = escapeCode ? getClosingCode(escapeCode) : void 0;
      if (escapeCode && closingCode) {
        returnValue += wrapAnsiCode(closingCode);
      }
    } else if (character === "\n") {
      if (escapeCode && getClosingCode(escapeCode)) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
  }
  return returnValue;
};
var CRLF_OR_LF = /\r?\n/;
function wrapAnsi(string, columns, options) {
  return String(string).normalize().split(CRLF_OR_LF).map((line) => exec(line, columns, options)).join("\n");
}

// node_modules/.pnpm/@clack+core@1.4.3/node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src());
function findCursor(s, o, l2) {
  if (!l2.some((r2) => !r2.disabled))
    return s;
  const t2 = s + o, n2 = Math.max(l2.length - 1, 0), e = t2 < 0 ? n2 : t2 > n2 ? 0 : t2;
  return l2[e]?.disabled ? findCursor(e, o < 0 ? -1 : 1, l2) : e;
}
var a$1 = ["up", "down", "left", "right", "space", "enter", "cancel"];
var settings = {
  actions: new Set(a$1),
  aliases: /* @__PURE__ */ new Map([
    // vim support
    ["k", "up"],
    ["j", "down"],
    ["h", "left"],
    ["l", "right"],
    ["", "cancel"],
    // opinionated defaults!
    ["escape", "cancel"]
  ]),
  messages: {
    cancel: "Canceled",
    error: "Something went wrong"
  },
  withGuide: true};
function isActionKey(n2, e) {
  if (typeof n2 == "string")
    return settings.aliases.get(n2) === e;
  for (const s of n2)
    if (s !== void 0 && isActionKey(s, e))
      return true;
  return false;
}
function diffLines(i2, s) {
  if (i2 === s) return;
  const e = i2.split(`
`), t2 = s.split(`
`), r2 = Math.max(e.length, t2.length), f = [];
  for (let n2 = 0; n2 < r2; n2++)
    e[n2] !== t2[n2] && f.push(n2);
  return {
    lines: f,
    numLinesBefore: e.length,
    numLinesAfter: t2.length,
    numLines: r2
  };
}
var R = globalThis.process.platform.startsWith("win");
var CANCEL_SYMBOL = /* @__PURE__ */ Symbol("clack:cancel");
function isCancel(e) {
  return e === CANCEL_SYMBOL;
}
function setRawMode(e, r2) {
  const o = e;
  o.isTTY && o.setRawMode(r2);
}
function block({
  input: e = stdin,
  output: r2 = stdout,
  overwrite: o = true,
  hideCursor: t2 = true
} = {}) {
  const s = l.createInterface({
    input: e,
    output: r2,
    prompt: "",
    tabSize: 1
  });
  l.emitKeypressEvents(e, s), e instanceof ReadStream && e.isTTY && e.setRawMode(true);
  const n2 = (f, { name: a2, sequence: p }) => {
    const c = String(f);
    if (isActionKey([c, a2, p], "cancel")) {
      t2 && r2.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!o) return;
    const i2 = a2 === "return" ? 0 : -1, m2 = a2 === "return" ? -1 : 0;
    l.moveCursor(r2, i2, m2, () => {
      l.clearLine(r2, 1, () => {
        e.once("keypress", n2);
      });
    });
  };
  return t2 && r2.write(import_sisteransi.cursor.hide), e.once("keypress", n2), () => {
    e.off("keypress", n2), t2 && r2.write(import_sisteransi.cursor.show), e instanceof ReadStream && e.isTTY && !R && e.setRawMode(false), s.terminal = false, s.close();
  };
}
var getColumns = (e) => "columns" in e && typeof e.columns == "number" ? e.columns : 80;
var getRows = (e) => "rows" in e && typeof e.rows == "number" ? e.rows : 20;
function wrapTextWithPrefix(e, r2, o, t2 = o, s = o, n2) {
  const f = getColumns(e ?? stdout);
  return wrapAnsi(r2, f - o.length, {
    hard: true,
    trim: false
  }).split(`
`).map((c, i2, m2) => {
    const d = c;
    return i2 === 0 ? `${t2}${d}` : i2 === m2.length - 1 ? `${s}${d}` : `${o}${d}`;
  }).join(`
`);
}
function runValidation(e, n2) {
  if ("~standard" in e) {
    const a2 = e["~standard"].validate(n2);
    if (a2 instanceof Promise)
      throw new TypeError(
        "Schema validation must be synchronous. Update `validate()` and remove any asynchronous logic."
      );
    return a2.issues?.at(0)?.message;
  }
  return e(n2);
}
var V = class {
  input;
  output;
  _abortSignal;
  rl;
  opts;
  _render;
  _track = false;
  _prevFrame = "";
  _subscribers = /* @__PURE__ */ new Map();
  _cursor = 0;
  state = "initial";
  error = "";
  value;
  userInput = "";
  constructor(t2, e = true) {
    const { input: i2 = stdin, output: n2 = stdout, render: s, signal: r2, ...o } = t2;
    this.opts = o, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = s.bind(this), this._track = e, this._abortSignal = r2, this.input = i2, this.output = n2;
  }
  /**
   * Unsubscribe all listeners
   */
  unsubscribe() {
    this._subscribers.clear();
  }
  /**
   * Set a subscriber with opts
   * @param event - The event name
   */
  setSubscriber(t2, e) {
    const i2 = this._subscribers.get(t2) ?? [];
    i2.push(e), this._subscribers.set(t2, i2);
  }
  /**
   * Subscribe to an event
   * @param event - The event name
   * @param cb - The callback
   */
  on(t2, e) {
    this.setSubscriber(t2, { cb: e });
  }
  /**
   * Subscribe to an event once
   * @param event - The event name
   * @param cb - The callback
   */
  once(t2, e) {
    this.setSubscriber(t2, { cb: e, once: true });
  }
  /**
   * Emit an event with data
   * @param event - The event name
   * @param data - The data to pass to the callback
   */
  emit(t2, ...e) {
    const i2 = this._subscribers.get(t2) ?? [], n2 = [];
    for (const s of i2)
      s.cb(...e), s.once && n2.push(() => i2.splice(i2.indexOf(s), 1));
    for (const s of n2)
      s();
  }
  prompt() {
    return new Promise((t2) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted)
          return this.state = "cancel", this.close(), t2(CANCEL_SYMBOL);
        this._abortSignal.addEventListener(
          "abort",
          () => {
            this.state = "cancel", this.close();
          },
          { once: true }
        );
      }
      this.rl = l__default.createInterface({
        input: this.input,
        tabSize: 2,
        prompt: "",
        escapeCodeTimeout: 50,
        terminal: true
      }), this.rl.prompt(), this.opts.initialUserInput !== void 0 && this._setUserInput(this.opts.initialUserInput, true), this.input.on("keypress", this.onKeypress), setRawMode(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(CANCEL_SYMBOL);
      });
    });
  }
  _isActionKey(t2, e) {
    return t2 === "	";
  }
  _shouldSubmit(t2, e) {
    return true;
  }
  _setValue(t2) {
    this.value = t2, this.emit("value", this.value);
  }
  _setUserInput(t2, e) {
    this.userInput = t2 ?? "", this.emit("userInput", this.userInput), e && this._track && this.rl && (this.rl.write(this.userInput), this._cursor = this.rl.cursor);
  }
  _clearUserInput() {
    this.rl?.write(null, { ctrl: true, name: "u" }), this._setUserInput("");
  }
  onKeypress(t2, e) {
    if (this._track && e.name !== "return" && (e.name && this._isActionKey(t2, e) && this.rl?.write(null, { ctrl: true, name: "h" }), this._cursor = this.rl?.cursor ?? 0, this._setUserInput(this.rl?.line)), this.state === "error" && (this.state = "active"), e?.name && (!this._track && settings.aliases.has(e.name) && this.emit("cursor", settings.aliases.get(e.name)), settings.actions.has(e.name) && this.emit("cursor", e.name)), t2 && (t2.toLowerCase() === "y" || t2.toLowerCase() === "n") && this.emit("confirm", t2.toLowerCase() === "y"), this.emit("key", t2, e), e?.name === "return" && this._shouldSubmit(t2, e)) {
      if (this.opts.validate) {
        const i2 = runValidation(this.opts.validate, this.value);
        i2 && (this.error = i2 instanceof Error ? i2.message : i2, this.state = "error", this.rl?.write(this.userInput));
      }
      this.state !== "error" && (this.state = "submit");
    }
    isActionKey([t2, e?.name, e?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), setRawMode(this.input, false), this.rl?.close(), this.rl = void 0, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const t2 = wrapAnsi(this._prevFrame, process.stdout.columns, { hard: true, trim: false }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, t2 * -1));
  }
  render() {
    const t2 = wrapAnsi(this._render(this) ?? "", process.stdout.columns, {
      hard: true,
      trim: false
    });
    if (t2 !== this._prevFrame) {
      if (this.state === "initial")
        this.output.write(import_sisteransi.cursor.hide);
      else {
        const e = diffLines(this._prevFrame, t2), i2 = getRows(this.output);
        if (this.restoreCursor(), e) {
          const n2 = Math.max(0, e.numLinesAfter - i2), s = Math.max(0, e.numLinesBefore - i2);
          let r2 = e.lines.find((o) => o >= n2);
          if (r2 === void 0) {
            this._prevFrame = t2;
            return;
          }
          if (e.lines.length === 1) {
            this.output.write(import_sisteransi.cursor.move(0, r2 - s)), this.output.write(import_sisteransi.erase.lines(1));
            const o = t2.split(`
`);
            this.output.write(o[r2]), this._prevFrame = t2, this.output.write(import_sisteransi.cursor.move(0, o.length - r2 - 1));
            return;
          } else if (e.lines.length > 1) {
            if (n2 < s)
              r2 = n2;
            else {
              const h2 = r2 - s;
              h2 > 0 && this.output.write(import_sisteransi.cursor.move(0, h2));
            }
            this.output.write(import_sisteransi.erase.down());
            const f = t2.split(`
`).slice(r2);
            this.output.write(f.join(`
`)), this._prevFrame = t2;
            return;
          }
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(t2), this.state === "initial" && (this.state = "active"), this._prevFrame = t2;
    }
  }
};
var r = class extends V {
  get cursor() {
    return this.value ? 0 : 1;
  }
  get _value() {
    return this.cursor === 0;
  }
  constructor(t2) {
    super(t2, false), this.value = !!t2.initialValue, this.on("userInput", () => {
      this.value = this._value;
    }), this.on("confirm", (i2) => {
      this.output.write(import_sisteransi.cursor.move(0, -1)), this.value = i2, this.state = "submit", this.close();
    }), this.on("cursor", () => {
      this.value = !this.value;
    });
  }
};
var a = class extends V {
  options;
  cursor = 0;
  get _value() {
    return this.options[this.cursor]?.value;
  }
  get _enabledOptions() {
    return this.options.filter((e) => e.disabled !== true);
  }
  toggleAll() {
    const e = this._enabledOptions, i2 = this.value !== void 0 && this.value.length === e.length;
    this.value = i2 ? [] : e.map((t2) => t2.value);
  }
  toggleInvert() {
    const e = this.value;
    if (!e)
      return;
    const i2 = this._enabledOptions.filter((t2) => !e.includes(t2.value));
    this.value = i2.map((t2) => t2.value);
  }
  toggleValue() {
    this.value === void 0 && (this.value = []);
    const e = this.value.includes(this._value);
    this.value = e ? this.value.filter((i2) => i2 !== this._value) : [...this.value, this._value];
  }
  constructor(e) {
    super(e, false), this.options = e.options, this.value = [...e.initialValues ?? []];
    const i2 = Math.max(
      this.options.findIndex(({ value: t2 }) => t2 === e.cursorAt),
      0
    );
    this.cursor = this.options[i2]?.disabled ? findCursor(i2, 1, this.options) : i2, this.on("key", (t2, l2) => {
      l2.name === "a" && this.toggleAll(), l2.name === "i" && this.toggleInvert();
    }), this.on("cursor", (t2) => {
      switch (t2) {
        case "left":
        case "up":
          this.cursor = findCursor(this.cursor, -1, this.options);
          break;
        case "down":
        case "right":
          this.cursor = findCursor(this.cursor, 1, this.options);
          break;
        case "space":
          this.toggleValue();
          break;
      }
    });
  }
};
var n = class extends V {
  get userInputWithCursor() {
    if (this.state === "submit")
      return this.userInput;
    const t2 = this.userInput;
    if (this.cursor >= t2.length)
      return `${this.userInput}\u2588`;
    const r2 = t2.slice(0, this.cursor), s = t2.slice(this.cursor, this.cursor + 1), e = t2.slice(this.cursor + 1);
    return `${r2}${styleText("inverse", s)}${e}`;
  }
  get cursor() {
    return this._cursor;
  }
  constructor(t2) {
    super({
      ...t2,
      initialUserInput: t2.initialUserInput ?? t2.initialValue
    }), this.on("userInput", (r2) => {
      this._setValue(r2);
    }), this.on("finalize", () => {
      this.value || (this.value = t2.defaultValue), this.value === void 0 && (this.value = "");
    });
  }
};
var import_sisteransi2 = __toESM(require_src());
function isUnicodeSupported() {
  if (process$1.platform !== "win32") {
    return process$1.env.TERM !== "linux";
  }
  return Boolean(process$1.env.CI) || Boolean(process$1.env.WT_SESSION) || Boolean(process$1.env.TERMINUS_SUBLIME) || process$1.env.ConEmuTask === "{cmd::Cmder}" || process$1.env.TERM_PROGRAM === "Terminus-Sublime" || process$1.env.TERM_PROGRAM === "vscode" || process$1.env.TERM === "xterm-256color" || process$1.env.TERM === "alacritty" || process$1.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var unicode = isUnicodeSupported();
var isCI = () => process.env.CI === "true";
var unicodeOr = (o, e) => unicode ? o : e;
var S_STEP_ACTIVE = unicodeOr("\u25C6", "*");
var S_STEP_CANCEL = unicodeOr("\u25A0", "x");
var S_STEP_ERROR = unicodeOr("\u25B2", "x");
var S_STEP_SUBMIT = unicodeOr("\u25C7", "o");
var S_BAR_START = unicodeOr("\u250C", "T");
var S_BAR = unicodeOr("\u2502", "|");
var S_BAR_END = unicodeOr("\u2514", "\u2014");
var S_RADIO_ACTIVE = unicodeOr("\u25CF", ">");
var S_RADIO_INACTIVE = unicodeOr("\u25CB", " ");
var S_CHECKBOX_ACTIVE = unicodeOr("\u25FB", "[\u2022]");
var S_CHECKBOX_SELECTED = unicodeOr("\u25FC", "[+]");
var S_CHECKBOX_INACTIVE = unicodeOr("\u25FB", "[ ]");
var S_BAR_H = unicodeOr("\u2500", "-");
var S_CORNER_TOP_RIGHT = unicodeOr("\u256E", "+");
var S_CONNECT_LEFT = unicodeOr("\u251C", "+");
var S_CORNER_BOTTOM_RIGHT = unicodeOr("\u256F", "+");
var S_INFO = unicodeOr("\u25CF", "\u2022");
var S_SUCCESS = unicodeOr("\u25C6", "*");
var S_WARN = unicodeOr("\u25B2", "!");
var S_ERROR = unicodeOr("\u25A0", "x");
var symbol = (o) => {
  switch (o) {
    case "initial":
    case "active":
      return styleText("cyan", S_STEP_ACTIVE);
    case "cancel":
      return styleText("red", S_STEP_CANCEL);
    case "error":
      return styleText("yellow", S_STEP_ERROR);
    case "submit":
      return styleText("green", S_STEP_SUBMIT);
  }
};
var symbolBar = (o) => {
  switch (o) {
    case "initial":
    case "active":
      return styleText("cyan", S_BAR);
    case "cancel":
      return styleText("red", S_BAR);
    case "error":
      return styleText("yellow", S_BAR);
    case "submit":
      return styleText("green", S_BAR);
  }
};
function formatInstructionFooter(o, e) {
  const r2 = [`${e ? `${styleText("cyan", S_BAR)}  ` : ""}${o.join(" \u2022 ")}`];
  return e && r2.push(styleText("cyan", S_BAR_END)), r2;
}
var I = (l2, e, w, p, b, C2 = false) => {
  let r2 = e, O = 0;
  if (C2)
    for (let i2 = p - 1; i2 >= w; i2--) {
      const m2 = l2[i2];
      if (m2 && (r2 -= m2.length), O++, r2 <= b) break;
    }
  else
    for (let i2 = w; i2 < p; i2++) {
      const m2 = l2[i2];
      if (m2 && (r2 -= m2.length), O++, r2 <= b) break;
    }
  return { lineCount: r2, removals: O };
};
var limitOptions = ({
  cursor: l2,
  options: e,
  style: w,
  output: p = process.stdout,
  maxItems: b = Number.POSITIVE_INFINITY,
  columnPadding: C2 = 0,
  rowPadding: r2 = 4
}) => {
  const i2 = getColumns(p) - C2, m2 = getRows(p), M = styleText("dim", "..."), v = Math.max(m2 - r2, 0), a2 = Math.max(Math.min(b, v), 5);
  let f = 0;
  l2 >= a2 - 3 && (f = Math.max(
    Math.min(l2 - a2 + 3, e.length - a2),
    0
  ));
  let d = a2 < e.length && f > 0, c = a2 < e.length && f + a2 < e.length;
  const W2 = Math.min(
    f + a2,
    e.length
  ), s = [];
  let g = 0;
  d && g++, c && g++;
  const T = f + (d ? 1 : 0), y = W2 - (c ? 1 : 0);
  for (let t2 = T; t2 < y; t2++) {
    const n2 = e[t2], o = n2 ? w(n2, t2 === l2) : "", h2 = wrapAnsi(o, i2, {
      hard: true,
      trim: false
    }).split(`
`);
    s.push(h2), g += h2.length;
  }
  if (g > v) {
    let t2 = 0, n2 = 0, o = g;
    const h2 = l2 - T;
    let u3 = v;
    const L = () => I(s, o, 0, h2, u3), E = () => I(
      s,
      o,
      h2 + 1,
      s.length,
      u3,
      true
    );
    d ? ({ lineCount: o, removals: t2 } = L(), o > u3 && (c || (u3 -= 1), { lineCount: o, removals: n2 } = E())) : (c || (u3 -= 1), { lineCount: o, removals: n2 } = E(), o > u3 && (u3 -= 1, { lineCount: o, removals: t2 } = L())), t2 > 0 && (d = true, s.splice(0, t2)), n2 > 0 && (c = true, s.splice(s.length - n2, n2));
  }
  const x = [];
  d && x.push(M);
  for (const t2 of s)
    for (const n2 of t2)
      x.push(n2);
  return c && x.push(M), x;
};
var confirm = (i2) => {
  const a2 = i2.active ?? "Yes", s = i2.inactive ?? "No";
  return new r({
    active: a2,
    inactive: s,
    signal: i2.signal,
    input: i2.input,
    output: i2.output,
    initialValue: i2.initialValue ?? true,
    render() {
      const e = i2.withGuide ?? settings.withGuide, u3 = `${symbol(this.state)}  `, l2 = e ? `${styleText("gray", S_BAR)}  ` : "", f = wrapTextWithPrefix(
        i2.output,
        i2.message,
        l2,
        u3
      ), o = `${e ? `${styleText("gray", S_BAR)}
` : ""}${f}
`, c = this.value ? a2 : s;
      switch (this.state) {
        case "submit": {
          const r2 = e ? `${styleText("gray", S_BAR)}  ` : "";
          return `${o}${r2}${styleText("dim", c)}`;
        }
        case "cancel": {
          const r2 = e ? `${styleText("gray", S_BAR)}  ` : "";
          return `${o}${r2}${styleText(["strikethrough", "dim"], c)}${e ? `
${styleText("gray", S_BAR)}` : ""}`;
        }
        default: {
          const r2 = e ? `${styleText("cyan", S_BAR)}  ` : "", g = e ? styleText("cyan", S_BAR_END) : "";
          return `${o}${r2}${this.value ? `${styleText("green", S_RADIO_ACTIVE)} ${a2}` : `${styleText("dim", S_RADIO_INACTIVE)} ${styleText("dim", a2)}`}${i2.vertical ? e ? `
${styleText("cyan", S_BAR)}  ` : `
` : ` ${styleText("dim", "/")} `}${this.value ? `${styleText("dim", S_RADIO_INACTIVE)} ${styleText("dim", s)}` : `${styleText("green", S_RADIO_ACTIVE)} ${s}`}
${g}
`;
        }
      }
    }
  }).prompt();
};
var MULTISELECT_INSTRUCTIONS = [
  `${styleText("dim", "\u2191/\u2193")} to navigate`,
  `${styleText("dim", "Space:")} select`,
  `${styleText("dim", "Enter:")} confirm`
];
var m = (i2, u3) => i2.split(`
`).map((d) => u3(d)).join(`
`);
var multiselect = (i2) => {
  const u3 = (t2, a2) => {
    const r2 = t2.label ?? String(t2.value);
    return a2 === "disabled" ? `${styleText("gray", S_CHECKBOX_INACTIVE)} ${m(r2, (o) => styleText(["strikethrough", "gray"], o))}${t2.hint ? ` ${styleText("dim", `(${t2.hint ?? "disabled"})`)}` : ""}` : a2 === "active" ? `${styleText("cyan", S_CHECKBOX_ACTIVE)} ${r2}${t2.hint ? ` ${styleText("dim", `(${t2.hint})`)}` : ""}` : a2 === "selected" ? `${styleText("green", S_CHECKBOX_SELECTED)} ${m(r2, (o) => styleText("dim", o))}${t2.hint ? ` ${styleText("dim", `(${t2.hint})`)}` : ""}` : a2 === "cancelled" ? `${m(r2, (o) => styleText(["strikethrough", "dim"], o))}` : a2 === "active-selected" ? `${styleText("green", S_CHECKBOX_SELECTED)} ${r2}${t2.hint ? ` ${styleText("dim", `(${t2.hint})`)}` : ""}` : a2 === "submitted" ? `${m(r2, (o) => styleText("dim", o))}` : `${styleText("dim", S_CHECKBOX_INACTIVE)} ${m(r2, (o) => styleText("dim", o))}`;
  }, d = i2.required ?? true, v = i2.showInstructions ?? true;
  return new a({
    options: i2.options,
    signal: i2.signal,
    input: i2.input,
    output: i2.output,
    initialValues: i2.initialValues,
    required: d,
    cursorAt: i2.cursorAt,
    validate(t2) {
      if (d && (t2 === void 0 || t2.length === 0))
        return `Please select at least one option.
${styleText(
          "reset",
          styleText(
            "dim",
            `Press ${styleText(["gray", "bgWhite", "inverse"], " space ")} to select, ${styleText(
              "gray",
              styleText("bgWhite", styleText("inverse", " enter "))
            )} to submit`
          )
        )}`;
    },
    render() {
      const t2 = i2.withGuide ?? settings.withGuide, a2 = wrapTextWithPrefix(
        i2.output,
        i2.message,
        t2 ? `${symbolBar(this.state)}  ` : "",
        `${symbol(this.state)}  `
      ), r2 = `${t2 ? `${styleText("gray", S_BAR)}
` : ""}${a2}
`, o = this.value ?? [], p = (n2, l2) => {
        if (n2.disabled)
          return u3(n2, "disabled");
        const s = o.includes(n2.value);
        return l2 && s ? u3(n2, "active-selected") : s ? u3(n2, "selected") : u3(n2, l2 ? "active" : "inactive");
      };
      switch (this.state) {
        case "submit": {
          const n2 = this.options.filter(({ value: s }) => o.includes(s)).map((s) => u3(s, "submitted")).join(styleText("dim", ", ")) || styleText("dim", "none"), l2 = wrapTextWithPrefix(
            i2.output,
            n2,
            t2 ? `${styleText("gray", S_BAR)}  ` : ""
          );
          return `${r2}${l2}`;
        }
        case "cancel": {
          const n2 = this.options.filter(({ value: s }) => o.includes(s)).map((s) => u3(s, "cancelled")).join(styleText("dim", ", "));
          if (n2.trim() === "")
            return `${r2}${styleText("gray", S_BAR)}`;
          const l2 = wrapTextWithPrefix(
            i2.output,
            n2,
            t2 ? `${styleText("gray", S_BAR)}  ` : ""
          );
          return `${r2}${l2}${t2 ? `
${styleText("gray", S_BAR)}` : ""}`;
        }
        case "error": {
          const n2 = t2 ? `${styleText("yellow", S_BAR)}  ` : "", l2 = this.error.split(`
`).map(
            ($, C2) => C2 === 0 ? `${t2 ? `${styleText("yellow", S_BAR_END)}  ` : ""}${styleText("yellow", $)}` : `   ${$}`
          ).join(`
`), s = r2.split(`
`).length, h2 = l2.split(`
`).length + 1;
          return `${r2}${n2}${limitOptions({
            output: i2.output,
            options: this.options,
            cursor: this.cursor,
            maxItems: i2.maxItems,
            columnPadding: n2.length,
            rowPadding: s + h2,
            style: p
          }).join(`
${n2}`)}
${l2}
`;
        }
        default: {
          const n2 = t2 ? `${styleText("cyan", S_BAR)}  ` : "", l2 = r2.split(`
`).length, s = v ? formatInstructionFooter(MULTISELECT_INSTRUCTIONS, t2) : t2 ? [styleText("cyan", S_BAR_END)] : [], h2 = s.join(`
`), $ = s.length + 1;
          return `${r2}${n2}${limitOptions({
            output: i2.output,
            options: this.options,
            cursor: this.cursor,
            maxItems: i2.maxItems,
            columnPadding: n2.length,
            rowPadding: l2 + $,
            style: p
          }).join(`
${n2}`)}
${h2}
`;
        }
      }
    }
  }).prompt();
};
var log = {
  message: (s = [], {
    symbol: e = styleText("gray", S_BAR),
    secondarySymbol: r2 = styleText("gray", S_BAR),
    output: m2 = process.stdout,
    spacing: l2 = 1,
    withGuide: c
  } = {}) => {
    const t2 = [], o = c ?? settings.withGuide, f = o ? r2 : "", O = o ? `${e}  ` : "", u3 = o ? `${r2}  ` : "";
    for (let i2 = 0; i2 < l2; i2++)
      t2.push(f);
    const g = Array.isArray(s) ? s : s.split(`
`);
    if (g.length > 0) {
      const [i2, ...y] = g;
      i2.length > 0 ? t2.push(`${O}${i2}`) : t2.push(o ? e : "");
      for (const p of y)
        p.length > 0 ? t2.push(`${u3}${p}`) : t2.push(o ? r2 : "");
    }
    m2.write(`${t2.join(`
`)}
`);
  },
  info: (s, e) => {
    log.message(s, { ...e, symbol: styleText("blue", S_INFO) });
  },
  success: (s, e) => {
    log.message(s, { ...e, symbol: styleText("green", S_SUCCESS) });
  },
  step: (s, e) => {
    log.message(s, { ...e, symbol: styleText("green", S_STEP_SUBMIT) });
  },
  warn: (s, e) => {
    log.message(s, { ...e, symbol: styleText("yellow", S_WARN) });
  },
  /** alias for `log.warn()`. */
  warning: (s, e) => {
    log.warn(s, e);
  },
  error: (s, e) => {
    log.message(s, { ...e, symbol: styleText("red", S_ERROR) });
  }
};
var cancel = (o = "", t2) => {
  const i2 = process.stdout, e = `${styleText("gray", S_BAR_END)}  ` ;
  i2.write(`${e}${styleText("red", o)}

`);
};
var intro = (o = "", t2) => {
  const i2 = process.stdout, e = `${styleText("gray", S_BAR_START)}  ` ;
  i2.write(`${e}${o}
`);
};
var outro = (o = "", t2) => {
  const i2 = process.stdout, e = `${styleText("gray", S_BAR)}
${styleText("gray", S_BAR_END)}  ` ;
  i2.write(`${e}${o}

`);
};
var W$1 = (o) => o;
var C = (o, e, s) => {
  const a2 = {
    hard: true,
    trim: false
  }, i2 = wrapAnsi(o, e, a2).split(`
`), c = i2.reduce((n2, t2) => Math.max(dist_default2(t2), n2), 0), u3 = i2.map(s).reduce((n2, t2) => Math.max(dist_default2(t2), n2), 0), g = e - (u3 - c);
  return wrapAnsi(o, g, a2);
};
var note = (o = "", e = "", s) => {
  const a2 = process$1.stdout, c = W$1, g = ["", ...C(o, getColumns(a2) - 6, c).split(`
`).map(c), ""], n2 = dist_default2(e), t2 = Math.max(
    g.reduce((m2, F) => {
      const O = dist_default2(F);
      return O > m2 ? O : m2;
    }, 0),
    n2
  ) + 2, h2 = g.map(
    (m2) => `${styleText("gray", S_BAR)}  ${m2}${" ".repeat(t2 - dist_default2(m2))}${styleText("gray", S_BAR)}`
  ).join(`
`), T = `${styleText("gray", S_BAR)}
` , l$1 = S_CONNECT_LEFT ;
  a2.write(
    `${T}${styleText("green", S_STEP_SUBMIT)}  ${styleText("reset", e)} ${styleText(
      "gray",
      S_BAR_H.repeat(Math.max(t2 - n2 - 1, 1)) + S_CORNER_TOP_RIGHT
    )}
${h2}
${styleText("gray", l$1 + S_BAR_H.repeat(t2 + 2) + S_CORNER_BOTTOM_RIGHT)}
`
  );
};
var W = (l2) => styleText("magenta", l2);
var spinner = ({
  indicator: l2 = "dots",
  onCancel: h2,
  output: n2 = process.stdout,
  cancelMessage: G,
  errorMessage: O,
  frames: E = unicode ? ["\u25D2", "\u25D0", "\u25D3", "\u25D1"] : ["\u2022", "o", "O", "0"],
  delay: F = unicode ? 80 : 120,
  signal: m2,
  ...I2
} = {}) => {
  const u3 = isCI();
  let M, T, d = false, S = false, s = "", p, w = performance.now();
  const x = getColumns(n2), k = I2?.styleFrame ?? W, g = (e) => {
    const r2 = e > 1 ? O ?? settings.messages.error : G ?? settings.messages.cancel;
    S = e === 1, d && (a2(r2, e), S && typeof h2 == "function" && h2());
  }, f = () => g(2), i2 = () => g(1), A = () => {
    process.on("uncaughtExceptionMonitor", f), process.on("unhandledRejection", f), process.on("SIGINT", i2), process.on("SIGTERM", i2), process.on("exit", g), m2 && m2.addEventListener("abort", i2);
  }, H = () => {
    process.removeListener("uncaughtExceptionMonitor", f), process.removeListener("unhandledRejection", f), process.removeListener("SIGINT", i2), process.removeListener("SIGTERM", i2), process.removeListener("exit", g), m2 && m2.removeEventListener("abort", i2);
  }, y = () => {
    if (p === void 0) return;
    u3 && n2.write(`
`);
    const r2 = wrapAnsi(p, x, {
      hard: true,
      trim: false
    }).split(`
`);
    r2.length > 1 && n2.write(import_sisteransi2.cursor.up(r2.length - 1)), n2.write(import_sisteransi2.cursor.to(0)), n2.write(import_sisteransi2.erase.down());
  }, C2 = (e) => e.replace(/\.+$/, ""), _ = (e) => {
    const r2 = (performance.now() - e) / 1e3, t2 = Math.floor(r2 / 60), o = Math.floor(r2 % 60);
    return t2 > 0 ? `[${t2}m ${o}s]` : `[${o}s]`;
  }, N = I2.withGuide ?? settings.withGuide, P = (e = "") => {
    d = true, M = block({ output: n2 }), s = C2(e), w = performance.now(), N && n2.write(`${styleText("gray", S_BAR)}
`);
    let r2 = 0, t2 = 0;
    A(), T = setInterval(() => {
      if (u3 && s === p)
        return;
      y(), p = s;
      const o = k(E[r2]);
      let v;
      if (u3)
        v = `${o}  ${s}...`;
      else if (l2 === "timer")
        v = `${o}  ${s} ${_(w)}`;
      else {
        const B = ".".repeat(Math.floor(t2)).slice(0, 3);
        v = `${o}  ${s}${B}`;
      }
      const j = wrapAnsi(v, x, {
        hard: true,
        trim: false
      });
      n2.write(j), r2 = r2 + 1 < E.length ? r2 + 1 : 0, t2 = t2 < 4 ? t2 + 0.125 : 0;
    }, F);
  }, a2 = (e = "", r2 = 0, t2 = false) => {
    if (!d) return;
    d = false, clearInterval(T), y();
    const o = r2 === 0 ? styleText("green", S_STEP_SUBMIT) : r2 === 1 ? styleText("red", S_STEP_CANCEL) : styleText("red", S_STEP_ERROR);
    s = e ?? s, t2 || (l2 === "timer" ? n2.write(`${o}  ${s} ${_(w)}
`) : n2.write(`${o}  ${s}
`)), H(), M();
  };
  return {
    start: P,
    stop: (e = "") => a2(e, 0),
    message: (e = "") => {
      s = C2(e ?? s);
    },
    cancel: (e = "") => a2(e, 1),
    error: (e = "") => a2(e, 2),
    clear: () => a2("", 0, true),
    get isCancelled() {
      return S;
    }
  };
};
[
  `${styleText("dim", "\u2191/\u2193")} to navigate`,
  `${styleText("dim", "Enter:")} confirm`
];
`${styleText("gray", S_BAR)}  `;
var text = (e) => new n({
  validate: e.validate,
  placeholder: e.placeholder,
  defaultValue: e.defaultValue,
  initialValue: e.initialValue,
  output: e.output,
  signal: e.signal,
  input: e.input,
  render() {
    const i2 = e?.withGuide ?? settings.withGuide, s = `${`${i2 ? `${styleText("gray", S_BAR)}
` : ""}${symbol(this.state)}  `}${e.message}
`, c = e.placeholder && e.placeholder.length > 0 ? (
      // biome-ignore lint/style/noNonNullAssertion: guarded by placeholder.length > 0
      styleText("inverse", e.placeholder[0]) + styleText("dim", e.placeholder.slice(1))
    ) : styleText(["inverse", "hidden"], "_"), o = this.userInput ? this.userInputWithCursor : c, l2 = this.value ?? "";
    switch (this.state) {
      case "error": {
        const n2 = this.error ? `  ${styleText("yellow", this.error)}` : "", r2 = i2 ? `${styleText("yellow", S_BAR)}  ` : "", d = i2 ? styleText("yellow", S_BAR_END) : "";
        return `${s.trim()}
${r2}${o}
${d}${n2}
`;
      }
      case "submit": {
        const n2 = l2 ? `  ${styleText("dim", l2)}` : "", r2 = i2 ? styleText("gray", S_BAR) : "";
        return `${s}${r2}${n2}`;
      }
      case "cancel": {
        const n2 = l2 ? `  ${styleText(["strikethrough", "dim"], l2)}` : "", r2 = i2 ? styleText("gray", S_BAR) : "";
        return `${s}${r2}${n2}${l2.trim() ? `
${r2}` : ""}`;
      }
      default: {
        const n2 = i2 ? `${styleText("cyan", S_BAR)}  ` : "", r2 = i2 ? styleText("cyan", S_BAR_END) : "";
        return `${s}${n2}${o}
${r2}
`;
      }
    }
  }
}).prompt();

// src/cli/commands/init.ts
var import_picocolors = __toESM(require_picocolors());
var execFileAsync = promisify(execFile);
var run = async (command, args, options = {}) => {
  try {
    const { stdout: stdout2, stderr } = await execFileAsync(command, args, {
      cwd: options.cwd,
      maxBuffer: 64 * 1024 * 1024
    });
    return { code: 0, stdout: stdout2, stderr };
  } catch (error) {
    const failure = error;
    return {
      code: typeof failure.code === "number" ? failure.code : 1,
      stdout: failure.stdout ?? "",
      // A spawn failure (ENOENT etc.) carries empty stdio strings; the message is the signal.
      stderr: failure.stderr || failure.message || ""
    };
  }
};
var runShell = (script, options = {}, runner = run) => runner("/bin/sh", ["-c", script], options);

// src/cli/transforms.ts
function serviceNames(key) {
  const slug = `${key}-service`;
  const screaming = slug.toUpperCase().replaceAll("-", "_");
  const pascal = slug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join("");
  return { key, slug, screaming, pascal };
}
var TEMPLATE_NAME = "cookie-cutter-ui";
function rewritePackageJson(content, options) {
  const pkg = JSON.parse(content);
  pkg.name = options.name;
  pkg.description = `${options.title} \u2014 a NETIX frontend`;
  for (const field of ["dependencies", "devDependencies"]) {
    const deps = pkg[field];
    if (deps?.["netix-frontend"]) deps["netix-frontend"] = `github:${LIB_REPO}#${options.libRef}`;
  }
  return `${JSON.stringify(pkg, null, 2)}
`;
}
function rewriteIndexHtml(content, options) {
  return content.replace(/<title>.*<\/title>/, `<title>${options.title}</title>`);
}
function rewriteOrganizationLocale(content, options) {
  return content.replace(/application: '[^']*'/, `application: '${options.name}'`);
}
function rewriteDeployFile(content, options) {
  return content.replaceAll("app.netixai.dev", `${options.name}.${options.baseDomain}`).replaceAll("app-ui", options.name);
}
function deployRenames(options) {
  return {
    "app-ui-deployment.yaml": `${options.name}-deployment.yaml`,
    "app-ui-ingress.yaml": `${options.name}-ingress.yaml`
  };
}
var SERVICE_ENV_LINE = /^VITE_[A-Z_]+_SERVICE_BASE_URL=.*\n?/gm;
function rewriteEnv(content, options) {
  const withoutServices = content.replace(/^BASE_DOMAIN=.*$/m, `BASE_DOMAIN=${options.baseDomain}`).replace(SERVICE_ENV_LINE, "").trimEnd();
  const serviceLines = options.services.map((key) => {
    const service = options.manifest.services[key];
    if (!service) throw new Error(`unknown service: ${key}`);
    return `${service.envVar}=https://${service.apiSubdomain}.\${BASE_DOMAIN}`;
  });
  return `${[withoutServices, ...serviceLines].join("\n")}
`;
}
function buildEnvExample(envContent) {
  return envContent;
}
function rewriteViteEnv(content, options) {
  const lines = options.services.map((key) => options.manifest.services[key]?.envVar).filter(Boolean).map((envVar) => `  readonly ${envVar}: string`);
  const withoutServices = content.replace(
    /^ {2}readonly VITE_[A-Z_]+_SERVICE_BASE_URL: string\n/gm,
    ""
  );
  return withoutServices.replace(
    /^( {2}readonly VITE_DEV_MODE: string)$/m,
    [`$1`, ...lines].join("\n")
  );
}
function buildLocalDevUrls(options) {
  const lines = options.services.map((key) => {
    const service = options.manifest.services[key];
    if (!service) throw new Error(`unknown service: ${key}`);
    const { screaming } = serviceNames(key);
    return `export const LOCAL_DEV_${screaming}_BASE_URL = 'http://localhost:${service.localPort}/'`;
  });
  return [
    "/** Localhost fallback for local dev; prefer `VITE_*` env vars outside dev mode. */",
    ...lines,
    ""
  ].join("\n");
}
function buildServiceClient(dataClientContent, key) {
  const { slug, screaming, pascal } = serviceNames(key);
  return dataClientContent.replaceAll("data-service", slug).replaceAll("DATA_SERVICE", screaming).replaceAll("DataService", pascal);
}
var ORVAL_BLOCK = /^ {2}'data-service': \{[\s\S]*?\n {2}\},/m;
function rewriteOrvalConfig(content, options) {
  const match = content.match(ORVAL_BLOCK);
  if (!match) throw new Error("orval.config.ts: data-service block not found");
  const blocks = options.services.map((key) => buildServiceClient(match[0], key));
  return content.replace(ORVAL_BLOCK, blocks.join("\n"));
}
function rewriteComponentsJson(content, options) {
  const config = JSON.parse(content);
  config.registries = { ...config.registries, "@netix": options.registryUrl };
  return `${JSON.stringify(config, null, 2)}
`;
}
function rewriteDocs(content, options) {
  return content.replaceAll(TEMPLATE_NAME, options.name).replaceAll("frontend-template", options.name);
}
var DEMO_PAGES = ["profile", "permissions", "security", "support"];
var demoPagePattern = DEMO_PAGES.join("|");
function stripLazyBarrel(content) {
  const byLine = content.split("\n").filter((line) => !new RegExp(`/(${demoPagePattern})'`).test(line));
  return byLine.join("\n");
}
function stripRoutes(content) {
  const demoPath = new RegExp(`^\\s*path="/(?:${demoPagePattern})"`);
  const singleLine = new RegExp(`^\\s*<Route\\b.*path="/(?:${demoPagePattern})".*/>\\s*$`);
  const lines = content.split("\n");
  const kept = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    const opening = line.match(/^(\s*)<Route$/);
    if (opening && demoPath.test(lines[index + 1] ?? "")) {
      const closing = `${opening[1]}/>`;
      while (index < lines.length && lines[index] !== closing) index++;
      continue;
    }
    if (singleLine.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n");
}
function stripRouteImports(content) {
  const names = ["ProfilePage", "PermissionsPage", "SecurityPage", "SupportPage"];
  let result = content;
  for (const name of names) {
    result = result.replace(new RegExp(`^import .*\\b${name}\\b.*\\n`, "m"), "");
    result = result.replace(new RegExp(`\\s*${name},`, "g"), "");
  }
  return result;
}

// src/cli/scaffold.ts
var DEPLOY_FILES = [
  "docker-compose.yaml",
  "app-ui-deployment.yaml",
  "app-ui-ingress.yaml",
  ".github/workflows/docker-image-push.yaml"
];
var DOC_FILES = ["README.md", "CLAUDE.md", "AGENTS.md"];
function applyScaffoldTransforms(root, options) {
  const notes = [];
  const edit = (path, transform) => {
    const file = join(root, path);
    if (!existsSync(file)) {
      notes.push(`skipped ${path} (not in template)`);
      return false;
    }
    writeFileSync(file, transform(readFileSync(file, "utf8")));
    return true;
  };
  edit("package.json", (c) => rewritePackageJson(c, options));
  edit("index.html", (c) => rewriteIndexHtml(c, options));
  edit("app/lib/organization-locale.ts", (c) => rewriteOrganizationLocale(c, options));
  for (const path of DEPLOY_FILES) edit(path, (c) => rewriteDeployFile(c, options));
  for (const [from, to] of Object.entries(deployRenames(options)))
    if (existsSync(join(root, from))) renameSync(join(root, from), join(root, to));
  if (edit(".env", (c) => rewriteEnv(c, options))) {
    writeFileSync(
      join(root, ".env.example"),
      buildEnvExample(readFileSync(join(root, ".env"), "utf8"))
    );
    notes.push("wrote .env.example");
  }
  edit("orval.config.ts", (c) => rewriteOrvalConfig(c, options));
  edit("app/vite-env.d.ts", (c) => rewriteViteEnv(c, options));
  const dataClient = join(root, "app/client/http-data-service-client.ts");
  const dataClientTest = join(root, "app/client/http-data-service-client.test.ts");
  if (existsSync(dataClient)) {
    const clientSource = readFileSync(dataClient, "utf8");
    const testSource = existsSync(dataClientTest) ? readFileSync(dataClientTest, "utf8") : void 0;
    for (const key of options.services.filter((k) => k !== "data")) {
      const { slug } = serviceNames(key);
      writeFileSync(
        join(root, `app/client/http-${slug}-client.ts`),
        buildServiceClient(clientSource, key)
      );
      notes.push(`wired ${slug} client`);
    }
    if (!options.services.includes("data")) {
      const [first] = options.services;
      if (first && testSource) {
        const { slug } = serviceNames(first);
        writeFileSync(
          join(root, `app/client/http-${slug}-client.test.ts`),
          buildServiceClient(testSource, first)
        );
      }
      rmSync(dataClient);
      if (testSource) rmSync(dataClientTest);
      rmSync(join(root, "schema/data-service.yaml"), { force: true });
      notes.push("removed the data-service client (not selected)");
    }
    writeFileSync(join(root, "app/client/local-dev-urls.ts"), buildLocalDevUrls(options));
  }
  edit("components.json", (c) => rewriteComponentsJson(c, options));
  for (const path of DOC_FILES) edit(path, (c) => rewriteDocs(c, options));
  if (options.stripDemo) {
    for (const page of DEMO_PAGES) {
      rmSync(join(root, `app/pages/${page}.tsx`), { force: true });
      rmSync(join(root, `app/pages/${page}`), { recursive: true, force: true });
    }
    edit("app/pages/lazy.ts", stripLazyBarrel);
    edit("app/main.tsx", (c) => stripRouteImports(stripRoutes(c)));
    notes.push(`stripped demo pages: ${DEMO_PAGES.join(", ")}`);
  }
  return notes;
}
function loadManifest(url = new URL("../../services.json", import.meta.url)) {
  const manifest = JSON.parse(readFileSync(url, "utf8"));
  for (const [key, service] of Object.entries(manifest.services)) validateService(key, service);
  return manifest;
}
function validateService(key, service) {
  for (const field of ["backendRepo", "specPath", "envVar", "apiSubdomain"])
    if (!service[field]) throw new Error(`services.json: ${key} is missing ${field}`);
  if (!Number.isInteger(service.localPort))
    throw new Error(`services.json: ${key} has no localPort`);
}
var COPY_EXCLUDES = /* @__PURE__ */ new Set([".git", "node_modules", "dist", "coverage"]);
async function acquireTemplate({ dest, ref, templatePath, runner = run }) {
  mkdirSync(dest, { recursive: true });
  if (templatePath) {
    if (!existsSync(templatePath)) throw new Error(`template path not found: ${templatePath}`);
    cpSync(templatePath, dest, {
      recursive: true,
      filter: (source) => !COPY_EXCLUDES.has(basename(source))
    });
    return { source: templatePath };
  }
  const gh = await runner("/bin/sh", ["-c", "command -v gh"]);
  if (gh.code !== 0)
    throw new Error(
      `the GitHub CLI (gh) is required to download ${TEMPLATE_REPO} (a private repo).
Install it and run \`gh auth login\`, or pass --template-path <local checkout>.`
    );
  const auth = await runner("gh", ["auth", "status"]);
  if (auth.code !== 0)
    throw new Error("gh is installed but not authenticated \u2014 run `gh auth login` first.");
  const tarball = await runShell(
    `gh api repos/${TEMPLATE_REPO}/tarball/${ref} | tar -xz --strip-components=1 -C '${dest}'`,
    {},
    runner
  );
  if (tarball.code !== 0)
    throw new Error(`downloading ${TEMPLATE_REPO}@${ref} failed:
${tarball.stderr}`);
  return { source: `${TEMPLATE_REPO}@${ref}` };
}
async function checkTemplateAvailable({
  ref,
  templatePath,
  runner = run
}) {
  if (templatePath)
    return existsSync(templatePath) ? void 0 : `template path not found: ${templatePath}`;
  if ((await runner("/bin/sh", ["-c", "command -v gh"])).code !== 0)
    return `the GitHub CLI (gh) is required to download ${TEMPLATE_REPO} (a private repo).
Install it and run \`gh auth login\`, or pass --template-path <local checkout>.`;
  if ((await runner("gh", ["auth", "status"])).code !== 0)
    return "gh is installed but not authenticated \u2014 run `gh auth login` first.";
  if ((await runner("gh", ["api", `repos/${TEMPLATE_REPO}/commits/${ref}`, "--silent"])).code !== 0)
    return `${TEMPLATE_REPO}@${ref} is not reachable \u2014 the ref may not exist yet, or you may not have access.
Pass --template-ref <existing ref> or --template-path <local checkout>.`;
  return void 0;
}
var STALE_AFTER_DAYS = 90;
var DAY_MS = 24 * 60 * 60 * 1e3;
function detectServices(cwd, manifest) {
  const dir = join(cwd, "schema");
  if (!existsSync(dir)) return [];
  const known = Object.keys(manifest.services);
  return readdirSync(dir).map((file) => file.replace(/-service\.ya?ml$/, "")).filter((key, index, all) => known.includes(key) && all.indexOf(key) === index);
}
async function schemaPull({
  cwd,
  manifest,
  services = [],
  dryRun = false,
  runner = run,
  log: log2 = () => {
  },
  now = Date.now
}) {
  const keys = services.length ? services : detectServices(cwd, manifest);
  const result = { pulled: [], warnings: [], failures: [] };
  if (!keys.length) {
    result.warnings.push("no services selected and none detected under schema/");
    return result;
  }
  for (const key of keys) {
    const service = manifest.services[key];
    if (!service) {
      result.failures.push(`${key}: unknown service (not in services.json)`);
      continue;
    }
    const target = `schema/${serviceNames(key).slug}.yaml`;
    if (dryRun) {
      log2(`${key}: would pull ${service.backendRepo}/${service.specPath} \u2192 ${target}`);
      result.pulled.push(key);
      continue;
    }
    const spec = await runner("gh", [
      "api",
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${service.backendRepo}/contents/${service.specPath}`
    ]);
    if (spec.code !== 0 || !spec.stdout.trim()) {
      result.failures.push(`${key}: fetching ${service.backendRepo}/${service.specPath} failed`);
      continue;
    }
    mkdirSync(join(cwd, "schema"), { recursive: true });
    writeFileSync(join(cwd, target), spec.stdout);
    result.pulled.push(key);
    log2(`${key}: pulled ${service.backendRepo}/${service.specPath} \u2192 ${target}`);
    const commit = await runner("gh", [
      "api",
      `repos/${service.backendRepo}/commits?path=${service.specPath}&per_page=1`,
      "--jq",
      ".[0].commit.committer.date"
    ]);
    const date = Date.parse(commit.stdout.trim());
    if (commit.code === 0 && !Number.isNaN(date)) {
      const ageDays = Math.floor((now() - date) / DAY_MS);
      if (ageDays > STALE_AFTER_DAYS)
        result.warnings.push(
          `${key}: spec last touched ${ageDays} days ago \u2014 the backend snapshot may be stale`
        );
    }
  }
  return result;
}

// src/cli/commands/init.ts
var KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
var DEFAULT_BASE_DOMAIN = "netixai.dev";
var bail = (value) => {
  cancel("init cancelled");
  process.exit(1);
  throw value;
};
var answer = (value) => isCancel(value) ? bail(value) : value;
async function init(flags, runner = run) {
  const manifest = loadManifest();
  const serviceKeys = Object.keys(manifest.services);
  intro(import_picocolors.default.inverse(" netix init "));
  const unreachable = await checkTemplateAvailable({
    ref: flags.templateRef ?? TEMPLATE_REF,
    templatePath: flags.templatePath,
    runner
  });
  if (unreachable) return fail(unreachable);
  const dir = flags.dir ?? (flags.yes ? void 0 : answer(
    await text({
      message: "Where should the app be created?",
      placeholder: "./my-app-ui",
      validate: (value) => value?.trim() ? void 0 : "enter a directory"
    })
  ));
  if (!dir) return fail("a target directory is required (pass one or drop --yes)");
  const dest = resolve(dir);
  if (existsSync(dest) && readdirSync(dest).length > 0)
    return fail(`${dest} already exists and is not empty`);
  const defaultName = basename(dest).toLowerCase();
  const name = flags.name ?? (flags.yes ? defaultName : answer(
    await text({
      message: "App name (kebab-case; also the deploy identity)",
      placeholder: defaultName,
      defaultValue: defaultName,
      validate: (value) => !value || KEBAB.test(value) ? void 0 : "use kebab-case"
    })
  ));
  if (!KEBAB.test(name)) return fail(`app name must be kebab-case, got "${name}"`);
  const title = flags.title ?? (flags.yes ? titleCase(name) : answer(
    await text({
      message: "Display title",
      placeholder: titleCase(name),
      defaultValue: titleCase(name)
    })
  ));
  const baseDomain = flags.baseDomain ?? (flags.yes ? DEFAULT_BASE_DOMAIN : answer(
    await text({
      message: "Base domain",
      placeholder: DEFAULT_BASE_DOMAIN,
      defaultValue: DEFAULT_BASE_DOMAIN
    })
  ));
  const services = flags.services ? flags.services.split(",").map((s) => s.trim()).filter(Boolean) : flags.yes ? ["data"] : answer(
    await multiselect({
      message: "Which services should this app talk to?",
      options: serviceKeys.map((key) => ({
        value: key,
        label: manifest.services[key]?.title ?? key,
        hint: manifest.services[key]?.backendRepo
      })),
      initialValues: ["data"],
      required: false
    })
  );
  const unknown = services.filter((key) => !serviceKeys.includes(key));
  if (unknown.length) return fail(`unknown services: ${unknown.join(", ")}`);
  const stripDemo = flags.stripDemo ?? (flags.yes ? false : answer(await confirm({ message: "Strip the demo pages?", initialValue: false })));
  const spinner2 = spinner();
  spinner2.start(
    `Fetching template (${flags.templatePath ?? `${flags.templateRef ?? TEMPLATE_REF}`})`
  );
  try {
    const { source } = await acquireTemplate({
      dest,
      ref: flags.templateRef ?? TEMPLATE_REF,
      templatePath: flags.templatePath,
      runner
    });
    spinner2.stop(`Template ready (${source})`);
  } catch (error) {
    spinner2.stop("Template fetch failed");
    return fail(error instanceof Error ? error.message : String(error));
  }
  const options = {
    name,
    title,
    baseDomain,
    services,
    manifest,
    libRef: LIB_REF,
    registryUrl: REGISTRY_URL,
    stripDemo
  };
  const notes = applyScaffoldTransforms(dest, options);
  for (const note2 of notes) log.info(note2);
  const steps = [
    [
      "git init",
      flags.git !== false,
      async () => (await runner("git", ["init", "-q"], { cwd: dest })).code === 0 && (await runner("git", ["add", "-A"], { cwd: dest })).code === 0 && (await runner("git", ["commit", "-q", "-m", `chore: scaffold ${name} with netix init`], {
        cwd: dest
      })).code === 0
    ],
    [
      "pnpm install",
      flags.install !== false,
      async () => (await runner("pnpm", ["install"], { cwd: dest })).code === 0
    ],
    [
      "schema pull",
      flags.schemas !== false && services.length > 0,
      async () => {
        const result = await schemaPull({ cwd: dest, manifest, services, runner, log: log.info });
        for (const warning of result.warnings) log.warn(warning);
        for (const failure of result.failures) log.error(failure);
        return result.failures.length === 0;
      }
    ],
    [
      "pnpm generate:client",
      flags.generate !== false && flags.install !== false && services.length > 0,
      async () => (await runner("pnpm", ["generate:client"], { cwd: dest })).code === 0
    ]
  ];
  const skipped = [];
  const failed = [];
  for (const [label, enabled, action] of steps) {
    if (!enabled) {
      skipped.push(label);
      continue;
    }
    const step = spinner();
    step.start(label);
    const ok = await action().catch(() => false);
    step.stop(ok ? label : `${label} ${import_picocolors.default.red("failed")}`);
    if (!ok) failed.push(label);
  }
  if (skipped.length) log.info(`skipped: ${skipped.join(", ")}`);
  if (failed.length) log.warn(`finish manually: ${failed.join(", ")}`);
  note(
    [
      `cd ${dir}`,
      ...failed.includes("pnpm install") || flags.install === false ? ["pnpm install"] : [],
      "pnpm dev",
      "",
      "Add components:  npx netix add data-table",
      "Refresh schemas: npx netix schema pull"
    ].join("\n"),
    "Next steps"
  );
  outro(`${import_picocolors.default.green("\u2714")} ${name} is ready`);
  return 0;
  function fail(message) {
    log.error(message);
    outro(import_picocolors.default.red("init failed"));
    return 1;
  }
}
var titleCase = (kebab) => kebab.replace(/-(ui|app|frontend)$/, "").split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");

// src/cli/index.ts
var HELP = `${import_picocolors2.default.bold("netix")} \u2014 scaffold and maintain NETIX frontend apps

Usage:
  netix init [dir] [options]     Create a new app from frontend-template
  netix add <item...>            Copy @netix registry items into this app (shadcn under the hood)
  netix schema pull [service...] Refresh OpenAPI specs from the backend repos (needs gh)

init options:
  --name <kebab>        App + deploy identity (default: directory name)
  --title <text>        Display title
  --base-domain <host>  Deploy domain (default: netixai.dev)
  --services <a,b>      Service keys to wire (see services.json), e.g. data,cafm
  --strip-demo          Remove the demo pages
  --template-path <p>   Scaffold from a local template checkout instead of GitHub
  --template-ref <ref>  Template git ref to download
  --no-git | --no-install | --no-schemas | --no-generate
  --yes                 Accept defaults, no prompts

schema pull options:
  --dry-run             Show what would be fetched

netix add passes extra flags through to shadcn (e.g. --overwrite).
`;
var version = () => JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")).version;
async function main(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(HELP);
    return 0;
  }
  if (command === "--version" || command === "-v") {
    process.stdout.write(`${version()}
`);
    return 0;
  }
  if (command === "init") {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: {
        name: { type: "string" },
        title: { type: "string" },
        "base-domain": { type: "string" },
        services: { type: "string" },
        "strip-demo": { type: "boolean" },
        "template-path": { type: "string" },
        "template-ref": { type: "string" },
        yes: { type: "boolean" },
        "no-git": { type: "boolean" },
        "no-install": { type: "boolean" },
        "no-schemas": { type: "boolean" },
        "no-generate": { type: "boolean" }
      }
    });
    return init({
      dir: positionals[0],
      name: values.name,
      title: values.title,
      baseDomain: values["base-domain"],
      services: values.services,
      stripDemo: values["strip-demo"],
      templatePath: values["template-path"],
      templateRef: values["template-ref"],
      yes: values.yes,
      git: !values["no-git"],
      install: !values["no-install"],
      schemas: !values["no-schemas"],
      generate: !values["no-generate"]
    });
  }
  if (command === "add") {
    if (!rest.length) {
      process.stderr.write("netix add: name at least one registry item\n");
      return 1;
    }
    const items = rest.filter((arg) => !arg.startsWith("-"));
    const passthrough = rest.filter((arg) => arg.startsWith("-"));
    return addItems(items, passthrough);
  }
  if (command === "schema" && rest[0] === "pull") {
    const { values, positionals } = parseArgs({
      args: rest.slice(1),
      allowPositionals: true,
      options: { "dry-run": { type: "boolean" } }
    });
    const result = await schemaPull({
      cwd: process.cwd(),
      manifest: loadManifest(),
      services: positionals,
      dryRun: values["dry-run"],
      log: (line) => process.stdout.write(`${line}
`)
    });
    for (const warning of result.warnings) process.stderr.write(`${import_picocolors2.default.yellow("warn")} ${warning}
`);
    for (const failure of result.failures) process.stderr.write(`${import_picocolors2.default.red("fail")} ${failure}
`);
    return result.failures.length ? 1 : 0;
  }
  process.stderr.write(`unknown command: ${command}

${HELP}`);
  return 1;
}
var invokedAsBin = process.argv[1]?.endsWith("cli/index.js");
if (invokedAsBin) main(process.argv.slice(2)).then((code) => process.exit(code));

export { main };
