import { PrismaClient, Language } from '@prisma/client';

// Prisma 7 reads DATABASE_URL from environment automatically
// Make sure .env file is in the backend directory
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default boards
  const boards = [
    {
      name: 'Review Board',
      slug: 'review',
      description: 'Share your beauty treatment reviews',
      isActive: true,
    },
    {
      name: 'Assessment Board',
      slug: 'assessment',
      description: 'Assess and discuss beauty products and treatments',
      isActive: true,
    },
    {
      name: 'Talk Board',
      slug: 'talk',
      description: 'General discussions about beauty and treatments',
      isActive: true,
    },
  ];

  for (const board of boards) {
    const existing = await prisma.board.findUnique({
      where: { slug: board.slug },
    });

    if (!existing) {
      await prisma.board.create({
        data: board,
      });
      console.log(`✅ Created board: ${board.name}`);
    } else {
      console.log(`⏭️  Board already exists: ${board.name}`);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

