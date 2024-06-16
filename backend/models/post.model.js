import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        requered : true
    },
    text: {
        type: String,
    },
    img: { 
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [
        {
            text: {
                type: String,
                required: true
            
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                requered : true
            }
        }
    ],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

export default Post;