import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    content:{type:String},
    image:{type:String},
    likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    comments:[{type:mongoose.Schema.Types.ObjectId, ref:'Comment'}],
    share:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    
},{timestamps:true})

export const Post = mongoose.model('Post', postSchema)