import dotenv from 'dotenv';
import express from 'express';

dotenv.config()
const app = express()

app.use(express.json())

const port = process.env.PORT || 3000
