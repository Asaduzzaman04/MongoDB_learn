import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const url = `mongodb://localhost:${process.env.MONGODB_PORT}`;

// Create a new MongoClient
const client = new MongoClient(url);

const port = process.env.APP_PORT || 4000;

// Route to fetch all cars data
app.get('/', async (req, res) => {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log(`Connected to database`);

    // Access the database and collection
    const database = client.db('data');
    const carsCollection = database.collection('cars');

    // Fetch all documents from the collection
    const cars = await carsCollection.find({}).toArray();

    // Send the data as the response
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);

    // Send error response
    res.status(500).json({
      message: 'Error connecting to the database',
      error: error.message
    });
  } finally {
    await client.close();
  }
});

app.get('/api/person', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('data');
    const personData = database.collection('person');
    const person = await personData.find({index : 466}).toArray();
    res.status(200).json(person);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({
      massage: 'Error connection the database',
      error: error.massage
    });
  } finally {
    await client.close();
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
