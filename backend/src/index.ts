import express from "express"
import cors from "cors"
import generateRoute from "./routes/generate"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/generate", generateRoute)

app.listen(3001, () => {
    console.log("Backend running") 
})
