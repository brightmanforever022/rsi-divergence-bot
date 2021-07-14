module.exports = app => {
    const controller = require("../controllers").frontend;
    app.get("/static/build/bundle.js", controller.js);
    app.get("/static/favicon.ico", controller.favicon);
    app.get("/static/wtc_logo.webp", controller.logo);
    app.get("/static/wtc_logo_white.webp", controller.logoWhite);
    app.get("/robots.txt", controller.robots);

    //app.get("/static/*", controller.static);
    app.get("*", controller.home);

};
