import * as monaco from "monaco-editor";

monaco.languages.register({
  id: "mif",
  extensions: [".mif"],
  aliases: ["MIF", "mif"],
  mimetypes: ["application/x-mif"],
});

monaco.languages.setLanguageConfiguration("mif", {
  comments: {
    lineComment: "--",
    blockComment: ["%", "%"],
  },
  brackets: [["[", "]"]],
  autoClosingPairs: [
    { open: "[", close: "]" },
    { open: "%", close: "%" },
  ],
  surroundingPairs: [
    { open: "[", close: "]" },
    { open: "%", close: "%" },
  ],
});

monaco.languages.setMonarchTokensProvider("mif", {
  defaultToken: "",
  tokenPostfix: ".mif",
  keywords: [
    "CONTENT",
    "BEGIN",
    "WIDTH",
    "DEPTH",
    "ADDRESS_RADIX",
    "DATA_RADIX",
    "END",
  ],

  operators: ["..", ":", "=", ";"],

  // we include these common regular expressions
  symbols: /[.:=;]+/,
  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // numbers
      [/\b[\dA-Fa-f]+\b/, "number"],

      // identifiers and keywords
      [
        /[A-Za-z_][\w]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/[[\]]/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
    ],

    comment: [
      [/[^%]*/, "comment"],
      ["%", "comment"],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      ["%", "comment", "@comment"],
      [/--.*$/, "comment"],
    ],
  },
});
