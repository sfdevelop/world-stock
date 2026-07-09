const fs = require('fs');
const path = require('path');

const INCLUDE_RE = /^(\s*)<!--\s*@include\s+([^\s>]+)\s*-->\s*$/;

function indentBlock(content, indent) {
  if (!indent) {
    return content;
  }

  return content
    .split('\n')
    .map((line) => (line.length ? `${indent}${line}` : line))
    .join('\n');
}

function assembleContent(content, baseDir, stack = []) {
  const lines = content.split('\n');
  const output = [];

  for (const line of lines) {
    const match = line.match(INCLUDE_RE);

    if (!match) {
      output.push(line);
      continue;
    }

    const [, indent, relativePath] = match;
    const partialPath = path.resolve(baseDir, relativePath);

    if (!fs.existsSync(partialPath)) {
      throw new Error(`Partial not found: ${relativePath} (resolved: ${partialPath})`);
    }

    if (stack.includes(partialPath)) {
      throw new Error(`Circular include detected: ${[...stack, partialPath].join(' -> ')}`);
    }

    const partialContent = assembleFile(partialPath, path.dirname(partialPath), [...stack, partialPath]);
    output.push(indentBlock(partialContent, indent));
  }

  return output.join('\n');
}

function assembleFile(filePath, baseDir, stack = []) {
  const content = fs.readFileSync(filePath, 'utf8');
  return assembleContent(content, baseDir, stack);
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
