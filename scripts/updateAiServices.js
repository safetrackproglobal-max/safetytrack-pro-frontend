const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '../src/services');

// List of all AI/service files that use axios
const serviceFiles = [
  'GeneralAIService.js',
  'environmentalAIService.js',
  'notificationService.js',
  'hseIndustryService.js',
  'aviationApiService.js',
  'chemicalApiService.js',
  'constructionApiService.js',
  'generalIndustryApiService.js',
  'healthcareSafetyService.js',
  'maritimeSafetyService.js',
  'miningSafetyService.js',
  'oilGasSafetyService.js',
  'diseasePredictionService.js',
  'symptomAnalyzerService.js',
  'labResultAnalyzerService.js',
  'medicalTextAnalysisService.js',
  'riskAssessmentService.js',
  'safetyDocumentAnalyzerService.js',
  'videoSafetyAnalysisService.js',
  'environmentalDataAnalysisService.js'
];

serviceFiles.forEach(fileName => {
  const filePath = path.join(servicesDir, fileName);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already uses our custom axios
    if (content.includes('axiosWithLanguage')) {
      console.log(`✓ ${fileName} already updated`);
      return;
    }
    
    // Replace standard axios import
    if (content.includes("import axios from 'axios'")) {
      content = content.replace(
        "import axios from 'axios'",
        "import axios from './axiosWithLanguage'"
      );
      console.log(`✓ Updated ${fileName}`);
    } else if (content.includes('import axios from "axios"')) {
      content = content.replace(
        'import axios from "axios"',
        'import axios from "./axiosWithLanguage"'
      );
      console.log(`✓ Updated ${fileName}`);
    } else if (content.includes('const axios = require')) {
      content = content.replace(
        'const axios = require',
        "import axios from './axiosWithLanguage'"
      );
      console.log(`✓ Updated ${fileName}`);
    } else {
      // Add import if not present
      content = `import axios from './axiosWithLanguage';\n${content}`;
      console.log(`✓ Added import to ${fileName}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
  } else {
    console.log(`✗ ${fileName} not found`);
  }
});

// Also check for any other .js files in services directory
console.log('\n=== Searching for other service files ===');
const allFiles = fs.readdirSync(servicesDir);

allFiles.forEach(file => {
  if (file.endsWith('.js') && !serviceFiles.includes(file)) {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it uses axios
    if (content.includes('axios.')) {
      console.log(`Found axios usage in: ${file}`);
      
      if (!content.includes('axiosWithLanguage')) {
        // Try to replace
        content = content.replace(
          /import.*axios.*from.*['"]axios['"]/g,
          "import axios from './axiosWithLanguage'"
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${file}`);
      }
    }
  }
});

console.log('\n=== Update Complete ===');
console.log('All AI services now automatically send language parameter!');