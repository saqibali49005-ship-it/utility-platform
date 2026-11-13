import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../tools-data.js", import.meta.url), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "tools-data.js" });

const tools = sandbox.window.UTILITY_TOOLS;
const categories = sandbox.window.UTILITY_CATEGORIES;

assert.ok(Array.isArray(tools), "UTILITY_TOOLS must be an array");
assert.ok(Array.isArray(categories), "UTILITY_CATEGORIES must be an array");
assert.equal(tools.length, 20, "Expected the current 20-tool catalog");

const slugSet = new Set();
const hrefSet = new Set();
const categoryIds = new Set(categories.map((category) => category.id));

for (const [index, tool] of tools.entries()) {
  assert.ok(tool && typeof tool === "object", `Tool at index ${index} must be an object`);
  assert.match(tool.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid stable slug: ${tool.slug}`);
  assert.ok(!slugSet.has(tool.slug), `Duplicate stable slug: ${tool.slug}`);
  slugSet.add(tool.slug);

  assert.equal(tool.access, "public", `${tool.slug} must remain publicly accessible in this phase`);
  assert.equal(tool.execution, "browser", `${tool.slug} must retain browser execution metadata`);
  assert.equal(tool.contractVersion, 1, `${tool.slug} must declare catalog contract version 1`);

  assert.ok(typeof tool.title === "string" && tool.title.trim(), `${tool.slug} needs a title`);
  assert.ok(typeof tool.description === "string" && tool.description.trim(), `${tool.slug} needs a description`);
  assert.ok(typeof tool.href === "string" && tool.href.endsWith("/"), `${tool.slug} needs a clean trailing-slash URL`);
  assert.ok(!tool.href.startsWith("/") && !tool.href.includes(".html"), `${tool.slug} URL must preserve the relative clean-URL convention`);
  assert.ok(!hrefSet.has(tool.href), `Duplicate tool URL: ${tool.href}`);
  hrefSet.add(tool.href);

  assert.ok(categoryIds.has(tool.category), `${tool.slug} references an unknown category: ${tool.category}`);
  assert.ok(Array.isArray(tool.keywords), `${tool.slug} keywords must remain an array`);
  assert.ok(Number.isFinite(tool.addedOrder), `${tool.slug} needs a numeric addedOrder`);
}

console.log(`PASS: ${tools.length} tools satisfy the future-ready public catalog contract.`);
console.log("PASS: slugs and URLs are unique; categories, metadata, and clean URLs are valid.");
console.log("PASS: no login, billing, subscription, paywall, or API implementation was introduced by this contract.");
