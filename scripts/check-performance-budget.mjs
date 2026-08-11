import { gzipSync } from "node:zlib";
import { readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { PERFORMANCE_BUDGET } from "./performance-budget.config.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const distDirectory = join(projectRoot, "dist");
const htmlPath = join(distDirectory, "index.html");
const html = readFileSync(htmlPath, "utf8");
const assetReferences = [...html.matchAll(/(?:src|href)="\/(assets\/[^"?]+\.js)"/g)].map((match) => match[1]);
const uniqueAssets = [...new Set(assetReferences)];

if (uniqueAssets.length === 0) {
  throw new Error("No initial JavaScript assets were found in dist/index.html.");
}

const assets = uniqueAssets.map((assetReference) => {
  const absolutePath = join(distDirectory, assetReference);
  const contents = readFileSync(absolutePath);

  return {
    asset: assetReference,
    rawBytes: statSync(absolutePath).size,
    gzipBytes: gzipSync(contents).length,
  };
});

const totalGzipBytes = assets.reduce((total, asset) => total + asset.gzipBytes, 0);
const formatKilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

console.log(`Initial JavaScript gzip total: ${formatKilobytes(totalGzipBytes)}`);
console.log(`Budget: ${formatKilobytes(PERFORMANCE_BUDGET.initialJavaScriptGzipBytes)}`);
console.table(
  [...assets]
    .sort((left, right) => right.gzipBytes - left.gzipBytes)
    .slice(0, PERFORMANCE_BUDGET.reportTopAssets)
    .map(({ asset, rawBytes, gzipBytes }) => ({
      asset,
      raw: formatKilobytes(rawBytes),
      gzip: formatKilobytes(gzipBytes),
    })),
);

if (totalGzipBytes > PERFORMANCE_BUDGET.initialJavaScriptGzipBytes) {
  throw new Error(
    `Initial JavaScript gzip total ${formatKilobytes(totalGzipBytes)} exceeds the configured budget of ${formatKilobytes(PERFORMANCE_BUDGET.initialJavaScriptGzipBytes)}.`,
  );
}
