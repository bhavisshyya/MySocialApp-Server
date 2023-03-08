const User = require("../models/User");
const Post = require("../models/Post");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const { mapPostOutput } = require("../utils/Utils");
// const { json } = require("express");

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    if (curUserId == userIdToFollow) {
      res.send(error(409, "you cannot follow yourself"));
    }

    if (!userToFollow) {
      return res.send(error(404, "User to follow not found"));
    }
    if (curUser.followings.includes(userIdToFollow)) {
      // already followed
      const index = curUser.followings.indexOf(userIdToFollow);
      curUser.followings.splice(index, 1);

      const followerIndex = userToFollow.followers.indexOf(curUser);
      userToFollow.followers.splice(followerIndex, 1);

    } else {
      curUser.followings.push(userIdToFollow);
      userToFollow.followers.push(curUserId); 
    }

    await userToFollow.save();
      await curUser.save();
    return res.send(success(200, {user: userToFollow}));
  } catch (e) {
    return res.send(success(500, e.message));
  }
};

const getPostOfFollowing = async (req, res) => {
  try {
    const curUserId = req._id;

    const curUser = await User.findById(curUserId).populate("followings");

    const fullPosts = await Post.find({
      owner: {
        $in: curUser.followings,
      },
    }).populate('owner');

    const posts = fullPosts
      ?.map((item) => mapPostOutput(item, req._id))
      .reverse();
    const followingsIds = curUser.followings.map((item) => item._id);
    followingsIds.push(req._id);
    
    const suggestions = await User.find({
      _id: {
        $nin: followingsIds,
      },
    });

    return res.send(success(200, { ...curUser._doc, suggestions ,posts }));
  } catch (err) {
    // console.log(e);
    return res.send(error(500, err.message));
  }
};

const getMyPostController = async (req, res) => {
  try {
    const userId = req._id;
    const allUserPosts = await Post.find({
      owner: curUserId,
    }).populate("likes");

    return res.send(success(200, allUserPosts));
  } catch (err) {
    return res.send(500, err.message);
  }
};

const getUserPostController = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      res.send(error(400, "UserId is required"));
    }
    const allUserPosts = await Post.find({
      owner: userId,
    }).populate("likes");

    return res.send(success(200, allUserPosts));
  } catch (err) {
    return res.send(500, err.message);
  }
};

const deleteMyProfileController = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    // delete all posts
    await Post.deleteMany({
      owner: curUserId,
    });

    // remove myProfile from followers following
    curUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      if (follower) {
        const index = follower.followings.indexOf(curUserId);
        follower.followings.splice(index, 1);
        await follower.save();
      }
    });

    // remove myself from my following followers
    curUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      if (following) {
        const index = following.followers.indexOf(curUserId);
        following.followers.splice(index, 1);
        await following.save();
      }
    });

    // remove myself from all likes

    const allPost = await Post.find();
    allPost.forEach(async (post) => {
      const index = post.likes.indexOf(curUserId);
      if (index) {
        post.likes.splice(index, 1);
        await post.save();
      }
    });

    // del User
    await curUser.remove();

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "User Deleted"));
  } catch (err) {
    res.send(error(500, err.message));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, { user }));
  } catch (e) {
    res.send(error(500, e.message));
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;
    const user = await User.findById(req._id);

    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "userProfileImg",
      });

      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }

    await user.save();
    return res.send(success(200, { user }));
  } catch (err) {
    res.send(error(500, err.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });
    const fullPosts = user.posts;
    const posts = fullPosts
      ?.map((item) => mapPostOutput(item, req._id))
      .reverse();
    // console.log({ ...user._doc, posts });
    return res.send(success(200, { ...user._doc, posts }));
  } catch (err) {
    // console.log(err.message);
    return res.send(error(500, err.message));
  }
};

module.exports = {
  followOrUnfollowUserController,
  getPostOfFollowing,
  getMyPostController,
  getUserPostController,
  deleteMyProfileController,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
};
