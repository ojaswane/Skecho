import dotenv from 'dotenv';
import express from 'express';
import generateRoute from './routes/generate';

dotenv.config()
const app = express()

app.use(express.json())

const port = process.env.PORT || 3000

app.use('/generate', generateRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;