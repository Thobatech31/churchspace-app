const req = require("express/lib/request");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // const authHeader = req.headers.token;
    const token = req.header('Authorization').replace('Bearer ', '')
    // if(authHeader){
    if (token) {
        // const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, user) => {
            if (err)
                return res.status(403).json({ msg: "Token is not valid" });
           
        
                req.user = user;
                next();

           
        })
    } else {
        return res.status(401).json({ msg: "Sorry you are not authenticated" });
    };
};


const verifyTokenUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            return res.status(403).json({ msg: "You are not allowed to do that (Only users User)" });
        } else {
            next();
        }
    });
};

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ msg: "You are not allowed to do that (Only Admin User)" });
        }
    });
};


const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ msg: "You are not allowed to do that (Only Super admin are allow)" });
        }
    });
};

module.exports = { verifyToken, verifyTokenUser, verifyTokenAndAuthorization, verifyTokenAndAdmin };