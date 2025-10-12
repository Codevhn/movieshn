/**
 * Section Icons Manager
 * Automatically adds appropriate icons to section headings
 */

// Icon mapping for different sections
const sectionIcons = {
  'ultimos-agregados': 'fas fa-star',
  'continuar-viendo': 'fas fa-play-circle',
  'resultados': 'fas fa-search',
  'recientes': 'fas fa-clock',
  'ultimas-series': 'fas fa-tv',
  'todas-las-series-de-tv': 'fas fa-list',
  'tv-series-category': 'fas fa-tv',
  'mas-vistas': 'fas fa-eye',
  'terror': 'fas fa-ghost',
  'suspenso': 'fas fa-exclamation-triangle',
  'accion': 'fas fa-fist-raised',
  'tv-series': 'fas fa-television',
  'comedia': 'fas fa-laugh',
  'fantasia': 'fas fa-magic',
  'ciencia-ficcion': 'fas fa-rocket',
  'aventura': 'fas fa-mountain',
  'animacion': 'fas fa-palette',
  'musical': 'fas fa-music',
  'biografia': 'fas fa-user',
  'drama': 'fas fa-theater-masks',
  'documentales': 'fas fa-film',
  '+18': 'fas fa-lock',
  'hackers-y-ciberseguridad': 'fas fa-shield-alt'
};

// Alternative icons for sections that might have different names
const alternativeIcons = {
  'latest': 'fas fa-star',
  'continue': 'fas fa-play-circle',
  'search': 'fas fa-search',
  'recent': 'fas fa-clock',
  'series': 'fas fa-tv',
  'popular': 'fas fa-fire',
  'trending': 'fas fa-trending-up',
  'horror': 'fas fa-ghost',
  'thriller': 'fas fa-exclamation-triangle',
  'action': 'fas fa-fist-raised',
  'comedy': 'fas fa-laugh',
  'fantasy': 'fas fa-magic',
  'sci-fi': 'fas fa-rocket',
  'science-fiction': 'fas fa-rocket',
  'adventure': 'fas fa-mountain',
  'animation': 'fas fa-palette',
  'music': 'fas fa-music',
  'biography': 'fas fa-user',
  'drama': 'fas fa-theater-masks',
  'documentary': 'fas fa-film',
  'adult': 'fas fa-lock',
  'hacker': 'fas fa-shield-alt',
  'cyber': 'fas fa-shield-alt'
};

function getIconForSection(sectionText, sectionId) {
  // Clean and normalize text
  const cleanText = sectionText.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  // Try exact match with section ID first
  if (sectionId && sectionIcons[sectionId]) {
    return sectionIcons[sectionId];
  }
  
  // Try exact match with cleaned text
  if (sectionIcons[cleanText]) {
    return sectionIcons[cleanText];
  }
  
  // Try partial matches
  for (const [key, icon] of Object.entries(alternativeIcons)) {
    if (cleanText.includes(key) || sectionText.toLowerCase().includes(key)) {
      return icon;
    }
  }
  
  // Default icon based on content type
  if (cleanText.includes('serie') || cleanText.includes('tv')) {
    return 'fas fa-tv';
  }
  if (cleanText.includes('pelicula') || cleanText.includes('movie')) {
    return 'fas fa-film';
  }
  
  // Fallback icon
  return 'fas fa-folder-open';
}

function addIconsToSections() {
  // Find all section headings that don't already have icons
  const headings = document.querySelectorAll('.latest-carousel-section h2:not(:has(.section-icon)), .movie-section h2:not(:has(.section-icon))');
  
  if (headings.length === 0) return; // No work to do
  
  // Use document fragment for better performance
  headings.forEach(heading => {
    const section = heading.closest('section');
    const sectionId = section?.id || '';
    const sectionText = heading.textContent.trim();
    
    // Get appropriate icon
    const iconClass = getIconForSection(sectionText, sectionId);
    
    // Create icon element
    const iconElement = document.createElement('i');
    iconElement.className = `section-icon ${iconClass}`;
    iconElement.setAttribute('aria-hidden', 'true');
    
    // Insert icon at the beginning of the heading
    heading.prepend(iconElement);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', addIconsToSections);

// Also run after a short delay to catch dynamically loaded content
setTimeout(addIconsToSections, 1000);

// Throttled mutation observer for better performance
let observerTimeout;
const observer = new MutationObserver((mutations) => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(() => {
    const hasNewHeadings = mutations.some(mutation => 
      Array.from(mutation.addedNodes).some(node => 
        node.nodeType === Node.ELEMENT_NODE && 
        (node.matches?.('h2') || node.querySelector?.('h2'))
      )
    );
    
    if (hasNewHeadings) {
      addIconsToSections();
    }
  }, 300); // Debounce for 300ms
});

// Start observing with more specific configuration
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributeFilter: ['class', 'id'] // Only watch for class/id changes
});

// Export for manual use
window.addIconsToSections = addIconsToSections;