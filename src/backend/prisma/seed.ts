import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { adminAssignmentService } from '../src/services/AdminAssignmentService';
import { getPrismaClient } from '../src/utils/prisma';

const prisma = getPrismaClient();

// ─── 150 Indian Cities ───────────────────────────────────────────────────────
const INDIAN_CITIES = [
// Rajasthan
{
  slug: 'jaipur',
  name: 'Jaipur',
  state: 'Rajasthan'
}, {
  slug: 'jodhpur',
  name: 'Jodhpur',
  state: 'Rajasthan'
}, {
  slug: 'kota',
  name: 'Kota',
  state: 'Rajasthan'
}, {
  slug: 'bikaner',
  name: 'Bikaner',
  state: 'Rajasthan'
}, {
  slug: 'ajmer',
  name: 'Ajmer',
  state: 'Rajasthan'
}, {
  slug: 'udaipur',
  name: 'Udaipur',
  state: 'Rajasthan'
}, {
  slug: 'bhilwara',
  name: 'Bhilwara',
  state: 'Rajasthan'
}, {
  slug: 'alwar',
  name: 'Alwar',
  state: 'Rajasthan'
},
// Maharashtra
{
  slug: 'mumbai',
  name: 'Mumbai',
  state: 'Maharashtra'
}, {
  slug: 'pune',
  name: 'Pune',
  state: 'Maharashtra'
}, {
  slug: 'nagpur',
  name: 'Nagpur',
  state: 'Maharashtra'
}, {
  slug: 'nashik',
  name: 'Nashik',
  state: 'Maharashtra'
}, {
  slug: 'aurangabad',
  name: 'Aurangabad',
  state: 'Maharashtra'
}, {
  slug: 'solapur',
  name: 'Solapur',
  state: 'Maharashtra'
}, {
  slug: 'amravati',
  name: 'Amravati',
  state: 'Maharashtra'
}, {
  slug: 'kolhapur',
  name: 'Kolhapur',
  state: 'Maharashtra'
}, {
  slug: 'navi-mumbai',
  name: 'Navi Mumbai',
  state: 'Maharashtra'
}, {
  slug: 'thane',
  name: 'Thane',
  state: 'Maharashtra'
},
// Delhi / NCR
{
  slug: 'delhi',
  name: 'Delhi',
  state: 'Delhi'
}, {
  slug: 'noida',
  name: 'Noida',
  state: 'Uttar Pradesh'
}, {
  slug: 'gurgaon',
  name: 'Gurgaon',
  state: 'Haryana'
}, {
  slug: 'faridabad',
  name: 'Faridabad',
  state: 'Haryana'
}, {
  slug: 'ghaziabad',
  name: 'Ghaziabad',
  state: 'Uttar Pradesh'
},
// Karnataka
{
  slug: 'bangalore',
  name: 'Bangalore',
  state: 'Karnataka'
}, {
  slug: 'mysore',
  name: 'Mysore',
  state: 'Karnataka'
}, {
  slug: 'hubli',
  name: 'Hubli',
  state: 'Karnataka'
}, {
  slug: 'mangalore',
  name: 'Mangalore',
  state: 'Karnataka'
}, {
  slug: 'belgaum',
  name: 'Belgaum',
  state: 'Karnataka'
}, {
  slug: 'gulbarga',
  name: 'Gulbarga',
  state: 'Karnataka'
}, {
  slug: 'davanagere',
  name: 'Davanagere',
  state: 'Karnataka'
}, {
  slug: 'shimoga',
  name: 'Shimoga',
  state: 'Karnataka'
},
// Tamil Nadu
{
  slug: 'chennai',
  name: 'Chennai',
  state: 'Tamil Nadu'
}, {
  slug: 'coimbatore',
  name: 'Coimbatore',
  state: 'Tamil Nadu'
}, {
  slug: 'madurai',
  name: 'Madurai',
  state: 'Tamil Nadu'
}, {
  slug: 'tiruchirappalli',
  name: 'Tiruchirappalli',
  state: 'Tamil Nadu'
}, {
  slug: 'salem',
  name: 'Salem',
  state: 'Tamil Nadu'
}, {
  slug: 'tirunelveli',
  name: 'Tirunelveli',
  state: 'Tamil Nadu'
}, {
  slug: 'tiruppur',
  name: 'Tiruppur',
  state: 'Tamil Nadu'
}, {
  slug: 'vellore',
  name: 'Vellore',
  state: 'Tamil Nadu'
}, {
  slug: 'erode',
  name: 'Erode',
  state: 'Tamil Nadu'
},
// Telangana
{
  slug: 'hyderabad',
  name: 'Hyderabad',
  state: 'Telangana'
}, {
  slug: 'warangal',
  name: 'Warangal',
  state: 'Telangana'
}, {
  slug: 'nizamabad',
  name: 'Nizamabad',
  state: 'Telangana'
}, {
  slug: 'karimnagar',
  name: 'Karimnagar',
  state: 'Telangana'
}, {
  slug: 'khammam',
  name: 'Khammam',
  state: 'Telangana'
},
// Andhra Pradesh
{
  slug: 'visakhapatnam',
  name: 'Visakhapatnam',
  state: 'Andhra Pradesh'
}, {
  slug: 'vijayawada',
  name: 'Vijayawada',
  state: 'Andhra Pradesh'
}, {
  slug: 'guntur',
  name: 'Guntur',
  state: 'Andhra Pradesh'
}, {
  slug: 'nellore',
  name: 'Nellore',
  state: 'Andhra Pradesh'
}, {
  slug: 'kurnool',
  name: 'Kurnool',
  state: 'Andhra Pradesh'
}, {
  slug: 'rajahmundry',
  name: 'Rajahmundry',
  state: 'Andhra Pradesh'
}, {
  slug: 'tirupati',
  name: 'Tirupati',
  state: 'Andhra Pradesh'
}, {
  slug: 'kakinada',
  name: 'Kakinada',
  state: 'Andhra Pradesh'
},
// Gujarat
{
  slug: 'ahmedabad',
  name: 'Ahmedabad',
  state: 'Gujarat'
}, {
  slug: 'surat',
  name: 'Surat',
  state: 'Gujarat'
}, {
  slug: 'vadodara',
  name: 'Vadodara',
  state: 'Gujarat'
}, {
  slug: 'rajkot',
  name: 'Rajkot',
  state: 'Gujarat'
}, {
  slug: 'bhavnagar',
  name: 'Bhavnagar',
  state: 'Gujarat'
}, {
  slug: 'jamnagar',
  name: 'Jamnagar',
  state: 'Gujarat'
}, {
  slug: 'junagadh',
  name: 'Junagadh',
  state: 'Gujarat'
}, {
  slug: 'gandhinagar',
  name: 'Gandhinagar',
  state: 'Gujarat'
},
// Uttar Pradesh
{
  slug: 'lucknow',
  name: 'Lucknow',
  state: 'Uttar Pradesh'
}, {
  slug: 'kanpur',
  name: 'Kanpur',
  state: 'Uttar Pradesh'
}, {
  slug: 'agra',
  name: 'Agra',
  state: 'Uttar Pradesh'
}, {
  slug: 'varanasi',
  name: 'Varanasi',
  state: 'Uttar Pradesh'
}, {
  slug: 'meerut',
  name: 'Meerut',
  state: 'Uttar Pradesh'
}, {
  slug: 'allahabad',
  name: 'Allahabad',
  state: 'Uttar Pradesh'
}, {
  slug: 'bareilly',
  name: 'Bareilly',
  state: 'Uttar Pradesh'
}, {
  slug: 'aligarh',
  name: 'Aligarh',
  state: 'Uttar Pradesh'
}, {
  slug: 'moradabad',
  name: 'Moradabad',
  state: 'Uttar Pradesh'
}, {
  slug: 'gorakhpur',
  name: 'Gorakhpur',
  state: 'Uttar Pradesh'
}, {
  slug: 'firozabad',
  name: 'Firozabad',
  state: 'Uttar Pradesh'
}, {
  slug: 'mathura',
  name: 'Mathura',
  state: 'Uttar Pradesh'
},
// West Bengal
{
  slug: 'kolkata',
  name: 'Kolkata',
  state: 'West Bengal'
}, {
  slug: 'howrah',
  name: 'Howrah',
  state: 'West Bengal'
}, {
  slug: 'durgapur',
  name: 'Durgapur',
  state: 'West Bengal'
}, {
  slug: 'asansol',
  name: 'Asansol',
  state: 'West Bengal'
}, {
  slug: 'siliguri',
  name: 'Siliguri',
  state: 'West Bengal'
}, {
  slug: 'bardhaman',
  name: 'Bardhaman',
  state: 'West Bengal'
},
// Madhya Pradesh
{
  slug: 'bhopal',
  name: 'Bhopal',
  state: 'Madhya Pradesh'
}, {
  slug: 'indore',
  name: 'Indore',
  state: 'Madhya Pradesh'
}, {
  slug: 'jabalpur',
  name: 'Jabalpur',
  state: 'Madhya Pradesh'
}, {
  slug: 'gwalior',
  name: 'Gwalior',
  state: 'Madhya Pradesh'
}, {
  slug: 'ujjain',
  name: 'Ujjain',
  state: 'Madhya Pradesh'
}, {
  slug: 'sagar',
  name: 'Sagar',
  state: 'Madhya Pradesh'
}, {
  slug: 'dewas',
  name: 'Dewas',
  state: 'Madhya Pradesh'
}, {
  slug: 'satna',
  name: 'Satna',
  state: 'Madhya Pradesh'
},
// Bihar
{
  slug: 'patna',
  name: 'Patna',
  state: 'Bihar'
}, {
  slug: 'gaya',
  name: 'Gaya',
  state: 'Bihar'
}, {
  slug: 'bhagalpur',
  name: 'Bhagalpur',
  state: 'Bihar'
}, {
  slug: 'muzaffarpur',
  name: 'Muzaffarpur',
  state: 'Bihar'
}, {
  slug: 'purnia',
  name: 'Purnia',
  state: 'Bihar'
},
// Odisha
{
  slug: 'bhubaneswar',
  name: 'Bhubaneswar',
  state: 'Odisha'
}, {
  slug: 'cuttack',
  name: 'Cuttack',
  state: 'Odisha'
}, {
  slug: 'rourkela',
  name: 'Rourkela',
  state: 'Odisha'
}, {
  slug: 'brahmapur',
  name: 'Brahmapur',
  state: 'Odisha'
}, {
  slug: 'sambalpur',
  name: 'Sambalpur',
  state: 'Odisha'
},
// Punjab
{
  slug: 'ludhiana',
  name: 'Ludhiana',
  state: 'Punjab'
}, {
  slug: 'amritsar',
  name: 'Amritsar',
  state: 'Punjab'
}, {
  slug: 'jalandhar',
  name: 'Jalandhar',
  state: 'Punjab'
}, {
  slug: 'patiala',
  name: 'Patiala',
  state: 'Punjab'
}, {
  slug: 'bathinda',
  name: 'Bathinda',
  state: 'Punjab'
}, {
  slug: 'mohali',
  name: 'Mohali',
  state: 'Punjab'
},
// Haryana
{
  slug: 'panipat',
  name: 'Panipat',
  state: 'Haryana'
}, {
  slug: 'ambala',
  name: 'Ambala',
  state: 'Haryana'
}, {
  slug: 'yamunanagar',
  name: 'Yamunanagar',
  state: 'Haryana'
}, {
  slug: 'rohtak',
  name: 'Rohtak',
  state: 'Haryana'
}, {
  slug: 'hisar',
  name: 'Hisar',
  state: 'Haryana'
},
// Kerala
{
  slug: 'thiruvananthapuram',
  name: 'Thiruvananthapuram',
  state: 'Kerala'
}, {
  slug: 'kochi',
  name: 'Kochi',
  state: 'Kerala'
}, {
  slug: 'kozhikode',
  name: 'Kozhikode',
  state: 'Kerala'
}, {
  slug: 'thrissur',
  name: 'Thrissur',
  state: 'Kerala'
}, {
  slug: 'kollam',
  name: 'Kollam',
  state: 'Kerala'
}, {
  slug: 'palakkad',
  name: 'Palakkad',
  state: 'Kerala'
}, {
  slug: 'alappuzha',
  name: 'Alappuzha',
  state: 'Kerala'
},
// Jharkhand
{
  slug: 'ranchi',
  name: 'Ranchi',
  state: 'Jharkhand'
}, {
  slug: 'jamshedpur',
  name: 'Jamshedpur',
  state: 'Jharkhand'
}, {
  slug: 'dhanbad',
  name: 'Dhanbad',
  state: 'Jharkhand'
}, {
  slug: 'bokaro',
  name: 'Bokaro',
  state: 'Jharkhand'
},
// Chhattisgarh
{
  slug: 'raipur',
  name: 'Raipur',
  state: 'Chhattisgarh'
}, {
  slug: 'bhilai',
  name: 'Bhilai',
  state: 'Chhattisgarh'
}, {
  slug: 'bilaspur',
  name: 'Bilaspur',
  state: 'Chhattisgarh'
}, {
  slug: 'korba',
  name: 'Korba',
  state: 'Chhattisgarh'
},
// Assam
{
  slug: 'guwahati',
  name: 'Guwahati',
  state: 'Assam'
}, {
  slug: 'silchar',
  name: 'Silchar',
  state: 'Assam'
}, {
  slug: 'dibrugarh',
  name: 'Dibrugarh',
  state: 'Assam'
},
// Uttarakhand
{
  slug: 'dehradun',
  name: 'Dehradun',
  state: 'Uttarakhand'
}, {
  slug: 'haridwar',
  name: 'Haridwar',
  state: 'Uttarakhand'
}, {
  slug: 'roorkee',
  name: 'Roorkee',
  state: 'Uttarakhand'
}, {
  slug: 'haldwani',
  name: 'Haldwani',
  state: 'Uttarakhand'
},
// Himachal Pradesh
{
  slug: 'shimla',
  name: 'Shimla',
  state: 'Himachal Pradesh'
}, {
  slug: 'dharamsala',
  name: 'Dharamsala',
  state: 'Himachal Pradesh'
}, {
  slug: 'solan',
  name: 'Solan',
  state: 'Himachal Pradesh'
}, {
  slug: 'mandi',
  name: 'Mandi',
  state: 'Himachal Pradesh'
},
// Goa
{
  slug: 'panaji',
  name: 'Panaji',
  state: 'Goa'
}, {
  slug: 'margao',
  name: 'Margao',
  state: 'Goa'
}, {
  slug: 'vasco-da-gama',
  name: 'Vasco da Gama',
  state: 'Goa'
},
// Jammu & Kashmir
{
  slug: 'jammu',
  name: 'Jammu',
  state: 'Jammu & Kashmir'
}, {
  slug: 'srinagar',
  name: 'Srinagar',
  state: 'Jammu & Kashmir'
},
// Chandigarh
{
  slug: 'chandigarh',
  name: 'Chandigarh',
  state: 'Chandigarh'
},
// Puducherry
{
  slug: 'puducherry',
  name: 'Puducherry',
  state: 'Puducherry'
},
// Tripura
{
  slug: 'agartala',
  name: 'Agartala',
  state: 'Tripura'
},
// Meghalaya
{
  slug: 'shillong',
  name: 'Shillong',
  state: 'Meghalaya'
},
// Manipur
{
  slug: 'imphal',
  name: 'Imphal',
  state: 'Manipur'
},
// Nagaland
{
  slug: 'kohima',
  name: 'Kohima',
  state: 'Nagaland'
},
// Mizoram
{
  slug: 'aizawl',
  name: 'Aizawl',
  state: 'Mizoram'
},
// Sikkim
{
  slug: 'gangtok',
  name: 'Gangtok',
  state: 'Sikkim'
},
// Arunachal Pradesh
{
  slug: 'itanagar',
  name: 'Itanagar',
  state: 'Arunachal Pradesh'
},
// Additional major cities
{
  slug: 'raigarh',
  name: 'Raigarh',
  state: 'Chhattisgarh'
}, {
  slug: 'nanded',
  name: 'Nanded',
  state: 'Maharashtra'
}, {
  slug: 'sangli',
  name: 'Sangli',
  state: 'Maharashtra'
}, {
  slug: 'latur',
  name: 'Latur',
  state: 'Maharashtra'
}, {
  slug: 'akola',
  name: 'Akola',
  state: 'Maharashtra'
}, {
  slug: 'jalgaon',
  name: 'Jalgaon',
  state: 'Maharashtra'
}, {
  slug: 'dhule',
  name: 'Dhule',
  state: 'Maharashtra'
}];
async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Seed Cities ────────────────────────────────────────────────────────────
  console.log(`\n🏙️  Seeding ${INDIAN_CITIES.length} Indian cities...`);
  await prisma.city.createMany({
    data: INDIAN_CITIES.map((c) => ({
      ...c,
      isActive: true
    })),
    skipDuplicates: true
  });
  console.log(`✅ Seeded ${INDIAN_CITIES.length} cities`);

  // Create test users with proper bcrypt hashing
  const testPassword = await hashPassword('Test@123');

  // Admin User (PRODUCTION-READY)
  const adminUser = await prisma.user.upsert({
    where: {
      email: 'admin@kangaroorooms.com'
    },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@kangaroorooms.com',
      password: await hashPassword('admin123'),
      phone: '+91-9999999999',
      city: 'jaipur',
      role: 'ADMIN'
    }
  });
  console.log('✅ Created admin user: admin@kangaroorooms.com / admin123');

  // Test Tenant User (CRITICAL FOR TESTING)
  const testTenant = await prisma.user.upsert({
    where: {
      email: 'tenant@test.com'
    },
    update: {},
    create: {
      name: 'Test Tenant',
      email: 'tenant@test.com',
      password: testPassword,
      phone: '+91-9876511111',
      city: 'jaipur',
      role: 'TENANT'
    }
  });
  console.log('✅ Created test tenant: tenant@test.com / Test@123');

  // Create sample owners
  const ownerPassword = await hashPassword('owner123');
  const owner1 = await prisma.user.upsert({
    where: {
      email: 'owner1@kangaroo.com'
    },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'owner1@kangaroo.com',
      password: ownerPassword,
      phone: '+91-9876543210',
      city: 'jaipur',
      role: 'OWNER'
    }
  });
  const owner2 = await prisma.user.upsert({
    where: {
      email: 'owner2@kangaroo.com'
    },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'owner2@kangaroo.com',
      password: ownerPassword,
      phone: '+91-9876543211',
      city: 'bangalore',
      role: 'OWNER'
    }
  });
  console.log('✅ Created owner users');

  // Create Jaipur properties (12 properties for testing 10-property limit)
  const jaipurProperties = [{
    title: 'Luxury 2BHK in C-Scheme',
    description: 'Premium 2BHK apartment in the heart of Jaipur. Modern amenities, close to shopping centers and restaurants.',
    city: 'jaipur',
    location: 'C-Scheme',
    landmark: 'Near Gaurav Tower',
    pricePerMonth: 22000,
    roomType: '2BHK',
    idealFor: ['Working Professionals'],
    amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Kitchen', 'Parking', 'Security'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    rating: 4.7,
    reviewsCount: 34,
    isPopular: true,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Spacious 1BHK in Malviya Nagar',
    description: 'Well-furnished 1BHK perfect for students and working professionals. Near metro station.',
    city: 'jaipur',
    location: 'Malviya Nagar',
    landmark: 'Near Jawahar Circle',
    pricePerMonth: 15000,
    roomType: '1BHK',
    idealFor: ['Students', 'Working Professionals'],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Security', 'Power Backup'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    rating: 4.5,
    reviewsCount: 28,
    isPopular: true,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Premium PG in Vaishali Nagar',
    description: 'High-quality PG accommodation with meals included. Safe and secure environment for students.',
    city: 'jaipur',
    location: 'Vaishali Nagar',
    landmark: 'Near Celebration Mall',
    pricePerMonth: 10000,
    roomType: 'PG',
    idealFor: ['Students'],
    amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Security'],
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5'],
    rating: 4.3,
    reviewsCount: 56,
    isPopular: false,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Modern Studio in Mansarovar',
    description: 'Compact studio apartment with all modern amenities. Perfect for solo professionals.',
    city: 'jaipur',
    location: 'Mansarovar',
    landmark: 'Near Gaurav Path',
    pricePerMonth: 12000,
    roomType: 'Studio',
    idealFor: ['Working Professionals'],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking'],
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
    rating: 4.4,
    reviewsCount: 19,
    isPopular: false,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Family 2BHK in Raja Park',
    description: 'Spacious 2BHK ideal for small families. Quiet neighborhood with good connectivity.',
    city: 'jaipur',
    location: 'Raja Park',
    landmark: 'Near SMS Hospital',
    pricePerMonth: 18000,
    roomType: '2BHK',
    idealFor: ['Families'],
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Security', 'Power Backup'],
    images: ['https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6'],
    rating: 4.6,
    reviewsCount: 42,
    isPopular: true,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Affordable Room in Pratap Nagar',
    description: 'Budget-friendly single room with basic amenities. Good for students on a tight budget.',
    city: 'jaipur',
    location: 'Pratap Nagar',
    landmark: 'Near Sanganer Airport',
    pricePerMonth: 8000,
    roomType: 'Single',
    idealFor: ['Students'],
    amenities: ['WiFi', 'Security'],
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c'],
    rating: 4.0,
    reviewsCount: 23,
    isPopular: false,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Executive Suite in Bani Park',
    description: 'Premium executive suite with modern furnishings. Close to railway station.',
    city: 'jaipur',
    location: 'Bani Park',
    landmark: 'Near Railway Station',
    pricePerMonth: 25000,
    roomType: '1BHK',
    idealFor: ['Working Professionals'],
    amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Kitchen', 'TV', 'Fridge'],
    images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511'],
    rating: 4.8,
    reviewsCount: 31,
    isPopular: true,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Shared Room in Gopalpura',
    description: 'Affordable shared accommodation for students. Friendly environment and good facilities.',
    city: 'jaipur',
    location: 'Gopalpura',
    landmark: 'Near Bypass Road',
    pricePerMonth: 6000,
    roomType: 'Shared',
    idealFor: ['Students'],
    amenities: ['WiFi', 'Kitchen', 'Security'],
    images: ['https://images.unsplash.com/photo-1529408686214-b48b8532f72c'],
    rating: 4.1,
    reviewsCount: 45,
    isPopular: false,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Luxury 2BHK in Jagatpura',
    description: 'High-end 2BHK apartment with premium amenities. Gated community with security.',
    city: 'jaipur',
    location: 'Jagatpura',
    landmark: 'Near Mahindra SEZ',
    pricePerMonth: 28000,
    roomType: '2BHK',
    idealFor: ['Working Professionals'],
    amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Kitchen', 'Parking', 'Security', 'TV', 'Washing Machine'],
    images: ['https://images.unsplash.com/photo-1484154218962-a1c002085d2f'],
    rating: 4.9,
    reviewsCount: 38,
    isPopular: true,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Cozy 1BHK in Tonk Road',
    description: 'Well-maintained 1BHK with good connectivity. Suitable for working professionals.',
    city: 'jaipur',
    location: 'Tonk Road',
    landmark: 'Near Sitapura Industrial Area',
    pricePerMonth: 14000,
    roomType: '1BHK',
    idealFor: ['Working Professionals'],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Security'],
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb'],
    rating: 4.4,
    reviewsCount: 27,
    isPopular: false,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Premium PG in Civil Lines',
    description: 'Top-quality PG with excellent food and facilities. Safe for students and professionals.',
    city: 'jaipur',
    location: 'Civil Lines',
    landmark: 'Near Secretariat',
    pricePerMonth: 11000,
    roomType: 'PG',
    idealFor: ['Students'],
    amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Security', 'Power Backup'],
    images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf'],
    rating: 4.6,
    reviewsCount: 52,
    isPopular: true,
    isActive: true,
    ownerId: owner1.id
  }, {
    title: 'Spacious 2BHK in Nirman Nagar',
    description: 'Large 2BHK apartment with balcony. Family-friendly neighborhood with parks nearby.',
    city: 'jaipur',
    location: 'Nirman Nagar',
    landmark: 'Near Ajmer Road',
    pricePerMonth: 20000,
    roomType: '2BHK',
    idealFor: ['Families'],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Security', 'Power Backup'],
    images: ['https://images.unsplash.com/photo-1560185127-6ed189bf02f4'],
    rating: 4.7,
    reviewsCount: 36,
    isPopular: true,
    isActive: true,
    ownerId: owner1.id
  }];
  const createdRooms = [];
  for (const property of jaipurProperties) {
    const created = await prisma.room.create({
      data: property
    });
    createdRooms.push(created);
  }
  console.log(`✅ Created ${jaipurProperties.length} Jaipur properties`);

  // Create additional properties in other cities
  const otherCityProperties = [{
    title: 'Spacious 2BHK in Bandra West',
    description: 'Beautiful 2BHK apartment with modern amenities, close to Bandra station.',
    city: 'mumbai',
    location: 'Bandra West',
    landmark: 'Near Bandra Station',
    pricePerMonth: 35000,
    roomType: '2BHK',
    idealFor: ['Working Professionals', 'Small Family'],
    amenities: ['WiFi', 'AC', 'Parking', 'Security', 'Power Backup'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    rating: 4.5,
    reviewsCount: 12,
    isPopular: true,
    isActive: true,
    ownerId: owner2.id
  }, {
    title: 'Cozy 1BHK in Koramangala',
    description: 'Fully furnished 1BHK in the heart of Koramangala. Walking distance to restaurants.',
    city: 'bangalore',
    location: 'Koramangala',
    landmark: 'Near Forum Mall',
    pricePerMonth: 22000,
    roomType: '1BHK',
    idealFor: ['Working Professionals', 'Students'],
    amenities: ['WiFi', 'Furnished', 'Gym', 'Security'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    rating: 4.2,
    reviewsCount: 8,
    isPopular: true,
    isActive: true,
    ownerId: owner2.id
  }];
  for (const property of otherCityProperties) {
    await prisma.room.create({
      data: property
    });
  }
  console.log('✅ Created properties in other cities');

  // Seed City Pricing
  const cityPricing = [
  // ── Default pricing (fallback for any city not explicitly configured) ──
  {
    city: 'default',
    plan: 'FREE',
    price: 0
  }, {
    city: 'default',
    plan: 'GOLD',
    price: 149
  }, {
    city: 'default',
    plan: 'PLATINUM',
    price: 299
  },
  // ── City-specific pricing ──
  {
    city: 'jaipur',
    plan: 'FREE',
    price: 0
  }, {
    city: 'jaipur',
    plan: 'GOLD',
    price: 99
  }, {
    city: 'jaipur',
    plan: 'PLATINUM',
    price: 199
  }, {
    city: 'kota',
    plan: 'FREE',
    price: 0
  }, {
    city: 'kota',
    plan: 'GOLD',
    price: 79
  }, {
    city: 'kota',
    plan: 'PLATINUM',
    price: 149
  }, {
    city: 'bangalore',
    plan: 'FREE',
    price: 0
  }, {
    city: 'bangalore',
    plan: 'GOLD',
    price: 149
  }, {
    city: 'bangalore',
    plan: 'PLATINUM',
    price: 299
  }, {
    city: 'mumbai',
    plan: 'FREE',
    price: 0
  }, {
    city: 'mumbai',
    plan: 'GOLD',
    price: 199
  }, {
    city: 'mumbai',
    plan: 'PLATINUM',
    price: 399
  }, {
    city: 'delhi',
    plan: 'FREE',
    price: 0
  }, {
    city: 'delhi',
    plan: 'GOLD',
    price: 149
  }, {
    city: 'delhi',
    plan: 'PLATINUM',
    price: 299
  }];
  for (const pricing of cityPricing) {
    await prisma.cityPricing.upsert({
      where: {
        city_plan: {
          city: pricing.city,
          plan: pricing.plan
        }
      },
      update: {
        price: pricing.price
      },
      create: pricing
    });
  }
  console.log('✅ Created city pricing');

  // Seed Plan Limits (database-driven contact limit system)
  const planLimits = [{
    plan: 'FREE',
    city: null,
    contactLimit: 5
  },
  // Global FREE: 5 unlocks per city
  {
    plan: 'GOLD',
    city: null,
    contactLimit: null
  },
  // Global GOLD: unlimited
  {
    plan: 'PLATINUM',
    city: null,
    contactLimit: null
  } // Global PLATINUM: unlimited
  ];
  for (const limit of planLimits) {
    const existing = await prisma.planLimit.findFirst({
      where: {
        plan: limit.plan,
        city: limit.city
      }
    });
    if (!existing) {
      await prisma.planLimit.create({
        data: {
          plan: limit.plan,
          city: limit.city,
          contactLimit: limit.contactLimit
        }
      });
    }
  }
  console.log('✅ Created plan limits (FREE=5, GOLD=unlimited, PLATINUM=unlimited)');

  // ─── Seed Demo Agents ────────────────────────────────────────────────────────
  console.log('\n🤖 Seeding demo agents...');
  const agentPassword = await hashPassword('agent123');
  let agentsCreated = 0;
  let agentsSkipped = 0;
  const existingAgent1 = await prisma.user.findUnique({
    where: {
      email: 'agent1@kangaroorooms.com'
    }
  });
  const agent1 = existingAgent1 ?? (await prisma.user.create({
    data: {
      name: 'Demo Agent One',
      email: 'agent1@kangaroorooms.com',
      password: agentPassword,
      phone: '+91-9000000001',
      city: 'jaipur',
      role: 'AGENT'
    }
  }));
  if (existingAgent1) {
    agentsSkipped++;
    console.log('   ⏭️  Skipped agent1@kangaroorooms.com (already exists)');
  } else {
    agentsCreated++;
    console.log('   ✔ Created agent1@kangaroorooms.com');
  }
  const existingAgent2 = await prisma.user.findUnique({
    where: {
      email: 'agent2@kangaroorooms.com'
    }
  });
  const agent2 = existingAgent2 ?? (await prisma.user.create({
    data: {
      name: 'Demo Agent Two',
      email: 'agent2@kangaroorooms.com',
      password: agentPassword,
      phone: '+91-9000000002',
      city: 'bangalore',
      role: 'AGENT'
    }
  }));
  if (existingAgent2) {
    agentsSkipped++;
    console.log('   ⏭️  Skipped agent2@kangaroorooms.com (already exists)');
  } else {
    agentsCreated++;
    console.log('   ✔ Created agent2@kangaroorooms.com');
  }

  // ─── Seed Demo Property Assignments ─────────────────────────────────────────
  console.log('\n🏠 Seeding demo property assignments...');
  let propAssignmentsCreated = 0;
  let propAssignmentsSkipped = 0;
  if (createdRooms.length === 0) {
    console.log('   ⚠️  No properties available for assignment');
  } else {
    // Assign first property → agent1
    const existingPropAssignment1 = await prisma.agentPropertyAssignment.findUnique({
      where: {
        agentId_propertyId: {
          agentId: agent1.id,
          propertyId: createdRooms[0].id
        }
      }
    });
    if (existingPropAssignment1 && existingPropAssignment1.isActive) {
      propAssignmentsSkipped++;
      console.log(`   ⏭️  Skipped: "${createdRooms[0].title}" → Demo Agent One (already active)`);
    } else {
      await adminAssignmentService.assignPropertyToAgent(agent1.id, createdRooms[0].id, adminUser.id, 'Demo seed assignment');
      propAssignmentsCreated++;
      console.log(`   ✔ Assigned "${createdRooms[0].title}" → Demo Agent One`);
    }

    // Assign second property → agent2 (if exists)
    if (createdRooms.length >= 2) {
      const existingPropAssignment2 = await prisma.agentPropertyAssignment.findUnique({
        where: {
          agentId_propertyId: {
            agentId: agent2.id,
            propertyId: createdRooms[1].id
          }
        }
      });
      if (existingPropAssignment2 && existingPropAssignment2.isActive) {
        propAssignmentsSkipped++;
        console.log(`   ⏭️  Skipped: "${createdRooms[1].title}" → Demo Agent Two (already active)`);
      } else {
        await adminAssignmentService.assignPropertyToAgent(agent2.id, createdRooms[1].id, adminUser.id, 'Demo seed assignment');
        propAssignmentsCreated++;
        console.log(`   ✔ Assigned "${createdRooms[1].title}" → Demo Agent Two`);
      }
    }
  }

  // ─── Seed Demo Tenant Assignment ─────────────────────────────────────────────
  console.log('\n👤 Seeding demo tenant assignment...');
  let tenantAssignmentsCreated = 0;
  let tenantAssignmentsSkipped = 0;

  // Use the testTenant already created above (role: TENANT)
  const existingTenantAssignment = await prisma.agentTenantAssignment.findUnique({
    where: {
      agentId_tenantId: {
        agentId: agent1.id,
        tenantId: testTenant.id
      }
    }
  });
  if (existingTenantAssignment && existingTenantAssignment.isActive) {
    tenantAssignmentsSkipped++;
    console.log(`   ⏭️  Skipped: "${testTenant.name}" → Demo Agent One (already active)`);
  } else {
    await adminAssignmentService.assignTenantToAgent(agent1.id, testTenant.id, adminUser.id, 'Demo seed assignment');
    tenantAssignmentsCreated++;
    console.log(`   ✔ Assigned "${testTenant.name}" → Demo Agent One`);
  }

  // ─── Final Summary ────────────────────────────────────────────────────────────
  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 ADMIN:');
  console.log('   Email: admin@kangaroorooms.com');
  console.log('   Password: admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TEST TENANT (for subscription testing):');
  console.log('   Email: tenant@test.com');
  console.log('   Password: Test@123');
  console.log('   City: Jaipur');
  console.log('   Plan: FREE (default)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Owner: owner1@kangaroo.com / owner123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Agents:');
  console.log('   Email: agent1@kangaroorooms.com / agent123');
  console.log('   Email: agent2@kangaroorooms.com / agent123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Seeded Data Summary:`);
  console.log(`   - ${jaipurProperties.length} properties in Jaipur`);
  console.log(`   - ${otherCityProperties.length} properties in other cities`);
  console.log(`   - ${cityPricing.length} city pricing entries`);
  console.log(`   - ${planLimits.length} plan limit entries`);
  console.log(`\n🤖 Agent Assignment Summary:`);
  console.log(`   ✔ Created agents: ${agentsCreated}`);
  console.log(`   ⏭️  Skipped existing agents: ${agentsSkipped}`);
  console.log(`   ✔ Created property assignments: ${propAssignmentsCreated}`);
  console.log(`   ⏭️  Skipped existing property assignments: ${propAssignmentsSkipped}`);
  console.log(`   ✔ Created tenant assignments: ${tenantAssignmentsCreated}`);
  console.log(`   ⏭️  Skipped existing tenant assignments: ${tenantAssignmentsSkipped}`);
}
main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
