require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'password123';
const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // 1. Create Stations (10 stations)
  console.log('Creating stations...');
  const stationsData = [
    { code: 'BEN', name: 'Benin Central', address: 'Ring Road', city: 'Benin', state: 'Edo', country: 'Nigeria', latitude: 6.3350, longitude: 5.6037 },
    { code: 'WAR', name: 'Warri Terminal', address: 'Marine Base', city: 'Warri', state: 'Delta', country: 'Nigeria', latitude: 5.5560, longitude: 5.7934 },
    { code: 'ABJ', name: 'Abuja Main Terminal', address: 'Utako District', city: 'Abuja', state: 'FCT', country: 'Nigeria', latitude: 9.0765, longitude: 7.3986 },
    { code: 'IBA', name: 'Ibadan Motor Park', address: 'Molete', city: 'Ibadan', state: 'Oyo', country: 'Nigeria', latitude: 7.3775, longitude: 3.9470 },
    { code: 'LOS', name: 'Lagos Ojota', address: 'Ojota Bus Stop', city: 'Lagos', state: 'Lagos', country: 'Nigeria', latitude: 6.5875, longitude: 3.3714 },
    { code: 'KAN', name: 'Kano Central', address: 'Sabon Gari', city: 'Kano', state: 'Kano', country: 'Nigeria', latitude: 12.0022, longitude: 8.5920 },
    { code: 'PHC', name: 'Port Harcourt', address: 'Mile 1', city: 'Port Harcourt', state: 'Rivers', country: 'Nigeria', latitude: 4.8156, longitude: 7.0498 },
    { code: 'ENU', name: 'Enugu Park', address: 'Ogbete Main Market', city: 'Enugu', state: 'Enugu', country: 'Nigeria', latitude: 6.4474, longitude: 7.5139 },
    { code: 'KAD', name: 'Kaduna Terminal', address: 'Kawo Junction', city: 'Kaduna', state: 'Kaduna', country: 'Nigeria', latitude: 10.5105, longitude: 7.4165 },
    { code: 'ABK', name: 'Abeokuta Station', address: 'Ibara', city: 'Abeokuta', state: 'Ogun', country: 'Nigeria', latitude: 7.1557, longitude: 3.3451 },
  ];

  const stationMap = {};
  for (const s of stationsData) {
    const station = await prisma.station.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    stationMap[s.code] = station.id;
    console.log(`  ✓ Created station: ${s.name} (${s.code})`);
  }

  // 2. Create Routes (10 routes)
  console.log('\nCreating routes...');
  const routesData = [
    {
      code: 'BEN-WAR',
      name: 'Benin to Warri',
      description: 'Direct route from Benin to Warri',
      distance: 90,
      duration: 120,
      stops: [{ code: 'BEN', order: 1, distance: 0 }, { code: 'WAR', order: 2, distance: 90 }],
      price: 2500,
    },
    {
      code: 'BEN-ABJ',
      name: 'Benin to Abuja',
      description: 'Express route to the capital',
      distance: 450,
      duration: 480,
      stops: [{ code: 'BEN', order: 1, distance: 0 }, { code: 'ABJ', order: 2, distance: 450 }],
      price: 8000,
    },
    {
      code: 'BEN-LOS',
      name: 'Benin to Lagos',
      description: 'Popular commercial route',
      distance: 330,
      duration: 360,
      stops: [{ code: 'BEN', order: 1, distance: 0 }, { code: 'LOS', order: 2, distance: 330 }],
      price: 5500,
    },
    {
      code: 'LOS-ABJ',
      name: 'Lagos to Abuja',
      description: 'Major inter-state route',
      distance: 750,
      duration: 720,
      stops: [{ code: 'LOS', order: 1, distance: 0 }, { code: 'ABJ', order: 2, distance: 750 }],
      price: 12000,
    },
    {
      code: 'LOS-IBA',
      name: 'Lagos to Ibadan',
      description: 'Frequent commuter route',
      distance: 150,
      duration: 180,
      stops: [{ code: 'LOS', order: 1, distance: 0 }, { code: 'IBA', order: 2, distance: 150 }],
      price: 3000,
    },
    {
      code: 'ABJ-KAN',
      name: 'Abuja to Kano',
      description: 'Northern route connection',
      distance: 400,
      duration: 420,
      stops: [{ code: 'ABJ', order: 1, distance: 0 }, { code: 'KAN', order: 2, distance: 400 }],
      price: 7000,
    },
    {
      code: 'PHC-ENU',
      name: 'Port Harcourt to Enugu',
      description: 'East-bound route',
      distance: 200,
      duration: 240,
      stops: [{ code: 'PHC', order: 1, distance: 0 }, { code: 'ENU', order: 2, distance: 200 }],
      price: 4500,
    },
    {
      code: 'KAN-KAD',
      name: 'Kano to Kaduna',
      description: 'Northern inter-city route',
      distance: 180,
      duration: 210,
      stops: [{ code: 'KAN', order: 1, distance: 0 }, { code: 'KAD', order: 2, distance: 180 }],
      price: 4000,
    },
    {
      code: 'LOS-ABK',
      name: 'Lagos to Abeokuta',
      description: 'Short commuter route',
      distance: 100,
      duration: 120,
      stops: [{ code: 'LOS', order: 1, distance: 0 }, { code: 'ABK', order: 2, distance: 100 }],
      price: 2500,
    },
    {
      code: 'IBA-ABK',
      name: 'Ibadan to Abeokuta',
      description: 'Ogun-Oyo connection',
      distance: 80,
      duration: 90,
      stops: [{ code: 'IBA', order: 1, distance: 0 }, { code: 'ABK', order: 2, distance: 80 }],
      price: 2000,
    },
  ];

  const routeMap = {};
  for (const r of routesData) {
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

    // Create route schedule (skip if table doesn't exist)
    try {
      await prisma.routeSchedule.upsert({
        where: { routeId: route.id },
        update: { price: r.price, startTime: '06:00', endTime: '18:00', interval: 60 },
        create: {
          routeId: route.id,
          price: r.price,
          startTime: '06:00',
          endTime: '18:00',
          interval: 60,
          isActive: true,
        },
      });
    } catch (error) {
      // RouteSchedule table may not exist, skip it
      console.log(`    ⚠ Skipping route schedule for ${r.code} (table may not exist)`);
    }

    // Reset and create stops
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

    routeMap[r.code] = route.id;
    console.log(`  ✓ Created route: ${r.name} (${r.code})`);
  }

  // 3. Create Buses (10 buses)
  console.log('\nCreating buses...');
  const busesData = [
    { plateNumber: 'EL-001-ABC', vehicleType: 'Bus', model: 'Mercedes Sprinter', manufacturer: 'Mercedes', year: 2022, capacity: 18 },
    { plateNumber: 'EL-002-XYZ', vehicleType: 'Bus', model: 'Toyota Hiace', manufacturer: 'Toyota', year: 2021, capacity: 18 },
    { plateNumber: 'EL-003-LMN', vehicleType: 'Bus', model: 'Ford Transit', manufacturer: 'Ford', year: 2023, capacity: 18 },
    { plateNumber: 'EL-004-DEF', vehicleType: 'Sienna', model: 'Toyota Sienna', manufacturer: 'Toyota', year: 2022, capacity: 8 },
    { plateNumber: 'EL-005-GHI', vehicleType: 'Bus', model: 'Mercedes Sprinter', manufacturer: 'Mercedes', year: 2021, capacity: 18 },
    { plateNumber: 'EL-006-JKL', vehicleType: 'Sienna', model: 'Toyota Sienna', manufacturer: 'Toyota', year: 2023, capacity: 8 },
    { plateNumber: 'EL-007-MNO', vehicleType: 'Bus', model: 'Nissan Urvan', manufacturer: 'Nissan', year: 2022, capacity: 18 },
    { plateNumber: 'EL-008-PQR', vehicleType: 'Bus', model: 'Toyota Hiace', manufacturer: 'Toyota', year: 2023, capacity: 18 },
    { plateNumber: 'EL-009-STU', vehicleType: 'Sienna', model: 'Toyota Sienna', manufacturer: 'Toyota', year: 2021, capacity: 8 },
    { plateNumber: 'EL-010-VWX', vehicleType: 'Bus', model: 'Mercedes Sprinter', manufacturer: 'Mercedes', year: 2022, capacity: 18 },
  ];

  const busMap = {};
  const now = new Date();
  const lastMaintenance = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const nextMaintenance = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now

  for (const b of busesData) {
    const seatLayout = JSON.stringify(
      Array.from({ length: b.capacity }, (_, i) => ({
        seatNumber: `${i + 1}`,
        position: i < b.capacity / 2 ? 'left' : 'right',
      }))
    );

    const bus = await prisma.bus.upsert({
      where: { plateNumber: b.plateNumber },
      update: {
        vehicleType: b.vehicleType,
        model: b.model,
        manufacturer: b.manufacturer,
        year: b.year,
        capacity: b.capacity,
        seatLayout,
        mileage: Math.random() * 50000 + 10000,
        lastMaintenance,
        nextMaintenance,
        isActive: true,
      },
      create: {
        plateNumber: b.plateNumber,
        vehicleType: b.vehicleType,
        model: b.model,
        manufacturer: b.manufacturer,
        year: b.year,
        capacity: b.capacity,
        seatLayout,
        mileage: Math.random() * 50000 + 10000,
        lastMaintenance,
        nextMaintenance,
        isActive: true,
      },
    });
    busMap[b.plateNumber] = bus.id;
    console.log(`  ✓ Created bus: ${b.plateNumber} (${b.model})`);
  }

  // 4. Create Drivers (10 drivers)
  console.log('\nCreating drivers...');
  const driversData = [
    { firstName: 'John', lastName: 'Okafor', phoneNumber: '08012345678', driversLicense: 'DL-001-2020', dateOfBirth: '1985-05-15', bloodGroup: 'O+', yearsInService: 5, rating: 4.8, totalTrips: 120 },
    { firstName: 'Michael', lastName: 'Eze', phoneNumber: '08023456789', driversLicense: 'DL-002-2020', dateOfBirth: '1988-08-20', bloodGroup: 'A+', yearsInService: 3, rating: 4.6, totalTrips: 85 },
    { firstName: 'David', lastName: 'Musa', phoneNumber: '08034567890', driversLicense: 'DL-003-2021', dateOfBirth: '1990-03-10', bloodGroup: 'B+', yearsInService: 2, rating: 4.9, totalTrips: 95 },
    { firstName: 'James', lastName: 'Adebayo', phoneNumber: '08045678901', driversLicense: 'DL-004-2019', dateOfBirth: '1983-11-25', bloodGroup: 'O-', yearsInService: 7, rating: 4.7, totalTrips: 150 },
    { firstName: 'Peter', lastName: 'Okonkwo', phoneNumber: '08056789012', driversLicense: 'DL-005-2022', dateOfBirth: '1992-07-05', bloodGroup: 'AB+', yearsInService: 1, rating: 4.5, totalTrips: 45 },
    { firstName: 'Paul', lastName: 'Ibrahim', phoneNumber: '08067890123', driversLicense: 'DL-006-2020', dateOfBirth: '1987-09-12', bloodGroup: 'A-', yearsInService: 4, rating: 4.8, totalTrips: 110 },
    { firstName: 'Andrew', lastName: 'Danjuma', phoneNumber: '08078901234', driversLicense: 'DL-007-2021', dateOfBirth: '1989-02-18', bloodGroup: 'O+', yearsInService: 2, rating: 4.6, totalTrips: 78 },
    { firstName: 'Philip', lastName: 'Obi', phoneNumber: '08089012345', driversLicense: 'DL-008-2019', dateOfBirth: '1984-12-30', bloodGroup: 'B-', yearsInService: 6, rating: 4.9, totalTrips: 135 },
    { firstName: 'Thomas', lastName: 'Yusuf', phoneNumber: '08090123456', driversLicense: 'DL-009-2022', dateOfBirth: '1991-06-22', bloodGroup: 'A+', yearsInService: 1, rating: 4.4, totalTrips: 40 },
    { firstName: 'Matthew', lastName: 'Bello', phoneNumber: '08001234567', driversLicense: 'DL-010-2020', dateOfBirth: '1986-04-08', bloodGroup: 'O+', yearsInService: 5, rating: 4.7, totalTrips: 125 },
  ];

  const driverMap = {};
  const licenseExpiryDate = new Date();
  licenseExpiryDate.setFullYear(licenseExpiryDate.getFullYear() + 2);

  for (const d of driversData) {
    const driver = await prisma.driver.upsert({
      where: { driversLicense: d.driversLicense },
      update: {
        firstName: d.firstName,
        lastName: d.lastName,
        phoneNumber: d.phoneNumber,
        dateOfBirth: new Date(d.dateOfBirth),
        licenseExpiryDate,
        bloodGroup: d.bloodGroup,
        nextOfKinName: `${d.firstName} ${d.lastName} Family`,
        nextOfKinPhone: `080${Math.floor(Math.random() * 100000000)}`,
        nextOfKinRelation: 'Brother',
        homeAddress: `${d.lastName} Street, ${d.firstName} City`,
        yearsInService: d.yearsInService,
        rating: d.rating,
        totalTrips: d.totalTrips,
        onTimeRate: 85 + Math.random() * 15,
        totalEarnings: d.totalTrips * 5000,
        isActive: true,
      },
      create: {
        firstName: d.firstName,
        lastName: d.lastName,
        phoneNumber: d.phoneNumber,
        dateOfBirth: new Date(d.dateOfBirth),
        driversLicense: d.driversLicense,
        licenseExpiryDate,
        bloodGroup: d.bloodGroup,
        nextOfKinName: `${d.firstName} ${d.lastName} Family`,
        nextOfKinPhone: `080${Math.floor(Math.random() * 100000000)}`,
        nextOfKinRelation: 'Brother',
        homeAddress: `${d.lastName} Street, ${d.firstName} City`,
        yearsInService: d.yearsInService,
        rating: d.rating,
        totalTrips: d.totalTrips,
        onTimeRate: 85 + Math.random() * 15,
        totalEarnings: d.totalTrips * 5000,
        isActive: true,
      },
    });
    driverMap[d.driversLicense] = driver.id;
    console.log(`  ✓ Created driver: ${d.firstName} ${d.lastName} (${d.driversLicense})`);
  }

  // 5. Create Users (20 users with different roles)
  console.log('\nCreating users...');
  const usersData = [
    // Admin and Staff
    { email: 'admin@eagleline.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', phone: '08011111111' },
    { email: 'staff1@eagleline.com', firstName: 'Staff', lastName: 'One', role: 'STAFF', phone: '08022222222' },
    { email: 'staff2@eagleline.com', firstName: 'Staff', lastName: 'Two', role: 'STAFF', phone: '08033333333' },
    { email: 'storekeeper@eagleline.com', firstName: 'Store', lastName: 'Keeper', role: 'STORE_KEEPER', phone: '08044444444' },
    
    // Drivers (link to driver records)
    { email: 'driver1@eagleline.com', firstName: 'John', lastName: 'Okafor', role: 'DRIVER', phone: '08012345678', driverLicense: 'DL-001-2020' },
    { email: 'driver2@eagleline.com', firstName: 'Michael', lastName: 'Eze', role: 'DRIVER', phone: '08023456789', driverLicense: 'DL-002-2020' },
    { email: 'driver3@eagleline.com', firstName: 'David', lastName: 'Musa', role: 'DRIVER', phone: '08034567890', driverLicense: 'DL-003-2021' },
    
    // Regular Riders
    { email: 'rider1@example.com', firstName: 'Mary', lastName: 'Johnson', role: 'RIDER', phone: '08111111111' },
    { email: 'rider2@example.com', firstName: 'Sarah', lastName: 'Williams', role: 'RIDER', phone: '08122222222' },
    { email: 'rider3@example.com', firstName: 'Grace', lastName: 'Brown', role: 'RIDER', phone: '08133333333' },
    { email: 'rider4@example.com', firstName: 'Faith', lastName: 'Jones', role: 'RIDER', phone: '08144444444' },
    { email: 'rider5@example.com', firstName: 'Hope', lastName: 'Garcia', role: 'RIDER', phone: '08155555555' },
    { email: 'rider6@example.com', firstName: 'Joy', lastName: 'Miller', role: 'RIDER', phone: '08166666666' },
    { email: 'rider7@example.com', firstName: 'Peace', lastName: 'Davis', role: 'RIDER', phone: '08177777777' },
    { email: 'rider8@example.com', firstName: 'Love', lastName: 'Rodriguez', role: 'RIDER', phone: '08188888888' },
    { email: 'rider9@example.com', firstName: 'Mercy', lastName: 'Martinez', role: 'RIDER', phone: '08199999999' },
    { email: 'rider10@example.com', firstName: 'Blessing', lastName: 'Hernandez', role: 'RIDER', phone: '08100000000' },
    { email: 'rider11@example.com', firstName: 'Favour', lastName: 'Lopez', role: 'RIDER', phone: '08211111111' },
    { email: 'rider12@example.com', firstName: 'Wisdom', lastName: 'Gonzalez', role: 'RIDER', phone: '08222222222' },
    { email: 'rider13@example.com', firstName: 'Victory', lastName: 'Wilson', role: 'RIDER', phone: '08233333333' },
  ];

  const userMap = {};
  for (const u of usersData) {
    let driverId = null;
    if (u.driverLicense && driverMap[u.driverLicense]) {
      driverId = driverMap[u.driverLicense];
    }

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        driverId,
      },
      create: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        driverId,
        loyaltyPoints: u.role === 'RIDER' ? Math.floor(Math.random() * 500) : 0,
      },
    });
    userMap[u.email] = user.id;
    console.log(`  ✓ Created user: ${u.email} (${u.role})`);
  }

  // 6. Create Trips (20 trips)
  console.log('\nCreating trips...');
  const routeCodes = Object.keys(routeMap);
  const busPlateNumbers = Object.keys(busMap);
  const driverLicenses = Object.keys(driverMap);

  const trips = [];
  for (let i = 0; i < 20; i++) {
    const routeCode = routeCodes[i % routeCodes.length];
    const route = routesData.find(r => r.code === routeCode);
    const originCode = route.stops[0].code;
    const destinationCode = route.stops[route.stops.length - 1].code;

    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + Math.floor(i / 5)); // Spread over 4 days
    departureDate.setHours(6 + (i % 5) * 3, 0, 0, 0); // Different times throughout the day

    const arrivalDate = new Date(departureDate);
    arrivalDate.setMinutes(arrivalDate.getMinutes() + route.duration);

    const busPlate = busPlateNumbers[i % busPlateNumbers.length];
    const driverLicense = driverLicenses[i % driverLicenses.length];

    const trip = await prisma.trip.create({
      data: {
        routeId: routeMap[routeCode],
        busId: busMap[busPlate],
        driverId: driverMap[driverLicense],
        originId: stationMap[originCode],
        destinationId: stationMap[destinationCode],
        departureTime: departureDate,
        arrivalTime: arrivalDate,
        price: route.price,
        status: i < 10 ? 'SCHEDULED' : i < 15 ? 'IN_PROGRESS' : 'COMPLETED',
        passengerCount: i >= 15 ? Math.floor(Math.random() * 15) + 5 : 0,
      },
    });

    // Create seats for the trip
    const bus = busesData.find(b => b.plateNumber === busPlate);
    for (let seatNum = 1; seatNum <= bus.capacity; seatNum++) {
      await prisma.seat.create({
        data: {
          tripId: trip.id,
          seatNumber: `${seatNum}`,
          status: i >= 15 && seatNum <= trip.passengerCount ? 'OCCUPIED' : 'AVAILABLE',
        },
      });
    }

    trips.push(trip);
    console.log(`  ✓ Created trip: ${route.name} on ${departureDate.toLocaleDateString()}`);
  }

  // 7. Create Bookings (15 bookings)
  console.log('\nCreating bookings...');
  const riderEmails = usersData.filter(u => u.role === 'RIDER').map(u => u.email);
  const completedTrips = trips.filter(t => t.status === 'COMPLETED' || t.status === 'IN_PROGRESS').slice(0, 15);

  for (let i = 0; i < 15 && i < completedTrips.length; i++) {
    const trip = completedTrips[i];
    const riderEmail = riderEmails[i % riderEmails.length];
    const rider = await prisma.user.findUnique({ where: { email: riderEmail } });

    const seatCount = Math.floor(Math.random() * 3) + 1; // 1-3 seats
    const seatNumbers = [];
    for (let j = 1; j <= seatCount && j <= 18; j++) {
      seatNumbers.push(`${j}`);
    }

    const booking = await prisma.booking.create({
      data: {
        userId: rider.id,
        tripId: trip.id,
        seatNumbers,
        passengerName: `${rider.firstName} ${rider.lastName}`,
        passengerPhone: rider.phone || '08000000000',
        passengerEmail: rider.email,
        totalAmount: trip.price * seatCount,
        status: i < 10 ? 'CONFIRMED' : 'COMPLETED',
        paymentMethod: ['CASH', 'CARD', 'TRANSFER'][Math.floor(Math.random() * 3)],
        paymentStatus: 'PAID',
        ticketNumber: `TKT-${Date.now()}-${i}`,
        qrCode: `QR-${Date.now()}-${i}`,
        checkedIn: i >= 10,
      },
    });

    // Update seats to occupied
    for (const seatNum of seatNumbers) {
      await prisma.seat.updateMany({
        where: { tripId: trip.id, seatNumber: seatNum },
        data: { status: 'OCCUPIED', bookingId: booking.id },
      });
    }

    console.log(`  ✓ Created booking: ${booking.ticketNumber} for ${rider.firstName} ${rider.lastName}`);
  }

  // 8. Create Inventory Items (10 items)
  console.log('\nCreating inventory items...');
  const inventoryItems = [
    { name: 'Engine Oil (5L)', category: 'Fluids', unit: 'liters', quantity: 50, minQuantity: 20, unitPrice: 3500 },
    { name: 'Brake Pads', category: 'Spare Parts', unit: 'pieces', quantity: 30, minQuantity: 15, unitPrice: 8000 },
    { name: 'Air Filter', category: 'Spare Parts', unit: 'pieces', quantity: 25, minQuantity: 10, unitPrice: 2500 },
    { name: 'Tire (185/65R15)', category: 'Spare Parts', unit: 'pieces', quantity: 12, minQuantity: 6, unitPrice: 25000 },
    { name: 'Battery (12V)', category: 'Spare Parts', unit: 'pieces', quantity: 8, minQuantity: 4, unitPrice: 45000 },
    { name: 'Coolant (4L)', category: 'Fluids', unit: 'liters', quantity: 40, minQuantity: 20, unitPrice: 2000 },
    { name: 'Wiper Blades', category: 'Spare Parts', unit: 'pairs', quantity: 20, minQuantity: 10, unitPrice: 3000 },
    { name: 'Fuse Set', category: 'Supplies', unit: 'pack', quantity: 15, minQuantity: 5, unitPrice: 1500 },
    { name: 'Spark Plugs', category: 'Spare Parts', unit: 'pieces', quantity: 35, minQuantity: 20, unitPrice: 1200 },
    { name: 'First Aid Kit', category: 'Supplies', unit: 'pack', quantity: 10, minQuantity: 5, unitPrice: 5000 },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        unitPrice: item.unitPrice,
        location: 'Warehouse A',
        isActive: true,
      },
    });
    console.log(`  ✓ Created inventory item: ${item.name}`);
  }

  console.log('\n✅ Comprehensive seed completed successfully!');
  console.log('\nSummary:');
  console.log(`  - ${stationsData.length} Stations`);
  console.log(`  - ${routesData.length} Routes`);
  console.log(`  - ${busesData.length} Buses`);
  console.log(`  - ${driversData.length} Drivers`);
  console.log(`  - ${usersData.length} Users`);
  console.log(`  - ${trips.length} Trips`);
  console.log(`  - 15 Bookings`);
  console.log(`  - ${inventoryItems.length} Inventory Items`);
  console.log(`\nDefault password for all users: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

