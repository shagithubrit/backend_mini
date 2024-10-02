const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

// function middleware(password) {
//     return function(req, res, next) {
//         const token = req.headers.token;
//         const decoded = jwt.verify(token, password);

//         if (decoded) {
//             req.userId = decoded.id;
//             next()
//         } else {
//             res.status(403).json({
//                 message: "You are not signed in"
//             })
//         }    
//     }
// }

function adminMiddleware(req, res, next) {
   const token =req.headers.token;

   try{
   const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);
   if(decoded){
    req.userId= decoded.id;
    next();
   }
   else{
    res.status(403).json({
        message : "Ypu are not signed in",
        error : "you are not signed in",
        status: 403,
        success: false,
        data : null,
    })
   }
}catch(error){
    res.status(403).json({
        message : "You are not signed in",
        error : "you are not signed in",
        status: 403,
        success: false,
        data: null,
    })
}
}

module.exports = {
    adminMiddleware: adminMiddleware
}