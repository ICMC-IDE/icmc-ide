/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.48.0(b400f83fe3ac6a1780b7eed419dc4d83dbf32919)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/


// src/basic-languages/mdx/mdx.contribution.ts
import { registerLanguage } from "../_.contribution.js";
registerLanguage({
  id: "mdx",
  extensions: [".mdx"],
  aliases: ["MDX", "mdx"],
  loader: () => {
    if (false) {
      return new Promise((resolve, reject) => {
        __require(["vs/basic-languages/mdx/mdx"], resolve, reject);
      });
    } else {
      return import("./mdx.js");
    }
  }
});
