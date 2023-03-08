const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const {mapPostOutput} = require("../utils/Utils");

const createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;
    if (!caption || !postImg) {
      res.send(error(400, "caption and post image required is required"));
    }

    const cloudImg = await cloudinary.uploader.upload(postImg, {
      folder: "postImg",
    });
    const owner = req._id;
    // console.log("1");
    const user = await User.findById(req._id);
    const post = await Post.create({
      owner,
      caption,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.url,
      },
    });
    // console.log("2");
    user.posts.push(post._id);
    await user.save();
    // console.log(post);
    return res.send(success(201, { post }));
  } catch (err) {
    // console.log("hy");
    // console.log(err.message);
    return res.send(error(500, err.message));
  }
};

const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const currUserId = req._id;

    const post = await Post.findById(postId).populate("owner");
    if (!post) {
      res.send(error(404, "post not found"));
    }

    if (post.likes.includes(currUserId)) {
      const index = post.likes.indexOf(currUserId);
      post.likes.splice(index, 1);
    } else {
      post.likes.push(currUserId);
    }
    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const currUserId = req._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "not found"));
    }

    if (post.owner.toString() != currUserId) {
      return res.send(error(403, " only owner can update their post"));
    }
    if (caption) {
      post.caption = caption;
    }

    await post.save();
    return res.send(200, post);
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const deletePostController = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    const curUser = await User.findById(curUserId);
    if (!post) {
      return res.send(error(404, "not found"));
    }

    if (post.owner.toString() != currUserId) {
      return res.send(error(403, " only owner can update their post"));
    }

    const index = curUser.posts.indexOf(postId);
    curUser.posts.splice(index, 1);
    await curUser.save();
    await post.remove();

    return res.send(success(200, "post deleted"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};
module.exports = {
  createPostController,
  likeAndUnlikePost,
  updatePostController,
  deletePostController,
};
