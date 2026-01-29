import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";

export const createComment = async(req,res)=>{
    try {
        const postId = req.params.id
        const commentKrneWaleUserKiId = req.id;
        const {content} = req.body;

        const post = await Post.findById(postId)
        if(!content) return res.status(400).json({message:'Text is required', success:false})

            const comment = await Comment.create({
                content,
                userId: commentKrneWaleUserKiId,
                postId
            })

            await comment.populate({
                path:'userId',
                select: 'firstname lastname profilePicture'
            })

            post.comments.push(comment._id);
            await post.save()
            return res.status(201).json({
                message:'Comment Added',
                comment,
                success:true
            })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const deleteComment = async(req, res)=>{
    try {
        const commentId = req.params.id;
        const authorId = req.id;
        const comment = await Comment.findById(commentId)
        if(!comment){
            return res.status(400).json({success:false, message:"Comment not found"})
        }
        if(comment.userId.toString() !== authorId) {
            return res.status(403).json({success:false, message:"Unauthorized to delete this comment"})
        }
        const postId = comment.postId;
        //Delete the comment
        await Comment.findByIdAndDelete(commentId);

        // Remove comment id from posts comment array
        await Post.findByIdAndUpdate(postId, {$pull: {comments:commentId}})
        res.status(200).json({success:true, message:'Comment deleted successfully'})
    } catch (error) {
        res.status(500).json({success:false, message:'Error deleting comment'})
    }
}

export const likeComment = async(req, res) =>{
    try {
        const userId = req.id;
        const commentId = req.params.id;

        const comment = await Comment.findById(commentId).populate("userId")
        if(!comment){
            return res.status(404).json({
                success:false, 
                message:"Comment not found"
            })
        }

        const alreadyLiked = comment.likes.includes(userId)
        if(alreadyLiked){
            comment.likes = comment.likes.filter(id=> id !== userId)
            comment.numberOfLikes -= 1;
        } else {
            comment.likes.push(userId);
            comment.numberOfLikes += 1
        }
        await comment.save()
        res.status(200).json({
            success:true,
            message: alreadyLiked ? "Coment unliked" : "Comment liked",
            updatedComment: comment
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}