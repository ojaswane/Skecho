import express from "express"
import cors from "cors"
import generateRoute from "./routes/generate.js"
import 'dotenv/config'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/generate", generateRoute)
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
