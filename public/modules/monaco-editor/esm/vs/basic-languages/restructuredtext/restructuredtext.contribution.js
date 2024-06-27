/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.48.0(b400f83fe3ac6a1780b7eed419dc4d83dbf32919)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/


// src/basic-languages/restructuredtext/restructuredtext.contribution.ts
import { registerLanguage } from "../_.contribution.js";
registerLanguage({
  id: "restructuredtext",
  extensions: [".rst"],
  aliases: ["reStructuredText", "restructuredtext"],
  loader: () => {
    if (false) {
      return new Promise((resolve, reject) => {
        __require(["vs/basic-languages/restructuredtext/restructuredtext"], resolve, reject);
      });
    } else {
      return import("./restructuredtext.js");
    }
  }
});
