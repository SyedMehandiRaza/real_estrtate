module.exports = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            req.flash('error', 'Access Denied')
            console.log("authorization check");            
            return res.redirect("Referer")
        }
        next();
    }
}