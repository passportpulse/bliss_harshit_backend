const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log('No categories found. Please seed categories first.');
    return;
  }

  const sampleBlogs = categories.map((cat, idx) => ({
    title: `Sample Blog for ${cat.name}`,
    slug: `sample-blog-${cat.slug}`,
    content: `This is a sample blog post for the category ${cat.name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Blog #${idx + 1}.`,
    image: 'https://vediherbals.com/cdn/shop/files/Buy-Vedi-Herbals-Vijaya-Ghrita-Holistic-Ayurvedic-Medicine.jpg?v=1718596240',
    status: 'PUBLISHED',
    publishedAt: new Date(),
    readingTime: 5 + idx,
    categoryId: cat.id,
  }));

  for (const blog of sampleBlogs) {
    await prisma.blog.create({ data: blog });
    console.log(`Created blog: ${blog.title}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 