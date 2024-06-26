const fs = require('fs');
const path = require('path');

// Configuration for aliases
const alias = '@/components';
const targetDir = 'components';

// Directories to exclude from processing
const excludeDirs = [
  path.resolve(__dirname, 'src/routes/device/bitbox01'),
  // Add more directories to exclude as needed
];

// Function to update import paths in a file
function updateImportPaths(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf8');

  // Regular expression to match relative paths starting with ../ or deeper pointing to components directory
  const relativePathPattern = new RegExp(`(['"\`])((?:\\.{2,}\\/)+)${targetDir}\\/`, 'g');
  fileContent = fileContent.replace(relativePathPattern, `$1${alias}/`);

  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`Updated imports in ${filePath}`);
}

// Function to recursively process files in a directory
function processDirectory(directoryPath) {
  // Skip processing if the directory is in the exclusion list
  if (excludeDirs.includes(directoryPath)) {
    console.log(`Skipping directory: ${directoryPath}`);
    return;
  }

  fs.readdirSync(directoryPath).forEach(fileOrDir => {
    const fullPath = path.join(directoryPath, fileOrDir);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      updateImportPaths(fullPath);
    }
  });
}

// Start processing from the project root directory
processDirectory(path.resolve(__dirname));
