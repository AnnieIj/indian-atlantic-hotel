import { addDays, format } from 'date-fns';

export const generateRooms = () => {
  const roomTypes = {
    'Suite': {
      numbers: [204, 304],
      price: 101000,
      capacity: 4,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
      description: 'Our most luxurious offering featuring expansive living areas and premium amenities.',
      amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Ocean View', 'Lounge Area']
    },
    'Double Executive': {
      numbers: [311],
      price: 81000,
      capacity: 3,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
      description: 'A spacious double executive room perfect for extended stays or small groups.',
      amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'City View']
    },
    'Executive': {
      numbers: [103, 104, 210, 303, 312],
      price: 61000,
      capacity: 2,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      description: 'Experience elevated comfort in our executive room featuring premium furnishings.',
      amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar']
    },
    'Super Deluxe': {
      numbers: [106, 113, 203, 206, 208, 211, 305, 306, 307, 308, 310],
      price: 51000,
      capacity: 2,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
      description: 'Upgraded deluxe room offering additional space and superior comfort.',
      amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Room Service']
    },
    'Deluxe': {
      numbers: [102, 105, 205, 209],
      price: 46000,
      capacity: 2,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800',
      description: 'A cozy and modern deluxe room with essential amenities for a comfortable stay.',
      amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV']
    },
    'Standard': {
      numbers: [101, 202, 207, 309, 314],
      price: 41000,
      capacity: 2,
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
      description: 'A comfortable standard room designed for simplicity and relaxation.',
      amenities: ['Free Wi-Fi', 'Air Conditioning']
    }
  };

  let rooms = [];

  Object.entries(roomTypes).forEach(([type, config]) => {
    config.numbers.forEach(num => {
      rooms.push({
        id: `r${num}`,
        name: `${type} Room ${num}`,
        type: type,
        price: config.price,
        capacity: config.capacity,
        status: num % 7 === 0 ? 'booked' : num % 13 === 0 ? 'maintenance' : 'available',
        image: config.image,
        description: config.description,
        amenities: config.amenities
      });
    });
  });

  return rooms;
}

// Keep mockRooms for the featured section on the Home page (take one of each of the top 3 types)
export const mockRooms = [
  { id: 'r204', name: 'Suite Room 204', type: 'Suite', price: 101000, capacity: 4, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800', description: 'Our most luxurious offering featuring expansive living areas and premium amenities.', amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Ocean View', 'Lounge Area'] },
  { id: 'r104', name: 'Executive Room 104', type: 'Executive', price: 61000, capacity: 2, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', description: 'Experience elevated comfort in our executive room featuring premium furnishings.', amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar'] },
  { id: 'r106', name: 'Super Deluxe Room 106', type: 'Super Deluxe', price: 51000, capacity: 2, image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800', description: 'Upgraded deluxe room offering additional space and superior comfort.', amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Room Service'] }
];

export const mockUsers = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', phone: '08012345678', role: 'guest' },
  { id: 'u2', name: 'Ada Okafor', email: 'ada@example.com', phone: '08087654321', role: 'guest' },
  { id: 'admin1', name: 'Hotel Admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin' }
];

export const mockBookings = [
  {
    id: 'b1',
    userId: 'u1',
    roomId: 'r104',
    checkIn: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    status: 'confirmed',
    paymentStatus: 'success',
    totalAmount: 183000, // 3 nights x 61000
    createdAt: format(new Date(), 'yyyy-MM-dd')
  },
  {
    id: 'b2',
    userId: 'u2',
    roomId: 'r310', // super deluxe
    checkIn: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: 102000, // 2 nights x 51000
    createdAt: format(new Date(), 'yyyy-MM-dd')
  }
];

export const mockTestimonials = [
  { id: 1, name: 'Chuks Nnadi', location: 'Lagos, Nigeria', text: 'The Super Deluxe room was absolutely amazing. The staff were very polite and the 24/7 power supply made my stay seamless.', rating: 5 },
  { id: 2, name: 'Sarah Jenkins', location: 'London, UK', text: 'Beautiful hotel in Agbor! The VIP Lounge is top tier and the food at the restaurant is delicious. Will definitely return.', rating: 5 },
  { id: 3, name: 'Dr. Emmanuel', location: 'Abuja, Nigeria', text: 'I booked the Suite for a weekend getaway and it exceeded my expectations. Pure luxury and great security.', rating: 5 }
];
