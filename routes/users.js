const User= require("../models/User");
const router = require("express").Router();
const bcrypt= require("bcrypt");

//trying chatgpt
router.get("/", async (req, res) => {
     try {
       const { userId, username } = req.query;
       
       if (!userId && !username) {
         return res.status(400).json({ error: "Please provide either userId or username" });
       }
       
       let user;
       if (userId) {
         user = await User.findById(userId);
       } else {
         user = await User.findOne({ username: username });
       }
   
       if (!user) {
         return res.status(404).json({ error: "User not found" });
       }
       
       const { password, updatedAt, ...userData } = user.toObject(); // toObject() to convert Mongoose document to plain JavaScript object
       res.status(200).json(userData);
     } catch (err) {
       console.error("Error:", err);
       res.status(500).json({ error: "Internal Server Error" });
     }
   });
   






//update user
  router.put("/:id", async(req,res)=>{
       if(req.body.userId === req.params.id || req.body.isAdmin){
            if(req.body.password){
              try{
                     const salt = await bcrypt.genSalt(10);
                     req.body.password= await bcrypt.hash(req.body.password,salt);
              }
              catch(err){
                    return res.status(500).json(err);
              }
            }
          try{
               const user = await User.findByIdAndUpdate(req.params.id,{
                     $set: req.body,
               });
               res.status(200).json("YOUR ACCOUNT HAS BEEN SUCCESSFULLY UPDATED")
          } 
          catch(err){
              return res.status(500).json(err);
          }

       }else{
              return res.status(403).json("YOU CAN ONLY UPDATE YOUR OWN ACCOUNT!")
       }
  });

//delete user
router.delete("/:id", async(req,res)=>{
       if(req.body.userId === req.params.id || req.body.isAdmin){
          try{
               const user = await User.findByIdAndDelete(req.params.id);
               res.status(200).json("YOUR ACCOUNT HAS BEEN  DELETED SUCCESSFULLY")
          } 
          catch(err){
              return res.status(500).json(err);
          }

       }else{
              return res.status(403).json("YOU CAN ONLY DELETE YOUR OWN ACCOUNT!")
       }
  });

//   router.get("/name/:name", async (req,res)=>{
//      // res.send("working");
//      //   const {name} = req.params.name;
//          try{
//              const user =  await User.find({
//                username:req.params.name
//              }) ;
//           //    const {password,updatedAt, ...other}= user._doc;
//              res.status(200).json(user[0]);
//          } 
//          catch(err){
//           console.log(err)
//           res.status(500).json({data:err});
//          }  
//   });
  //get a user
router.get("/:id", async (req,res)=>{
     // const {id} =req.query;
       try{
           const user =  await User.findById(req.params.id) ;
           const {password,updatedAt, ...other}= user._doc;
           res.status(200).json(other);
       } 
       catch(err){
              res.status(500).json(err);
       }  
});

//get friends
router.get("/friends/:userId", async (req, res) => {
     try {
       const user = await User.findById(req.params.userId);
       const friends = await Promise.all(
         user.followings.map((friendId) => {
           return User.findById(friendId);
         })
       );
       let friendList = [];
       friends.map((friend) => {
         const { _id, username, profilePicture } = friend;
         friendList.push({ _id, username, profilePicture });
       });
       res.status(200).json(friendList)
     } catch (err) {
       res.status(500).json(err);
     }
   });

//follow a user
router.put("/:id/follow", async (req,res)=>{
     if(req.body.userId !== req.params.id){
          try{
               const user= await User.findById(req.params.id);
               const currentUser= await User.findById(req.body.userId);
               if(!user.followers.includes(req.body.userId)){
                    await  user.updateOne({$push:{followers: req.body.userId}});
                    await  currentUser.updateOne({$push:{followings: req.params.id}});
                    res.status(200).json("USER HAS BEEN FOLLOWED SUCCESSFULLY!");
               }else{
                     res.status(403).json("YOU ALREADY FOLLOW THIS USER");
               }
          }catch(err){
              res.status(500).json(err);
          }
     }else{
          res.status(403).json("YOU CANNOT FOLLOW YOURSELF");
     }
});

//unfollow a user
router.put("/:id/unfollow", async (req,res)=>{
       if(req.body.userId !== req.params.id){
            try{
                 const user= await User.findById(req.params.id);
                 const currentUser= await User.findById(req.body.userId);
                 if(user.followers.includes(req.body.userId)){
                      await  user.updateOne({$pull:{followers: req.body.userId}});
                      await  currentUser.updateOne({$pull:{followings: req.params.id}});
                      res.status(200).json("USER HAS BEEN UNFOLLOWED SUCCESSFULLY!");
                 }else{
                       res.status(403).json("YOU DON'T FOLLOW THIS USER");
                 }
            }catch(err){   
                res.status(500).json(err);
            }
       }else{
            res.status(403).json("YOU CANT UNFOLLOW YOURSELF");
       }
  });
 

//   //get a user
// router.get("/", async (req, res) => {
//      console.log("Hello", req.data);
//      // const userId = "65da5db431397bfb50e95d09";
//      // const userId = req.query.userId;
//      // const username = req.query.username;
//      try {
//        const user = await User.findOne({ username: "prashant" })
//        console.log(user)
//      //     : await User.findOne({ username: username });
//        const { password, updatedAt, ...other } = user._doc;
//        res.status(200).json(other);
//      } catch (err) {
//        res.status(500).json(err);
//      }
//    });
   
//    //get friends
//    router.get("/friends/:userId", async (req, res) => {
//      try {
//        const user = await User.findById(req.params.userId);
//        const friends = await Promise.all(
//          user.followings.map((friendId) => {
//            return User.findById(friendId);
//          })
//        );
//        let friendList = [];
//        friends.map((friend) => {
//          const { _id, username, profilePicture } = friend;
//          friendList.push({ _id, username, profilePicture });
//        });
//        res.status(200).json(friendList)
//      } catch (err) {
//        res.status(500).json(err);
//      }
//    });
   
//    //follow a user
   
//    router.put("/:id/follow", async (req, res) => {
//      if (req.body.userId !== req.params.id) {
//        try {
//          const user = await User.findById(req.params.id);
//          const currentUser = await User.findById(req.body.userId);
//          if (!user.followers.includes(req.body.userId)) {
//            await user.updateOne({ $push: { followers: req.body.userId } });
//            await currentUser.updateOne({ $push: { followings: req.params.id } });
//            res.status(200).json("user has been followed");
//          } else {
//            res.status(403).json("you allready follow this user");
//          }
//        } catch (err) {
//          res.status(500).json(err);
//        }
//      } else {
//        res.status(403).json("you cant follow yourself");
//      }
//    });
   
//    //unfollow a user
   
//    router.put("/:id/unfollow", async (req, res) => {
//      if (req.body.userId !== req.params.id) {
//        try {
//          const user = await User.findById(req.params.id);
//          const currentUser = await User.findById(req.body.userId);
//          if (user.followers.includes(req.body.userId)) {
//            await user.updateOne({ $pull: { followers: req.body.userId } });
//            await currentUser.updateOne({ $pull: { followings: req.params.id } });
//            res.status(200).json("user has been unfollowed");
//          } else {
//            res.status(403).json("you dont follow this user");
//          }
//        } catch (err) {
//          res.status(500).json(err);
//        }
//      } else {
//        res.status(403).json("you cant unfollow yourself");
//      }
//    });
module.exports = router ;