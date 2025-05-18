/**
 * Script to generate sidebar files for each version based on origin/documentation.md files
 */
const fs = require('fs');
const path = require('path');

// Versions to process
const versions = ['8.x', '9.x', '10.x', '11.x', '12.x'];

// Function to parse documentation.md and create sidebar structure
function parseSidebar(docContent, version) {
  const lines = docContent.split('\n');
  const sidebar = {
    tutorialSidebar: []
  };

  let currentCategory = null;

  for (const line of lines) {
    // Match main category
    const categoryMatch = line.match(/^- ## (.+)$/);
    if (categoryMatch) {
      currentCategory = {
        type: 'category',
        label: categoryMatch[1],
        collapsed: true,
        items: []
      };
      sidebar.tutorialSidebar.push(currentCategory);
      continue;
    }

    // Match items within a category
    const itemMatch = line.match(/^\s+- \[(.+)\]\(\/docs\/\{\{version\}\}\/(.+)\)$/);
    if (itemMatch && currentCategory) {
      const itemLabel = itemMatch[1];
      const itemPath = itemMatch[2];
      currentCategory.items.push(itemPath);
      continue;
    }

    // Match API Documentation link (outside of any category)
    const apiDocsMatch = line.match(/^- \[API Documentation\]\((.+)\)$/);
    if (apiDocsMatch) {
      let apiUrl = apiDocsMatch[1];
      // If URL contains a version placeholder, replace it with the actual version
      if (apiUrl.includes('{{version}}')) {
        apiUrl = apiUrl.replace('{{version}}', version);
      }

      // Add API Documentation as a link item
      sidebar.tutorialSidebar.push({
        type: 'link',
        label: 'API Documentation',
        href: apiUrl
      });
    }
  }

  return sidebar;
}

// Process each version
versions.forEach(version => {
  const docPath = path.join(__dirname, '..', 'versioned_docs', `version-${version}`, 'origin', 'documentation.md');
  const sidebarOutputPath = path.join(__dirname, '..', 'versioned_sidebars', `version-${version}-sidebars.json`);

  // Create directory if it doesn't exist
  const sidebarDir = path.dirname(sidebarOutputPath);
  if (!fs.existsSync(sidebarDir)) {
    fs.mkdirSync(sidebarDir, { recursive: true });
  }

  try {
    if (fs.existsSync(docPath)) {
      const docContent = fs.readFileSync(docPath, 'utf8');
      const sidebar = parseSidebar(docContent, version);

      // Set first category to be expanded by default
      if (sidebar.tutorialSidebar.length > 0) {
        sidebar.tutorialSidebar[1].collapsed = false;
      }

      fs.writeFileSync(sidebarOutputPath, JSON.stringify(sidebar, null, 2));
      console.log(`Generated sidebar for version ${version}`);
    } else {
      console.warn(`Documentation file not found for version ${version}`);
    }
  } catch (error) {
    console.error(`Error processing version ${version}:`, error);
  }
});

console.log('Sidebar generation complete!');
