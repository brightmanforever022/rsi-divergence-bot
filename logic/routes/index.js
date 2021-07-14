module.exports = app => {
    const api = require("./api");
    const frontend = require("./frontend");
    api(app);
    frontend(app);
};