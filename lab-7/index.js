const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());  
app.use(cors());  

mongoose.connect('mongodb+srv://devices:12345@cluster.y2vqray.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.log('MongoDB connection error:', err);
});

const DeviceSchema = new mongoose.Schema({
  device_name: {
    type: String,
    required: true,
  },
  serial_number: {
    type: String,
    required: true,
    unique: true,  
  },
  user_name: {
    type: String,
    default: null,
  },
});

const Device = mongoose.model('device', DeviceSchema);

app.post('/register', async (req, res) => {
  const { device_name, serial_number } = req.body;

  const existingDevice = await Device.findOne({ serial_number });
  if (existingDevice) {
    return res.status(400).send('Device already exists');
  }

  const newDevice = new Device({ device_name, serial_number });
  await newDevice.save();

  res.status(200).send('Device registered successfully');
});

app.get('/devices', async (req, res) => {
  const devices = await Device.find();
  res.status(200).json(devices);
});

app.post('/take', async (req, res) => {
  const { user_name, serial_number } = req.body;

  const device = await Device.findOne({ serial_number });

  if (!device) {
    return res.status(404).send('Device not found');
  }

  if (device.user_name) {
    return res.status(400).send('Device already taken');
  }

  if (user_name) {
    device.user_name = user_name;
  } else {
    device.user_name = undefined;
    device.markModified('user_name'); 
  }

  try {
    await device.save();
    return res.status(200).json({ message: 'Device assigned successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning device', error });
  }
});

app.get('/devices/:serial_number', async (req, res) => {
  const { serial_number } = req.params;
  const device = await Device.findOne({ serial_number });

  if (!device) {
    return res.status(404).send('Device not found');
  }

  res.status(200).json({
    user_name: device.user_name,
    device_name: device.device_name,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
