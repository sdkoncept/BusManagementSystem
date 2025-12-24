require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const stationsData = [
    { code: 'BEN', name: 'Benin', address: 'Central Park', city: 'Benin', country: 'Nigeria' },
    { code: 'WAR', name: 'Warri', address: 'Central Park', city: 'Warri', country: 'Nigeria' },
    { code: 'ABJ', name: 'Abuja', address: 'Central Park', city: 'Abuja', country: 'Nigeria' },
    { code: 'IBA', name: 'Ibadan', address: 'Central Park', city: 'Ibadan', country: 'Nigeria' },
    { code: 'LOS', name: 'Lagos', address: 'Ojota', city: 'Lagos', country: 'Nigeria' },
  ];

  const stationMap = {};
  for (const s of stationsData) {
    const station = await prisma.station.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        address: s.address,
        city: s.city,
        country: s.country,
      },
      create: {
        code: s.code,
        name: s.name,
        address: s.address,
        city: s.city,
        country: s.country,
      },
    });
    stationMap[s.code] = station.id;
  }

  const routes = [
    {
      code: 'BEN-WAR',
      name: 'Benin to Warri',
      description: 'Benin → Warri',
      distance: 90,
      duration: 120,
      stops: [
        { code: 'BEN', order: 1, distance: 0 },
        { code: 'WAR', order: 2, distance: 90 },
      ],
    },
    {
      code: 'BEN-ABJ',
      name: 'Benin to Abuja',
      description: 'Benin → Abuja',
      distance: 450,
      duration: 480,
      stops: [
        { code: 'BEN', order: 1, distance: 0 },
        { code: 'ABJ', order: 2, distance: 450 },
      ],
    },
    {
      code: 'BEN-IBA',
      name: 'Benin to Ibadan',
      description: 'Benin → Ibadan',
      distance: 320,
      duration: 360,
      stops: [
        { code: 'BEN', order: 1, distance: 0 },
        { code: 'IBA', order: 2, distance: 320 },
      ],
    },
    {
      code: 'BEN-LOS',
      name: 'Benin to Lagos',
      description: 'Benin → Lagos',
      distance: 330,
      duration: 360,
      stops: [
        { code: 'BEN', order: 1, distance: 0 },
        { code: 'LOS', order: 2, distance: 330 },
      ],
    },
  ];

  for (const r of routes) {
    const route = await prisma.route.upsert({
      where: { code: r.code },
      update: {
        name: r.name,
        description: r.description,
        distance: r.distance,
        duration: r.duration,
        isActive: true,
      },
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        distance: r.distance,
        duration: r.duration,
        isActive: true,
      },
    });

    // reset stops
    await prisma.routeStation.deleteMany({ where: { routeId: route.id } });

    for (const stop of r.stops) {
      const stationId = stationMap[stop.code];
      if (!stationId) continue;
      await prisma.routeStation.create({
        data: {
          routeId: route.id,
          stationId,
          order: stop.order,
          distance: stop.distance,
        },
      });
    }
  }

  console.log('Seed completed: stations and routes with distances/durations added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


