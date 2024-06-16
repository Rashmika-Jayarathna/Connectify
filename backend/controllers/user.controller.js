import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";


import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {

    const { username } = req.params;
    try {
        const user = await User.findOne({username}).select("-password");

        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {

        console.log("Error in getUserProfile : ",error.message);
        res.status(500).json({error: error.message});
        
    }
  }

export const followUnfollowUser = async (req, res) => {
    
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);   
        const currentUser = await User.findById(req.user._id);


        if(id == req.user._id.toString()){
            return res.status(400).json({error: "You can't follow/unfollow yourself"});
        }

        if(!userToModify || !currentUser){
            return res.status(404).json({error: "User not found"});
        }
        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow the user

            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});

            // TODO: return the id of the user as a response
            res.status(200).json({message: "User unfollowed successfully"});

        }else{

            //fullow the user
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});

            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "follow"
            });
            await newNotification.save();

            // TODO: return the id of the user as a response
            res.status(200).json({message: "User followed successfully"});
        }


    } catch (error) {

        console.log("Error in followUnfollowUser : ",error.message);
        res.status(500).json({error: error.message});
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const followedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne: userId}
                }
            },
            {$sample: {size: 10}}
        ]); 

        const filteredUsers = users.filter(user => !followedByMe.following.includes(user._id));

        const suggestedUsers = filteredUsers.slice(0, 4);
        
        suggestedUsers.forEach(user => user.password = null);

        res.status(200).json(suggestedUsers);
        
    } catch (error) {
        console.log("Error in getSuggestedUsers : ",error.message);
        res.status(500).json({error: error.message});
        
    }
}

export const updateUser = async (req, res) => {

    const {fullname, email,username,currentPassword, newPassword, bio, link} = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    try {

        let user = await User.findById(userId);  
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        
        if(!newPassword && currentPassword || newPassword && !currentPassword){
            return res.status(400).json({error: "Please provide both current and new password"});
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch){
                return res.status(400).json({error: "Invalid password"});
            }
            if(newPassword.length < 6){
                return res.status(400).json({error: "Password must be atleast 6 characters long"});
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg){
            

            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponce = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponce.secure_url;
        }
        if(coverImg){

            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponce = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponce.secure_url;

        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;

        return res.status(200).json(user);
        
    } catch (error) {

        console.log("Error in updateUser : ",error.message);
        res.status(500).json({error: error.message});
        
    }
}
