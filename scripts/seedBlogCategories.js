import connectDB from '../lib/connectDB.js';
import { BlogCategory } from '../lib/models.js';

const defaultCategories = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Frontend, backend, and full-stack web development topics',
    color: '#3B82F6',
    icon: 'code',
    order: 1
  },
  {
    name: 'Programming Languages',
    slug: 'programming-languages',
    description: 'JavaScript, Python, Java, C++, and other programming languages',
    color: '#10B981',
    icon: 'terminal',
    order: 2
  },
  {
    name: 'DevOps & Cloud',
    slug: 'devops-cloud',
    description: 'Cloud computing, containerization, CI/CD, and infrastructure',
    color: '#F59E0B',
    icon: 'cloud',
    order: 3
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, React Native, and mobile app development',
    color: '#EF4444',
    icon: 'device-phone-mobile',
    order: 4
  },
  {
    name: 'Data Science & AI',
    slug: 'data-science-ai',
    description: 'Machine learning, data analysis, artificial intelligence',
    color: '#8B5CF6',
    icon: 'chart-bar',
    order: 5
  },
  {
    name: 'Software Engineering',
    slug: 'software-engineering',
    description: 'Software architecture, design patterns, best practices',
    color: '#06B6D4',
    icon: 'cog',
    order: 6
  },
  {
    name: 'Tutorials',
    slug: 'tutorials',
    description: 'Step-by-step guides and how-to articles',
    color: '#84CC16',
    icon: 'book-open',
    order: 7
  },
  {
    name: 'Career & Professional',
    slug: 'career-professional',
    description: 'Career advice, job interviews, professional development',
    color: '#F97316',
    icon: 'briefcase',
    order: 8
  },
  {
    name: 'Tools & Resources',
    slug: 'tools-resources',
    description: 'Development tools, libraries, frameworks, and resources',
    color: '#EC4899',
    icon: 'wrench',
    order: 9
  },
  {
    name: 'General',
    slug: 'general',
    description: 'General technology and programming discussions',
    color: '#6B7280',
    icon: 'chat-bubble',
    order: 10
  }
];

async function seedBlogCategories() {
  try {
    await connectDB();

    console.log('Seeding blog categories...');

    for (const categoryData of defaultCategories) {
      const existingCategory = await BlogCategory.findOne({ slug: categoryData.slug });
      
      if (!existingCategory) {
        const category = new BlogCategory(categoryData);
        await category.save();
        console.log(`Created category: ${categoryData.name}`);
      } else {
        console.log(`Category already exists: ${categoryData.name}`);
      }
    }

    console.log('Blog categories seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog categories:', error);
    process.exit(1);
  }
}

// Run the seeder if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedBlogCategories();
}

export { seedBlogCategories };
