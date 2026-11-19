module.exports = app => {
    var hardwarekey = require('../controller/hardwarekey.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');
    // Legacy enrollments store credential IDs without verification public keys.
    router.post(["/register-key", "/register", "/verify", "/login-key", "/login"], (req, res) => {
        res.status(403).json({ status: 'false', message: 'Legacy security key login and enrollment are unavailable' });
    });

    router.post("/get",auth, hardwarekey.getKey);
    router.post("/delete",auth, hardwarekey.delete);

    app.use('/api/hardwarekey', router);
};