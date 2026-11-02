const fs = require('fs');
const path = require('path');

const INCLUDE_RE = /^(\s*)<!--\s*@include\s+([^\s>]+)\s*-->\s*$/;
const PARTIAL_RE = /^(\s*)<div\s+data-partial="([^"]+)"\s*>\s*<\/div>\s*$/;
const LOADER_RE = /^\s*<script\s+src="js\/Drop\/partials-loader\.js"\s*>\s*<\/script>\s*$/;

function indentBlock(content, indent) {
  if (!indent) {
    return content;
  }

  return content
    .split('\n')
    .map((line) => (line.length ? `${indent}${line}` : line))
    .join('\n');
}

function readPartial(partialPath, stack, rootDir) {
  if (!fs.existsSync(partialPath)) {
    throw new Error(`Partial not found: ${partialPath}`);
  }

  if (stack.includes(partialPath)) {
    throw new Error(`Circular include detected: ${[...stack, partialPath].join(' -> ')}`);
  }

  return assembleFile(partialPath, path.dirname(partialPath), [...stack, partialPath], rootDir);
}

function assembleContent(content, baseDir, stack = [], rootDir = baseDir) {
  const lines = content.split('\n');
  const output = [];

  for (const line of lines) {
    if (LOADER_RE.test(line)) {
      continue;
    }

    const includeMatch = line.match(INCLUDE_RE);

    if (includeMatch) {
      const [, indent, relativePath] = includeMatch;
      const partialPath = path.resolve(baseDir, relativePath);
      output.push(indentBlock(readPartial(partialPath, stack, rootDir), indent));
      continue;
    }

    const partialMatch = line.match(PARTIAL_RE);

    if (partialMatch) {
      const [, indent, name] = partialMatch;
      const partialPath = path.resolve(rootDir, 'partials', `${name}.html`);
      output.push(indentBlock(readPartial(partialPath, stack, rootDir), indent));
      continue;
    }

    output.push(line);
  }

  return output.join('\n');
}

function assembleFile(filePath, baseDir, stack = [], rootDir = baseDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  return assembleContent(content, baseDir, stack, rootDir);
}

function assembleHtmlFiles({ sourceDir, outputDir, files = [] }) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlFiles = files.length
    ? files
    : fs.readdirSync(sourceDir).filter((file) => file.endsWith('.html'));

  htmlFiles.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file);
    const assembled = assembleFile(sourcePath, sourceDir);
    fs.writeFileSync(outputPath, assembled, 'utf8');
  });
}

module.exports = {
  assembleContent,
  assembleFile,
  assembleHtmlFiles,
};
