async function fetchJson(path: string) {
  const response = await fetch(path);
  return await response.json();
}

async function fetchText(path: string) {
  const response = await fetch(path);
  return await response.text();
}

export async function fetchAssets() {
  const assets = (await fetchJson("../assets/assets.json")) as Array<string>;
  const entries = assets.reduce(
    (acc, filename) => {
      // Refactor FS to store json objects

      // const extension = filename.split(".").at(-1);
      const path = `../assets/${filename}`;

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
