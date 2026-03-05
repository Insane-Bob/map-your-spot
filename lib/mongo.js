import { MongoClient } from "mongodb"

const uri = process.env.MONGO_URI

if (!uri) {
  throw new Error("MONGO_URI not defined")
}

const options = {
  tls: true,
  retryWrites: true,
  w: "majority",
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
}

let client
let clientPromise

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export default clientPromise
