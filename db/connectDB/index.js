import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const url = `mongodb://localhost:${process.env.MONGODB_PORT}`;
const port = process.env.APP_PORT || 4000;

let db; // Store the database connection

// Initialize MongoDB connection
const initializeDb = async () => {
  try {
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('data');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit if the connection fails
  }
};

// Middleware to ensure the database is initialized
app.use((req, res, next) => {
  if (!db) {
    return res.status(500).json({ message: 'Database not initialized' });
  }
  next();
});

// Route to fetch all cars data
app.get('/', async (req, res) => {
  try {
    const carsCollection = db.collection('cars');
    const cars = await carsCollection.find({}).toArray();
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({
      message: 'Failed to fetch cars',
      error: error.message
    });
  }
});

// Route to fetch all person data
app.get('/api/person', async (req, res) => {
  try {
    const personData = db.collection('person');
    const person = await personData.find({}).toArray();
    res.status(200).json(person);
  } catch (error) {
    console.error('Error fetching person data:', error);
    res.status(500).json({
      message: 'Failed to fetch person data',
      error: error.message
    });
  }
});
//find useing query params
app.get('/api/person/v1/:age', async (req, res) => {
  const {
    params: { age }
  } = req;
  try {
    const ageData = db.collection('person');
    const totalData = await ageData
      .find({ age: { $eq: Number(age) }, tags: { $size: 2 } })
      .sort({ favoriteFruit: 1 })
      .toArray();
    res.status(200).json(totalData);
  } catch (error) {
    console.log('Error fetchig preson Data : ', error);
    res.status(500).json({
      massage: 'Failed to fetch person Data',
      error: error.massage
    });
  }
});
// Route to get count of person documents
app.get('/api/person/count', async (req, res) => {
  try {
    const personCount = await db.collection('person').countDocuments();
    res.status(200).json({ count: personCount });
  } catch (error) {
    console.error('Error counting person documents:', error);
    res.status(500).json({
      message: 'Failed to count person documents',
      error: error.message
    });
  }
});
//update the data
app.put('/api/person/v2/:company', async (req, res) => {
  const { company } = req.params;
  console.log('Updating document with company title:', company);
  try {
    const getCollection = db.collection('person');
    const result = await getCollection.updateOne(
      { 'company.title': { $regex: `^${company}$`, $options: 'i' } },
      { $set: { isActive: true } }
    );
    if (result.modifiedCount > 0) {
      res.status(200).send({ message: 'Field updated successfully' });
    } else {
      res.status(404).send({ message: 'Document not found' });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({
      message: 'Failed to update user data',
      error: error.message
    });
  }
});

// Start the server and initialize the database
app.listen(port, async () => {
  await initializeDb();
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  if (db) {
    await client.close();
  }
  process.exit(0);
});
