import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const catalogSource = readFileSync(path.join(root, "tools-data.js"), "utf8");
const catalogSandbox = { window: {} };
vm.runInNewContext(catalogSource, catalogSandbox, { filename: "tools-data.js" });
const catalog = catalogSandbox.window.UTILITY_TOOLS;
const manifest = JSON.parse(readFileSync(path.join(root, "tool-engine-manifest.json"), "utf8"));

assert.equal(manifest.schemaVersion, 1, "Engine manifest schemaVersion must be 1");
assert.equal(manifest.runtime, "browser", "Current tool execution must remain browser-based");
assert.equal(manifest.authorization, "none", "Manifest must not be used for authorization");
assert.ok(Array.isArray(catalog), "Tool catalog must be available");
assert.ok(Array.isArray(manifest.tools), "Engine manifest tools must be an array");
assert.equal(manifest.tools.length, catalog.length, "Manifest must cover every catalog tool");

const catalogSlugs = new Set(catalog.map(tool => tool.slug));
const manifestSlugs = new Set();
const modulePaths = new Set();

for (const entry of manifest.tools) {
  assert.ok(catalogSlugs.has(entry.slug), `Manifest contains unknown tool slug: ${entry.slug}`);
  assert.ok(!manifestSlugs.has(entry.slug), `Duplicate manifest tool slug: ${entry.slug}`);
  manifestSlugs.add(entry.slug);

  assert.ok(
    entry.implementation === "shared-module" || entry.implementation === "page-adapter",
    `${entry.slug} has an unsupported implementation status`
  );

  if (entry.implementation === "shared-module") {
    assert.match(entry.modulePath, /^\/[a-z0-9-]+-engine\.js$/, `${entry.slug} must reference a root engine module`);
    assert.match(entry.browserGlobal, /^ZemTools[A-Za-z0-9]+Engine$/, `${entry.slug} must name its browser engine global`);
    assert.ok(!modulePaths.has(entry.modulePath), `Duplicate engine module path: ${entry.modulePath}`);
    modulePaths.add(entry.modulePath);
    assert.ok(existsSync(path.join(root, entry.modulePath.slice(1))), `Missing engine module: ${entry.modulePath}`);
  } else {
    assert.ok(!entry.modulePath && !entry.browserGlobal, `${entry.slug} page adapter must not claim an extracted module`);
  }
}

for (const tool of catalog) {
  assert.ok(manifestSlugs.has(tool.slug), `Catalog tool missing from engine manifest: ${tool.slug}`);
}
assert.equal(modulePaths.size, 3, "Expected the three completed reusable engine pilots");

console.log(`PASS: engine manifest covers all ${catalog.length} catalog tools.`);
console.log(`PASS: ${modulePaths.size} shared calculation modules exist; remaining tools are explicitly marked page-adapter.`);
console.log("PASS: manifest is descriptive only and does not enable authentication, billing, subscriptions, or API access.");
