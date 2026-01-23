// Script để thêm vé test vào localStorage
// Chạy trong console browser: 
// localStorage.setItem('testTicket', JSON.stringify({...}));

const now = new Date();
const future = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 giờ sau
const date = future.toISOString().split('T')[0];
const hours = String(future.getHours()).padStart(2, '0');
const mins = String(future.getMinutes()).padStart(2, '0');
const time = `${hours}:${mins}`;

const testTicket = {
  id: Date.now(),
  movie: 'Test Movie - Có thể huỷ',
  theater: 'CGV Vincom Center',
  date: date,
  time: time,
  seats: ['A5', 'A6'],
  total: 170000,
  status: 'purchased',
  ticketCode: `MV${date.replace(/-/g, '')}999`
};

console.log('Test ticket data:', JSON.stringify(testTicket, null, 2));
console.log('\nCopy và paste vào console browser:');
console.log(`
const testTicket = ${JSON.stringify(testTicket, null, 2)};
const existingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
existingHistory.unshift(testTicket);
localStorage.setItem('bookingHistory', JSON.stringify(existingHistory));
console.log('Đã thêm vé test!');
`);

