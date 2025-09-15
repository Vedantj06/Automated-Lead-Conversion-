// fix-imports.js
import fs from "fs";
import path from "path";

const srcDir = path.resolve("./src");

// Recursively walk through all files in src
function walk(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      walk(fullPath, callback);
    } else if (/\.(ts|tsx|js|jsx)$/.test(dirent.name)) {
      callback(fullPath);
    }
  });
}

// Normalize imports
function fixImports(file) {
  let content = fs.readFileSync(file, "utf-8");
  let changed = false;

  content = content.replace(/@\/components\/ui\/Badge/g, "@/components/ui/badge");
  content = content.replace(/@\/components\/ui\/Separator/g, "@/components/ui/separator");
  content = content.replace(/@\/lib\/EmailService/g, "@/lib/email-service");
  content = content.replace(/@\/lib\/Utils/g, "@/lib/utils");

  if (content !== fs.readFileSync(file, "utf-8")) {
    fs.writeFileSync(file, content, "utf-8");
    console.log(`✅ Fixed imports in: ${file}`);
    changed = true;
  }

  return changed;
}

// Run the fixer
let fixedFiles = 0;
walk(srcDir, (file) => {
  if (fixImports(file)) fixedFiles++;
});

console.log(`\n🎉 Done! Fixed imports in ${fixedFiles} files.`);
