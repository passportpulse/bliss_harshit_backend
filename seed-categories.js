const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    // Create sample categories
    const categories = [
      {
        name: 'Joint Health',
        slug: 'joint-health'
      },
      {
        name: 'Digestive Health',
        slug: 'digestive-health'
      },
      {
        name: 'Immunity Boosters',
        slug: 'immunity-boosters'
      },
      {
        name: 'Skin Care',
        slug: 'skin-care'
      },
      {
        name: 'Mental Wellness',
        slug: 'mental-wellness'
      }
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
    }

    console.log('✅ Categories seeded successfully!');
    
    // List all categories
    const allCategories = await prisma.category.findMany();
    console.log('📋 Available categories:');
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id})`);
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories(); 