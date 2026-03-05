import { MongoClient } from "mongodb"

const uri = process.env.MONGO_URI
const options = {
  // SSL/TLS configuration to handle Vercel's Node.js environment
  ssl: true,
  retryWrites: true,
  w: "majority",
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 1,
  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // Retry settings
  retryReads: true,
  maxConnecting: 2
}

let client
let clientPromise

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI not defined")
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export default clientPromise
