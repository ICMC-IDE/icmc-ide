import * as monaco from "monaco-editor";

monaco.languages.register({
  id: "asm",
  extensions: [".asm"],
  aliases: ["ASM", "asm"],
  mimetypes: ["text/x-asm"],
});

monaco.languages.setLanguageConfiguration("asm", {
  comments: {
    lineComment: ";",
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
});

monaco.languages.setMonarchTokensProvider("asm", {
  defaultToken: "",
  tokenPostfix: ".asm",
  // Set defaultToken to invalid to see what you do not tokenize yet
  // defaultToken: 'invalid',
  operators: ["@", "+", "-", "*", "/", "=>"],
  // we include these common regular expressions
  symbols: /[@*+-/>=<()]+/,
  // C# style strings
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
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
      [/[{}()[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [
        /@symbols/,
        {
          cases: {
            "@operators": "operator",
            "@default": "",
          },
        },
      ],
      // numbers
      [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
      [/0[xX][0-9a-fA-F]+/, "number.hex"],
      [/0[bB][01]+/, "number.bin"],
      [/0[oO][0-7]+/, "number.oct"],
      [/\d+/, "number"],
      // delimiter: after number because of .\d floats
      [/[;,.]/, "delimiter"],
      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
    ],
    comment: [],
    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],
    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/;.*$/, "comment"],
    ],
    label: [[/^\s*[\w.]+\s*:/, "number"]],
    command: [[/^\s*#[a-zA-Z_][\w]*/, { token: "annotation" }]],
    instruction: [[/^\s*[a-zA-Z_]\w*(\.\w+)?/, { token: "keyword" }]],
  },
});
