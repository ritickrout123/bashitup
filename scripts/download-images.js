const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directories if they don't exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Download image from URL
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file async
      reject(err);
    });
  });
};

// Unsplash image URLs for different categories
const imageUrls = {
  // Hero and general
  'hero-bg.jpg': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&h=1080&fit=crop',
  
  // Theme images - Birthday
  'themes/pink-princess-1.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
  'themes/pink-princess-2.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
  'themes/pink-princess-3.jpg': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  
  // Bollywood theme
  'themes/bollywood-1.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
  'themes/bollywood-2.jpg': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
  'themes/bollywood-3.jpg': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
  
  // Romantic Anniversary
  'themes/romantic-1.jpg': 'https://images.unsplash.com/photo-1518904377665-ed182a0e4e37?w=800&h=600&fit=crop',
  'themes/romantic-2.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
  'themes/romantic-3.jpg': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
  
  // Baby Shower
  'themes/baby-shower-1.jpg': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
  'themes/baby-shower-2.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
  'themes/baby-shower-3.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
  
  // Corporate
  'themes/corporate-1.jpg': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
  'themes/corporate-2.jpg': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
  'themes/corporate-3.jpg': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
  
  // Neon theme
  'themes/neon-1.jpg': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
  'themes/neon-2.jpg': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
  'themes/neon-3.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
  
  // Portfolio before/after images
  'portfolio/before-1.jpg': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  'portfolio/after-1-1.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
  'portfolio/after-1-2.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop',
  'portfolio/after-1-3.jpg': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  
  'portfolio/before-2.jpg': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  'portfolio/after-2-1.jpg': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop',
  'portfolio/after-2-2.jpg': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
  
  'portfolio/before-3.jpg': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  'portfolio/after-3-1.jpg': 'https://images.unsplash.com/photo-1518904377665-ed182a0e4e37?w=600&h=400&fit=crop',
  'portfolio/after-3-2.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop',
  'portfolio/after-3-3.jpg': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop',
  
  // Testimonial images
  'testimonials/birthday-1-before.jpg': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  'testimonials/birthday-1-after.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'testimonials/birthday-1-celebration.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
  
  'testimonials/bollywood-1-setup.jpg': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
  'testimonials/bollywood-1-party.jpg': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
  
  'testimonials/baby-shower-1.jpg': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop',
  
  'testimonials/anniversary-1-romantic.jpg': 'https://images.unsplash.com/photo-1518904377665-ed182a0e4e37?w=400&h=300&fit=crop',
  'testimonials/anniversary-1-couple.jpg': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
  'testimonials/anniversary-1-setup.jpg': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
  
  'testimonials/corporate-1-elegant.jpg': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
  'testimonials/corporate-1-professional.jpg': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop',
};

async function downloadAllImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  const imagesDir = path.join(publicDir, 'images');
  
  // Create base directories
  createDir(imagesDir);
  createDir(path.join(imagesDir, 'themes'));
  createDir(path.join(imagesDir, 'portfolio'));
  createDir(path.join(imagesDir, 'testimonials'));
  
  console.log('Starting image downloads...');
  
  for (const [filename, url] of Object.entries(imageUrls)) {
    try {
      const filepath = path.join(imagesDir, filename);
      await downloadImage(url, filepath);
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error.message);
    }
  }
  
  console.log('Image downloads completed!');
}

downloadAllImages().catch(console.error);