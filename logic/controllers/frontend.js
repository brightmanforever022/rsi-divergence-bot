const path = require("path");

module.exports.home = (request, response) => {
	response.sendFile(path.join(__dirname + "/../../frontend/public/index.html"));
};

module.exports.static = (request, response) => {
    response.sendFile(path.join(__dirname, "/../../frontend/", request.path.replace("/static", "")));
};

module.exports.js = (request, response) => {
    //request.url = request.url + ".gz";
    //response.set("Content-Encoding", "gzip");
    //response.sendFile(path.join(__dirname + "/../../frontend/build/bundle.js.gz"));
    response.sendFile(path.join(__dirname + "/../../frontend/public/bundle.js"));

};

module.exports.favicon = (request, response) => {
    response.sendFile(path.join(__dirname + "/../../frontend/public/favicon/favicon.ico"));
}

module.exports.logo = (request, response) => {
    response.sendFile(path.join(__dirname + "/../../frontend/public/wtc_logo.webp"));
}

module.exports.logoWhite = (request, response) => {
    response.sendFile(path.join(__dirname + "/../../frontend/public/white_logo.webp"));
}

module.exports.robots = (request, response) => {
    response.sendFile(path.join(__dirname + "/../../frontend/public/robots.txt"));
}
