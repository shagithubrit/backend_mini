const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt= require("bcrypt");
const zod = require('zod');
const  { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");

const userRouter = Router();

userRouter.post("/signup", async function(req, res) {
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
        console.log("Hashed Password:", hashedPassword); // Debugging line

        // Create user in the database
        await userModel.create({
            email: validated.email,
            password: hashedPassword,
            firstName: validated.firstName,
            lastName: validated.lastName 
        });

        // Respond with success message
        res.json({
            message: "Signup succeeded"
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
        
        // For other errors, respond with a generic error message
        res.status(500).json({
            message: "An error occurred during signup",
            error: error.message,
        });
    }
});


// userRouter.post("/signin",async function(req, res) {
//     const { email, password } = req.body;

//     // TODO: ideally password should be hashed, and hence you cant compare the user provided password and the database password

//     // so this below logic will won't work 
//     // to make it work we need to use bcrypt library 
//     // const user = await userModel.findOne({
//     //     email: email,
//     //     password: password
//     // }); //[]

//     const user = await userModel.findOne({
//         email: email,
//         password: await bcrypt.hash(password, 10),
//     })

//     if (user) {
//         const token = jwt.sign({
//             id: user._id,
//         }, JWT_USER_PASSWORD);

//         // Do cookie logic

//         // here we are doing token based authentication 
//         // so we are sending the token in the response 
//         // and we are decoding the token in the frontend
//         // to verify the user 

//         res.json({
//             token: token
//         })
//     } else {
//         res.status(403).json({
//             message: "Incorrect credentials"
//         })
//     }
// })
userRouter.post("/signin", async function(req, res) {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await userModel.findOne({ email });

        // If user is found, compare the hashed password
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({
                id: user._id,
            }, JWT_USER_PASSWORD);

            // Token based authentication
            res.json({
                token: token
            });
        } else {
            res.status(403).json({
                message: "Incorrect credentials"
            });
        }
    } catch (error) {
        // Handle any unexpected errors
        res.status(500).json({
            message: "An error occurred while processing your request.",
            error: { cause: error.message },
            status: 500,
            success: false,
            data: null,
        });
    }
});


userRouter.get("/purchases", userMiddleware, async function(req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId,
    });

    let purchasedCourseIds = [];

    for (let i = 0; i<purchases.length;i++){ 
        purchasedCourseIds.push(purchases[i].courseId)
    }


    // WHAT DOES THIS COURSE DATA DO??
    // THIS IS WHERE WE ARE FETCHING THE COURSE DATA
    // WE ARE FETCHING THE COURSE DATA BASED ON THE COURSE IDS
    // WHICH WE HAVE FETCHED FROM THE PURCHASES
    const coursesData = await courseModel.find({
        _id: { $in: purchasedCourseIds }
    })

    res.json({
        purchases,
        coursesData
    })
})

module.exports = {
    userRouter: userRouter
}