// import assets from "/assets/assets.json" assert { type: "json" };

async function fetchText(path: string) {
  const response = await fetch(path);
  return await response.text();
}

export async function fetchAssets() {
  const response = await fetch("/assets/assets.json");

  const entries = ((await response.json()) as Array<string>).reduce(
    (acc, filename) => {
      // Refactor FS to store json objects

      // const extension = filename.split(".").at(-1);
      const path = `/assets/${filename}`;

      acc.keys.push(filename);

      // if (extension === "json") {
      //   acc.values.push(fetchJson(path));
      // } else {
      //   acc.values.push(fetchText(path));
      // }

      acc.values.push(fetchText(path));

      return acc;
    },
    <{ keys: Array<string>; values: Array<any> }>{ keys: [], values: [] },
  );
  const results = await Promise.all(entries.values);

  return entries.keys.reduce(
    (obj, key, index) => ((obj[key] = results[index]), obj),
    <{ [index: string]: any }>{},
  );
}
