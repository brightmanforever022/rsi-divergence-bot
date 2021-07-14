const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { request } = require("http");
const { response } = require("express");


exports.login = async (request, response) => {
    //fs.readFile(path.join(__dirname + "/../models/admin.json"), (error, data) => {
        //const admin = JSON.parse(data);
        const admin = {
            username: "admin",
            password: "password"
        };
        if(request.body.username === admin.username && request.body.password === admin.password) {
            const token = jwt.sign(admin, "1vr1U7iiYwV7Y3Bjn7ArHXiiTeCyh97EOWsV7pgvTdnj6zLrtbWujN6uq8npFfu", {
                expiresIn: "1h"
            });
            response.cookie("token", token);
            response.sendStatus(200);
        }
        else {
            response.sendStatus(401);
        }
    //});

};



exports.adminPing = (request, response) => {
    response.sendStatus(200);
};

exports.scannerFilters = (request, response) => {
    const filters = JSON.parse(fs.readFileSync(__dirname + "/../scanner/filters.json"));
    response.json(filters);
};

exports.updateFilters = (request, response) => {
    let filters = JSON.parse(fs.readFileSync(__dirname + "/../scanner/filters.json"));
    filters[request.query.timeframe] = request.body;
    fs.writeFileSync(__dirname + "/../scanner/filters.json", JSON.stringify(filters));
    response.sendStatus(200);
}

exports.scannerHistory = (request, response) => {
    const stocks = JSON.parse(fs.readFileSync(__dirname + "/../scanner/stocks.json"));
    response.json(stocks);
};


exports.updateComment = (request, response) => {
    let currentStocks = JSON.parse(fs.readFileSync(__dirname + "/../scanner/stocks.json"));
    //currentStocks[request.query.timeframe][request.query.date][parseInt(request.query.index)] = request.body;
    for(let i = 0; i< currentStocks[request.query.timeframe][request.query.date].length; i++) {
        const stock = currentStocks[request.query.timeframe][request.query.date][i]; 
        
        if(stock.ticker === request.query.ticker && stock.date.substring(0, 25) === request.query.alertDate.substring(0, 25)) {
             currentStocks[request.query.timeframe][request.query.date][i] = request.body;
             break;
        }
    }
    fs.writeFileSync(__dirname + "/../scanner/stocks.json", JSON.stringify(currentStocks));
    response.sendStatus(200);
};
