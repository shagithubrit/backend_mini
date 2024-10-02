const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");

function userMiddleware(req, res, next) {
    const token = req.headers.token;
    try{
        const decoded = jwt.verify(token, JWT_USER_PASSWORD);
        if(decoded){
            req.userId= decoded.id;
            next();
        }
        else{
            res.status(403).json({
                message: "You are not signe in",
                error :" you are not signed in",
                status :403,
                success : false,
                data : null
            })
        }
    }catch(error){
        res.status(403).json({
            message :  "You  are not signed in",
            error : " yoh are not signed in",
            status : 403,
            success: false,
            data: null,
        })
    }
}

module.exports = {
    userMiddleware: userMiddleware
}