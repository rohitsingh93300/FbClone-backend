import express from "express"
import dotenv from "dotenv"
import connectDB from "./database/db.js"
import authRoute from "./routes/auth.route.js"
import postRoute from "./routes/post.route.js"
import commentRoute from "./routes/comment.route.js"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

// default middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:'https://fb-clone-frontend-nine.vercel.app',
    credentials:true
}))

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/post', postRoute)
app.use('/api/v1/comment', commentRoute)

// https://localhost:8000/api/v1/auth/register


app.listen(PORT,()=>{
    connectDB()
    console.log(`Server listen at port ${PORT}`);
})