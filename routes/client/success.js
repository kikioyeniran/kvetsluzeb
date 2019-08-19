const express = require('express');
const router = express.Router();

//Payment Success route
router.get('/:clientID', (req, res) =>{
    var clientID = req.params.clientID;
    var revisit  = true;
    res.render('client/success',{
        revisit: revisit,
        clientID: clientID
    })
});
 
module.exports = router;
