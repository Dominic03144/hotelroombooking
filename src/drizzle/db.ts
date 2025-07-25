// // ✅ File: src/config/db.ts
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';
// import * as schema from '../drizzle/schema';
// import dotenv from 'dotenv';

// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// export const db = drizzle(pool, { schema });



import 'dotenv/config';
import { Pool } from '@neondatabase/serverless'; // Neon WebSocket-based pool
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from './schema';



// Merge tables and relations into one schema object
const dbSchema = {
    ...schema,
    
};

// Initialize Neon pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// Initialize Drizzle with schema + relations
const db = drizzle(pool, { schema: dbSchema, logger: true });

export default db;