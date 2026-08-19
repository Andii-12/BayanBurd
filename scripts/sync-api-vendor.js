const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function copyPackage(name) {
  const from = path.join(root, "packages", name);
  const to = path.join(root, "apps", "api", "vendor", name);
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, {
    recursive: true,
    filter: (src) => !src.split(path.sep).includes("dist") && !src.split(path.sep).includes("node_modules"),
  });
}

copyPackage("types");
copyPackage("validation");
console.log("Synced apps/api/vendor from packages/");
