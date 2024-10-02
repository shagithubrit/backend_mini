const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt= require("bcrypt");
const zod = require('zod');
// brcypt, zod, jsonwebtoken
const  { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

// use bcrypt to hash the password 
// use zod validation yto validate the input 


adminRouter.post("/signup", async function(req, res) {
    const { email, password, firstName, lastName } = req.body;

    // Define Zod validation schema
    const schema = zod.object({
        email: zod.string().email(),
        password: zod.string().min(8),
        firstName: zod.string(),
        lastName: zod.string()
    });

    try {
        // Validate input
        const validated = schema.parse({ email, password, firstName, lastName });

        // Hash the password
        const hashedPassword = await bcrypt.hash(validated.password, 10);

        // Create admin in the database
        const admin = await adminModel.create({
            email: validated.email,
            password: hashedPassword,
            firstName: validated.firstName,
            lastName: validated.lastName 
        });

        // Respond with success message
        res.json({
            message: "Sign up succeeded",
            admin: admin,
        });
    } catch (error) {
        console.error("Error during signup:", error);
        
        // Handle validation errors or other errors
        if (error instanceof zod.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.errors,
            });
        }
        
        // For other errors, you may want to respond with a generic error message
        res.status(500).json({
            message: "An error occurred during signup",
            error: error.message,
        });
    }
});


adminRouter.post("/signin", async function(req, res) {
    const {email , password} = req.body;

    // TODO: ideally password should be hashed, and hence you cant compare the user provided password and the database password
    // but what we are doing here is just checking if the email and password are correct but the password is hashed in the database so we need to use bcrypt library to hash it 

   const admin = await adminMOdel.findOne({
     email : email,
     password: await bcrypt.hash(password,10)
   })

   if(admin){
    const token = jwt.sign({
        id: admin._id
    }, JWT_ADMIN_PASSWORD);
   }

   // in total we have three types of authentication 
   // 1. cookie based authentication 
   // 2. token based authentication 
   // 3. session based authentication
   // here we are doing token based authentication 
   // so we are sending the token in the response 
   // and we are decoding the token in the frontend
   // to verify the user
    
   res.json({
    token:token
   })
    // const { email, password } = req.body;

    // // TODO: ideally password should be hashed, and hence you cant compare the user provided password and the database password
    // const admin = await adminModel.findOne({
    //     email: email,
    //     password: password
    // });

    // if (admin) {
    //     const token = jwt.sign({
    //         id: admin._id
    //     }, JWT_ADMIN_PASSWORD);

    //     // Do cookie logic

    //     res.json({
    //         token: token
    //     })
    // } else {
    //     res.status(403).json({
    //         message: "Incorrect credentials"
    //     })
    // }
})

adminRouter.post("/course", adminMiddleware, async function(req, res) {
    // const adminId = req.userId;

    // const { title, description, imageUrl, price } = req.body;

    // // creating a web3 saas in 6 hours
    // const course = await courseModel.create({
    //     title: title, 
    //     description: description, 
    //     imageUrl: imageUrl, 
    //     price: price, 
    //     creatorId: adminId
    // })

    // res.json({
    //     message: "Course created",
    //     courseId: course._id
    // })
})

adminRouter.put("/course", adminMiddleware, async function(req, res) {
    // const adminId = req.userId;

    // const { title, description, imageUrl, price, courseId } = req.body;

    // // creating a web3 saas in 6 hours
    // const course = await courseModel.updateOne({
    //     _id: courseId, 
    //     creatorId: adminId 
    // }, {
    //     title: title, 
    //     description: description, 
    //     imageUrl: imageUrl, 
    //     price: price
    // })

    // res.json({
    //     message: "Course updated",
    //     courseId: course._id
    // })
})

adminRouter.get("/course/bulk", adminMiddleware,async function(req, res) {
    // const adminId = req.userId;

    // const courses = await courseModel.find({
    //     creatorId: adminId 
    // });

    // res.json({
    //     message: "Course updated",
    //     courses
    // })
})

module.exports = {
    adminRouter: adminRouter
}