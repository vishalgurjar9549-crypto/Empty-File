#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Pattern 1: Fix ../../src/ to ../
    content = content.replace(/from\s+['"]..\/..\/src\//g, (match) => {
      const quote = match.includes('"') ? '"' : "'";
      return `from ${quote}../`;
    });
    
    // Pattern 2: Fix ../src/ to ./
    content = content.replace(/from\s+['"]..\/src\//g, (match) => {
      const quote = match.includes('"') ? '"' : "'";
      return `from ${quote}./`;
    });
    
    // Pattern 3: Handle import statements from chains
    content = content.replace(/import\s+['"]..\/..\/src\//g, (match) => {
      const quote = match.includes('"') ? '"' : "'";
      return `import ${quote}../`;
    });
    
    // Pattern 4: Handle dynamic imports
    content = content.replace(/import\(['"]..\/..\/src\//g, (match) => {
      const quote = match.includes('"') ? '"' : "'";
      return `import(${quote}../`;
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  let fixed = 0;
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and dist
        if (file !== 'node_modules' && file !== 'dist') {
          fixed += walkDirectory(fullPath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        if (fixImportsInFile(fullPath)) {
          fixed++;
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return fixed;
}

// Start from src directory
console.log('🔧 Starting import path migration...\n');
const srcDir = path.join(__dirname, 'src');
const fixedCount = walkDirectory(srcDir);
console.log(`\n✅ Fixed imports in ${fixedCount} files`);
