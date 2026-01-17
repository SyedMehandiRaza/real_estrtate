const express = require("express");


const router  = express.Router();

router.get("/marketing", (req, res) => {
    res.send("Marketing")
});

module.exports = router;