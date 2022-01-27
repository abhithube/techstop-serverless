import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.DATABASE_URL!);
let isConnected = false;

client.on('open', () => {
  console.log('MongoDB connection opened');
  isConnected = true;
});

client.on('close', () => {
  console.log('MongoDB connection closed');
  isConnected = false;
});

export const connectToDb = async () =>
  isConnected ? client.db() : (await client.connect()).db();

export const toObjectId = (id: string) => new ObjectId(id);
