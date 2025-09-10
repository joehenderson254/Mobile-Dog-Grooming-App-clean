const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create two demo groomers with one service each
  const u1 = await prisma.user.create({
    data: { role: 'groomer', name: 'Bark & Go', email: 'bark@example.com' }
  });
  const g1 = await prisma.groomer.create({
    data: { userId: u1.id, bio: 'Mobile groomer - friendly, fast', serviceRadiusKm: 30, homeLat: 37.78, homeLng: -122.41 }
  });
  await prisma.service.create({
    data: { groomerId: g1.id, name: 'Full Groom', description: 'Bath + haircut + nails', dogSize: 'M', priceCents: 7500, durationMin: 120 }
  });

  const u2 = await prisma.user.create({
    data: { role: 'groomer', name: 'Pampered Paws', email: 'paws@example.com' }
  });
  const g2 = await prisma.groomer.create({
    data: { userId: u2.id, bio: 'Calm groom for anxious pups', serviceRadiusKm: 20, homeLat: 37.74, homeLng: -122.45 }
  });
  await prisma.service.create({
    data: { groomerId: g2.id, name: 'Bath & Tidy', description: 'Bath + tidy up', dogSize: 'M', priceCents: 4500, durationMin: 60 }
  });

  console.log('Seed complete');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
