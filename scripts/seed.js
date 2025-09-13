import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import connectDB from '../lib/connectDB.js';
import { Product, Tag, ProductTag, BlogCategory } from '../lib/models.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try .env.local first, then .env
const envLocalPath = join(__dirname, '../.env.local');
const envPath = join(__dirname, '../.env');

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log('Loaded environment from .env.local');
} else if (existsSync(envPath)) {
  config({ path: envPath });
  console.log('Loaded environment from .env');
} else {
  console.log('No .env file found, using system environment variables');
}

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('Environment paths:');
console.log('envLocalPath:', envLocalPath);
console.log('envPath:', envPath);
console.log('envLocalPath exists:', existsSync(envLocalPath));
console.log('envPath exists:', existsSync(envPath));
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('MONGODB_URI value:', process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Add model verification
console.log('Models imported:', { Product, Tag, ProductTag });
console.log('Product model:', Product?.modelName);
console.log('Tag model:', Tag?.modelName);
console.log('ProductTag model:', ProductTag?.modelName);

console.log('Starting database seeding...');

const predefinedProducts = [
  // Featured Products from Landing Page
  {
    title: 'CodeArc',
    url: 'https://snippets-frontend-pearl.vercel.app/',
    description: 'CodeArc helps developers organize, reuse, and share code snippets effortlessly. Powered by AI, it streamlines development by providing smart suggestions, automated tests, and real-time collaboration tools.',
    category: 'Development Tools',
    metadata: {
      tags: ['ai', 'snippets', 'code-management', 'collaboration', 'search'],
    },
  },
  {
    title: 'Securo',
    url: 'https://securo-app-v0.vercel.app/',
    description: 'Securo lets users scan for data breaches involving their email or passwords, monitor threat exposure, and gain AI-driven security recommendations. Ideal for proactive digital safety.',
    category: 'Security',
    metadata: {
      tags: ['security', 'breach-detection', 'ai', 'password-analysis', 'monitoring'],
    },
  },
  {
    title: 'PDF Pro',
    url: 'https://pdf-merger-green.vercel.app/',
    description: 'PDF Pro offers a powerful suite to create, merge, protect, and manage PDFs. Designed with security-first tools like encryption, watermarking, and file tracking for secure document workflows.',
    category: 'Document Management',
    metadata: {
      tags: ['pdf', 'document-management', 'encryption', 'security', 'file-processing'],
    },
  },
  {
    title: 'Kai-API',
    url: 'https://kai-api-v0.onrender.com/',
    description: 'Kai-API scans public repositories to detect leaked or vulnerable APIs. It provides continuous monitoring, instant alerts, and detailed security insights to prevent breaches before they happen.',
    category: 'Security',
    metadata: {
      tags: ['api-security', 'vulnerability-scanning', 'monitoring', 'repository-security', 'alerts'],
    },
  },

  // Development Tools
  {
    title: 'GitHub',
    url: 'https://github.com',
    description: 'The world\'s leading software development platform',
    category: 'Version Control',
    metadata: {
      tags: ['git', 'version-control', 'collaboration', 'open-source'],
    },
  },
  {
    title: 'VS Code',
    url: 'https://code.visualstudio.com',
    description: 'Free source-code editor with support for debugging, syntax highlighting, and extensions',
    category: 'Code Editor',
    metadata: {
      tags: ['editor', 'ide', 'microsoft', 'extensions'],
    },
  },
  {
    title: 'Postman',
    url: 'https://postman.com',
    description: 'API platform for building and using APIs',
    category: 'API Tools',
    metadata: {
      tags: ['api', 'testing', 'http', 'rest'],
    },
  },
  
  // Hosting & Deployment
  {
    title: 'Vercel',
    url: 'https://vercel.com',
    description: 'Platform for frontend frameworks and static sites, built to integrate with headless content, commerce, or database',
    category: 'Hosting',
    metadata: {
      tags: ['hosting', 'deployment', 'serverless', 'frontend'],
    },
  },
  {
    title: 'Netlify',
    url: 'https://netlify.com',
    description: 'Build, deploy, and manage modern web projects',
    category: 'Hosting',
    metadata: {
      tags: ['hosting', 'deployment', 'jamstack', 'static-sites'],
    },
  },
  {
    title: 'Heroku',
    url: 'https://heroku.com',
    description: 'Cloud platform that lets companies build, deliver, monitor and scale apps',
    category: 'Cloud Platform',
    metadata: {
      tags: ['cloud', 'platform', 'deployment', 'scaling'],
    },
  },

  // Databases
  {
    title: 'MongoDB Atlas',
    url: 'https://mongodb.com/atlas',
    description: 'Multi-cloud database service for modern applications',
    category: 'Database',
    metadata: {
      tags: ['database', 'nosql', 'cloud', 'mongodb'],
    },
  },
  {
    title: 'Firebase',
    url: 'https://firebase.google.com',
    description: 'Platform for building web and mobile applications',
    category: 'Backend as a Service',
    metadata: {
      tags: ['database', 'authentication', 'hosting', 'google'],
    },
  },
  {
    title: 'Supabase',
    url: 'https://supabase.com',
    description: 'Open source Firebase alternative with PostgreSQL database',
    category: 'Backend as a Service',
    metadata: {
      tags: ['database', 'postgresql', 'authentication', 'open-source'],
    },
  },

  // Design & UI
  {
    title: 'Figma',
    url: 'https://figma.com',
    description: 'Collaborative interface design tool',
    category: 'Design',
    metadata: {
      tags: ['design', 'ui', 'ux', 'collaboration', 'prototyping'],
    },
  },
  {
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    description: 'Utility-first CSS framework for rapidly building custom user interfaces',
    category: 'CSS Framework',
    metadata: {
      tags: ['css', 'framework', 'utility-first', 'responsive'],
    },
  },

  // Analytics & Monitoring
  {
    title: 'Google Analytics',
    url: 'https://analytics.google.com',
    description: 'Web analytics service that tracks and reports website traffic',
    category: 'Analytics',
    metadata: {
      tags: ['analytics', 'tracking', 'google', 'metrics'],
    },
  },
  {
    title: 'Sentry',
    url: 'https://sentry.io',
    description: 'Application monitoring and error tracking software',
    category: 'Monitoring',
    metadata: {
      tags: ['monitoring', 'error-tracking', 'debugging', 'performance'],
    },
  },

  // Authentication
  {
    title: 'Auth0',
    url: 'https://auth0.com',
    description: 'Identity platform for application builders',
    category: 'Authentication',
    metadata: {
      tags: ['authentication', 'identity', 'oauth', 'security'],
    },
  },
  {
    title: 'Clerk',
    url: 'https://clerk.com',
    description: 'Complete user management platform',
    category: 'Authentication',
    metadata: {
      tags: ['authentication', 'user-management', 'oauth', 'react'],
    },
  },

  // DevOps & CI/CD
  {
    title: 'Docker',
    url: 'https://docker.com',
    description: 'Platform for developing, shipping, and running applications in containers',
    category: 'DevOps',
    metadata: {
      tags: ['containers', 'devops', 'deployment', 'virtualization'],
    },
  },
  {
    title: 'GitHub Actions',
    url: 'https://github.com/features/actions',
    description: 'Automate, customize, and execute software development workflows',
    category: 'CI/CD',
    metadata: {
      tags: ['ci-cd', 'automation', 'workflows', 'github'],
    },
  },

  // Communication & Collaboration
  {
    title: 'Slack',
    url: 'https://slack.com',
    description: 'Business communication platform',
    category: 'Communication',
    metadata: {
      tags: ['communication', 'collaboration', 'chat', 'teams'],
    },
  },
  {
    title: 'Discord',
    url: 'https://discord.com',
    description: 'Voice, video and text communication service',
    category: 'Communication',
    metadata: {
      tags: ['communication', 'voice', 'gaming', 'communities'],
    },
  },

  // Package Managers & Registries
  {
    title: 'npm',
    url: 'https://npmjs.com',
    description: 'Package manager for JavaScript',
    category: 'Package Manager',
    metadata: {
      tags: ['package-manager', 'javascript', 'node', 'dependencies'],
    },
  },
];

const predefinedTags = [
  // Featured Product Tags
  { name: 'ai', color: '#FF6B35', category: 'technology' },
  { name: 'snippets', color: '#007ACC', category: 'development' },
  { name: 'code-management', color: '#28A745', category: 'development' },
  { name: 'search', color: '#17A2B8', category: 'features' },
  { name: 'security', color: '#DC3545', category: 'security' },
  { name: 'breach-detection', color: '#DC3545', category: 'security' },
  { name: 'password-analysis', color: '#FFC107', category: 'security' },
  { name: 'monitoring', color: '#6C757D', category: 'operations' },
  { name: 'pdf', color: '#E74C3C', category: 'documents' },
  { name: 'document-management', color: '#9B59B6', category: 'productivity' },
  { name: 'encryption', color: '#2C3E50', category: 'security' },
  { name: 'file-processing', color: '#F39C12', category: 'productivity' },
  { name: 'api-security', color: '#E74C3C', category: 'security' },
  { name: 'vulnerability-scanning', color: '#C0392B', category: 'security' },
  { name: 'repository-security', color: '#8E44AD', category: 'security' },
  { name: 'alerts', color: '#F1C40F', category: 'notifications' },

  // Existing Tags
  { name: 'git', color: '#F05032', category: 'version-control' },
  { name: 'version-control', color: '#F05032', category: 'development' },
  { name: 'collaboration', color: '#4A90E2', category: 'workflow' },
  { name: 'open-source', color: '#28A745', category: 'development' },
  { name: 'editor', color: '#007ACC', category: 'tools' },
  { name: 'ide', color: '#007ACC', category: 'tools' },
  { name: 'microsoft', color: '#00BCF2', category: 'company' },
  { name: 'extensions', color: '#6C757D', category: 'features' },
  { name: 'api', color: '#FF6B35', category: 'development' },
  { name: 'testing', color: '#DC3545', category: 'development' },
  { name: 'http', color: '#007BFF', category: 'protocol' },
  { name: 'rest', color: '#007BFF', category: 'api' },
  { name: 'hosting', color: '#17A2B8', category: 'infrastructure' },
  { name: 'deployment', color: '#17A2B8', category: 'infrastructure' },
  { name: 'serverless', color: '#FFC107', category: 'architecture' },
  { name: 'frontend', color: '#E83E8C', category: 'development' },
  { name: 'jamstack', color: '#F0F', category: 'architecture' },
  { name: 'static-sites', color: '#6F42C1', category: 'architecture' },
  { name: 'cloud', color: '#20C997', category: 'infrastructure' },
  { name: 'platform', color: '#6C757D', category: 'infrastructure' },
  { name: 'scaling', color: '#FD7E14', category: 'architecture' },
  { name: 'database', color: '#28A745', category: 'data' },
  { name: 'nosql', color: '#28A745', category: 'database' },
  { name: 'mongodb', color: '#47A248', category: 'database' },
  { name: 'authentication', color: '#DC3545', category: 'security' },
  { name: 'google', color: '#4285F4', category: 'company' },
  { name: 'postgresql', color: '#336791', category: 'database' },
  { name: 'design', color: '#F24E1E', category: 'creative' },
  { name: 'ui', color: '#FF7262', category: 'design' },
  { name: 'ux', color: '#A259FF', category: 'design' },
  { name: 'prototyping', color: '#0ACF83', category: 'design' },
  { name: 'css', color: '#1572B6', category: 'styling' },
  { name: 'framework', color: '#6610F2', category: 'development' },
  { name: 'utility-first', color: '#06B6D4', category: 'css' },
  { name: 'responsive', color: '#06B6D4', category: 'css' },
  { name: 'analytics', color: '#FF6B00', category: 'data' },
  { name: 'tracking', color: '#FF6B00', category: 'analytics' },
  { name: 'metrics', color: '#FF6B00', category: 'analytics' },
  { name: 'monitoring', color: '#362D59', category: 'operations' },
  { name: 'error-tracking', color: '#362D59', category: 'monitoring' },
  { name: 'debugging', color: '#362D59', category: 'development' },
  { name: 'performance', color: '#FFC107', category: 'optimization' },
  { name: 'identity', color: '#EB5424', category: 'security' },
  { name: 'oauth', color: '#EB5424', category: 'authentication' },
  { name: 'security', color: '#DC3545', category: 'security' },
  { name: 'user-management', color: '#6366F1', category: 'authentication' },
  { name: 'react', color: '#61DAFB', category: 'frontend' },
  { name: 'containers', color: '#2496ED', category: 'devops' },
  { name: 'devops', color: '#2496ED', category: 'operations' },
  { name: 'virtualization', color: '#2496ED', category: 'infrastructure' },
  { name: 'ci-cd', color: '#2088FF', category: 'automation' },
  { name: 'automation', color: '#2088FF', category: 'workflow' },
  { name: 'workflows', color: '#2088FF', category: 'automation' },
  { name: 'github', color: '#181717', category: 'platform' },
  { name: 'communication', color: '#611F69', category: 'collaboration' },
  { name: 'chat', color: '#611F69', category: 'communication' },
  { name: 'teams', color: '#611F69', category: 'collaboration' },
  { name: 'voice', color: '#5865F2', category: 'communication' },
  { name: 'gaming', color: '#5865F2', category: 'entertainment' },
  { name: 'communities', color: '#5865F2', category: 'social' },
  { name: 'package-manager', color: '#CB3837', category: 'tools' },
  { name: 'javascript', color: '#F7DF1E', category: 'language' },
  { name: 'node', color: '#339933', category: 'runtime' },
  { name: 'dependencies', color: '#CB3837', category: 'package-manager' },
];

const predefinedBlogCategories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest trends, tools, and insights in technology and software development',
    color: '#3B82F6',
    icon: '💻',
    isActive: true,
    order: 1,
    postCount: 0
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Frontend, backend, and full-stack web development tutorials and tips',
    color: '#10B981',
    icon: '🌐',
    isActive: true,
    order: 2,
    postCount: 0
  },
  {
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript frameworks, libraries, and best practices',
    color: '#F59E0B',
    icon: '⚡',
    isActive: true,
    order: 3,
    postCount: 0
  },
  {
    name: 'React',
    slug: 'react',
    description: 'React.js tutorials, hooks, patterns, and ecosystem',
    color: '#06B6D4',
    icon: '⚛️',
    isActive: true,
    order: 4,
    postCount: 0
  },
  {
    name: 'Node.js',
    slug: 'nodejs',
    description: 'Server-side JavaScript with Node.js and related technologies',
    color: '#22C55E',
    icon: '🚀',
    isActive: true,
    order: 5,
    postCount: 0
  },
  {
    name: 'DevOps',
    slug: 'devops',
    description: 'Deployment, CI/CD, containerization, and infrastructure automation',
    color: '#8B5CF6',
    icon: '🔧',
    isActive: true,
    order: 6,
    postCount: 0
  },
  {
    name: 'Database',
    slug: 'database',
    description: 'Database design, optimization, and management techniques',
    color: '#F97316',
    icon: '🗄️',
    isActive: true,
    order: 7,
    postCount: 0
  },
  {
    name: 'AI & Machine Learning',
    slug: 'ai-ml',
    description: 'Artificial intelligence, machine learning, and data science',
    color: '#EC4899',
    icon: '🤖',
    isActive: true,
    order: 8,
    postCount: 0
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, and cross-platform mobile app development',
    color: '#6366F1',
    icon: '📱',
    isActive: true,
    order: 9,
    postCount: 0
  },
  {
    name: 'Security',
    slug: 'security',
    description: 'Cybersecurity, web security, and best practices for secure coding',
    color: '#EF4444',
    icon: '🔒',
    isActive: true,
    order: 10,
    postCount: 0
  },
  {
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'User interface and user experience design principles and tools',
    color: '#A855F7',
    icon: '🎨',
    isActive: true,
    order: 11,
    postCount: 0
  },
  {
    name: 'Career & Growth',
    slug: 'career-growth',
    description: 'Professional development, career advice, and skill building',
    color: '#14B8A6',
    icon: '📈',
    isActive: true,
    order: 12,
    postCount: 0
  },
  {
    name: 'Tutorials',
    slug: 'tutorials',
    description: 'Step-by-step guides and how-to articles',
    color: '#F59E0B',
    icon: '📚',
    isActive: true,
    order: 13,
    postCount: 0
  },
  {
    name: 'News & Updates',
    slug: 'news-updates',
    description: 'Latest news, updates, and announcements in tech',
    color: '#06B6D4',
    icon: '📰',
    isActive: true,
    order: 14,
    postCount: 0
  },
  {
    name: 'Open Source',
    slug: 'open-source',
    description: 'Open source projects, contributions, and community insights',
    color: '#22C55E',
    icon: '🌟',
    isActive: true,
    order: 15,
    postCount: 0
  },
  {
    name: 'General',
    slug: 'general',
    description: 'General discussions and miscellaneous topics',
    color: '#6B7280',
    icon: '💬',
    isActive: true,
    order: 16,
    postCount: 0
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    // Add connection verification
    console.log('Database connected successfully');
    
    // Test database access
    try {
      const collections = await Product.db.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
    } catch (collectionError) {
      console.log('Could not list collections:', collectionError.message);
    }

    console.log('Clearing existing predefined products...');
    const deleteResult = await Product.deleteMany({ isPredefined: true });
    console.log(`Deleted ${deleteResult.deletedCount} existing predefined products`);

    console.log('Creating tags...');
    let createdTagsCount = 0;
    for (const tagData of predefinedTags) {
      try {
        const existingTag = await Tag.findOne({ name: tagData.name });
        if (!existingTag) {
          const newTag = await Tag.create(tagData);
          createdTagsCount++;
          console.log(`Created tag: ${tagData.name}`);
        } else {
          console.log(`Tag already exists: ${tagData.name}`);
        }
      } catch (tagError) {
        console.error(`Error creating tag ${tagData.name}:`, tagError.message);
      }
    }
    console.log(`Total tags created: ${createdTagsCount}`);

    console.log('Creating blog categories...');
    let createdCategoriesCount = 0;
    for (const categoryData of predefinedBlogCategories) {
      try {
        const existingCategory = await BlogCategory.findOne({ slug: categoryData.slug });
        if (!existingCategory) {
          const newCategory = await BlogCategory.create(categoryData);
          createdCategoriesCount++;
          console.log(`Created blog category: ${categoryData.name}`);
        } else {
          console.log(`Blog category already exists: ${categoryData.name}`);
        }
      } catch (categoryError) {
        console.error(`Error creating blog category ${categoryData.name}:`, categoryError.message);
      }
    }
    console.log(`Total blog categories created: ${createdCategoriesCount}`);

    console.log('Creating predefined products...');
    let createdProductsCount = 0;
    for (const productData of predefinedProducts) {
      try {
        const product = await Product.create({
          ...productData,
          isPredefined: true,
          isPublic: true, // Predefined products should be public
          // Add community data for consistency
          communityData: {
            isApproved: true,
            approvedAt: new Date(),
            isHidden: false,
            reportCount: 0
          },
          // Add public analytics for consistency
          publicAnalytics: {
            viewCount: 0,
            clickCount: 0,
            addedToCollectionsCount: 0,
            uniqueUsers: 0
          }
        });
        createdProductsCount++;

        console.log(`Created product: ${product.title}`);

        // Create product-tag associations
        if (productData.metadata.tags) {
          console.log(`Creating ${productData.metadata.tags.length} tag associations for ${product.title}`);
          let associationsCreated = 0;
          for (const tagName of productData.metadata.tags) {
            try {
              const tag = await Tag.findOne({ name: tagName });
              if (tag) {
                const existingAssociation = await ProductTag.findOne({
                  productId: product._id,
                  tagId: tag._id,
                });

                if (!existingAssociation) {
                  await ProductTag.create({
                    productId: product._id,
                    tagId: tag._id,
                  });
                  associationsCreated++;
                  console.log(`Created association: ${product.title} -> ${tagName}`);
                }
              } else {
                console.warn(`Tag not found: ${tagName} for product ${product.title}`);
              }
            } catch (associationError) {
              console.error(`Error creating association for ${tagName}:`, associationError.message);
            }
          }
          console.log(`Created ${associationsCreated} associations for ${product.title}`);
        }
      } catch (productError) {
        console.error(`Error creating product ${productData.title}:`, productError.message);
      }
    }

    console.log('Seeding completed successfully!');
    console.log(`Created ${createdProductsCount} products, ${createdTagsCount} tags, and ${createdCategoriesCount} blog categories`);
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Script executed directly, starting seeding...');
  seedDatabase();
} else {
  console.log('Script imported as module');
}

// Also run if this is the main script
const currentFileUrl = new URL(import.meta.url).pathname;
const scriptPath = process.argv[1];
if (currentFileUrl.endsWith('seed.js') || scriptPath.endsWith('seed.js')) {
  console.log('Running seedDatabase function...');
  seedDatabase();
}

export default seedDatabase;
