const adminMiddleware = require("../middleware/admin");

module.exports = app => {
    const controller = require("../controllers").api;
    app.post("/api/admin/login", controller.login);
    app.get("/api/admin/ping", adminMiddleware, controller.adminPing);
    app.get("/api/admin/scanner/filters", adminMiddleware, controller.scannerFilters);
    app.post("/api/admin/scanner/filters/update", adminMiddleware, controller.updateFilters);
    app.post("/api/admin/scanner/stocks/updateComment", adminMiddleware, controller.updateComment);
    app.get("/api/admin/scanner/history", adminMiddleware, controller.scannerHistory);
};
