module.exports = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            req.flash('error', 'Access Denied')
            // return res.redirect("back")
            console.log("authorization check");            
            return res.status(401).json("acess denied")
        }
        next();
    }
}