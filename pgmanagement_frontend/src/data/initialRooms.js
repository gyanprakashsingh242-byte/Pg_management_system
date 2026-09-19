export const ELECTRICITY_RATE = 10;

export const generateInitialRooms = () => {
  const rooms = [];
  const floors = [1, 2, 3];

  floors.forEach((floor) => {
    for (let i = 1; i <= 18; i++) {
      const roomNum = `${floor}${i < 10 ? '0' : ''}${i}`;
      rooms.push({
        roomNumber: roomNum,
        floor: floor,
        tenantName: i % 2 === 0 ? `Tenant ${roomNum}` : `Rahul ${roomNum}`,
        phone: '919876543210', // Default phone format
        rentAmount: 8000 + floor * 500,
        prevMeter: 100,
        currentMeter: 100 + Math.floor(Math.random() * 80 + 20),
        isPaid: i % 3 === 0,
      });
    }
  });
  return rooms;
};