const { Router } = require("express");
const { userMiddleware } = require("../middleware/user");
const { purchaseModel, courseModel } = require("../db")
const courseRouter = Router();

courseRouter.post("/purchase", userMiddleware, async function(req, res) {
  const userId = req.userId;
  const {courseId}= req.body;
  // also add the check to avoid duplicate purchase 
  const message = "Course purchased successfully";

  // TODO: add the check to avoid duplicate purchase
  // also add the check to avoid purchase by non-signed in user
  // also add the check to avoid purchase by non-admin  
  try{
     const  purchase = await purchaseModel.findOne({
     userId: userId,
     courseId: courseId,
})
if(purchase){
    res.json({
        message : "You have already purchased this course",
        success : false,
        status : 403,
        data : null,
    })
}else{

    await purchaseModel.create({
        userId: userId,
        courseId: courseId,
    })
    res.json({
        message: "Course purchased successfully",
        success : true,
        status : 200,
        data : null,
    })
}
}catch(error){
    res.status(500).json({
        message: "An error occured while purchasing course",
        error: "error occured while purchasing course",
        success: false,
        status: 500,
        data: null,
    })
  }
})

courseRouter.get("/preview", async function(req, res) {
    
    const courses = await courseModel.find({});

    res.json({
        courses
    })
})

module.exports = {
    courseRouter: courseRouter
}