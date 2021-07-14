const jwt = require("jsonwebtoken");
const secret = "1vr1U7iiYwV7Y3Bjn7ArHXiiTeCyh97EOWsV7pgvTdnj6zLrtbWujN6uq8npFfu";
const withAuth = function(req, res, next) {
    const token = req.cookies ? req.cookies.token : null;
    if (!token) {
        res.sendStatus(401);
    } else {
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                //console.log(err);
                res.sendStatus(401);
            } else {
                req.username = decoded.username;
                next();
            }
        });
    }
}
module.exports = withAuth;