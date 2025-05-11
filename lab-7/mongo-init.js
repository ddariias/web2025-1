db.createCollection('devices');

db.users.insertMany([
  { device_name: 'device-1', serial_number: '73827hfdew73' },
  { device_name: 'device-2', serial_number: 'cdhsjeyr773872' }
]);
