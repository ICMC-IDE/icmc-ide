/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.48.0(b400f83fe3ac6a1780b7eed419dc4d83dbf32919)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/
define("vs/basic-languages/asm/asm", ["require"],(require)=>{
"use strict";
var moduleExports = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/basic-languages/asm/asm.ts
  var asm_exports = {};
  __export(asm_exports, {
    conf: () => conf,
    language: () => language
  });
  var conf = {
    comments: {
      lineComment: ";"
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"]
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' }
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' }
    ]
    // folding: {
    // markers: {
    // start: new RegExp('^\\s*//\\s*(?:(?:#?region\\b)|(?:<editor-fold\\b))'),
    // end: new RegExp('^\\s*//\\s*(?:(?:#?endregion\\b)|(?:</editor-fold>))')
    // }
    // }
  };
  var language = {
    defaultToken: "",
    tokenPostfix: ".asm",
    // Set defaultToken to invalid to see what you do not tokenize yet
    // defaultToken: 'invalid',
    operators: ["@", "+", "-", "*", "/", "=>"],
    // we include these common regular expressions
    symbols: /[@*+-\/>=<()]+/,
    // C# style strings
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    // The main tokenizer for our languages
    tokenizer: {
      root: [
        { include: "@label" },
        { include: "@instruction" },
        { include: "@command" },
        { include: "@whitespace" },
        [/r[0-7]|fr|sp/, "type"],
        [/[uis]\d+/, "type"],
        [/[a-z_$][\w]*/i, "identifier"],
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [/@symbols/, { cases: {
          "@operators": "operator",
          "@default": ""
        } }],
        // numbers
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/0[bB][01]+/, "number.bin"],
        [/0[oO][0-7]+/, "number.oct"],
        [/\d+/, "number"],
        // delimiter: after number because of .\d floats
        [/[;,.]/, "delimiter"],
        // strings
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        // non-teminated string
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }]
      ],
      comment: [],
      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }]
      ],
      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/;.*$/, "comment"]
      ],
      label: [
        [/^\s*[\w.]+\s*:/, "number"]
      ],
      command: [
        [/^\s*#[a-zA-Z_][\w]*/, { token: "annotation" }]
      ],
      instruction: [
        [/^\s*[a-zA-Z_]\w*(\.\w+)?/, { token: "keyword" }]
      ]
    }
  };
  return __toCommonJS(asm_exports);
})();
return moduleExports;
});
