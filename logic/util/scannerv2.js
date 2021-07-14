const fs = require("fs");
const express = require("express");
const app = express();
const socketIO= require("socket.io");
const secret = "1vr1U7iiYwV7Y3Bjn7ArHXiiTeCyh97EOWsV7pgvTdnj6zLrtbWujN6uq8npFfu";
const API_KEY = "sHI69fHyUF5qLPgf0M4XmD7vkBAPbobf";
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const moment = require("moment");
const RSICalculator = require("technicalindicators").RSI;
const https = require("https");
const TelegramBot = require("node-telegram-bot-api");
let TOKEN;

const server = app.listen(3001, () => {
    console.log("Listening...");
});

const io = socketIO(server, {
    cors: {
        origin: "http://iodigitalbot.com",
        credentials: true
      }
});

io.use((socket, next) => {
    if(socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, secret, (error, decoded) => {
            if(error)
                return next(new Error("Authentication error"));
            socket.decoded = decoded;
            next();
        });
    }
    else
        next(new Error("Authentication error"));
})

io.on("connection", socket => {
    socket.on("disconnect", () => {
        console.log("Disconnected");
    });
    console.log("Connected");
});

const bot = new TelegramBot("1560538400:AAHFbcShVYUw8U_3WWuLggdSRfhF3bq6wQY", {polling: true});
let chatId = {};
bot.onText(RegExp("/load 60min"), (msg, match) => {
  chatId["60min"] = msg.chat.id; 
  bot.sendMessage(chatId["60min"], "Will send alerts for 60min timeframe.");
});
bot.onText(RegExp("/load 4h"), (msg, match) => {
    chatId["4h"] = msg.chat.id; 
    bot.sendMessage(chatId["4h"], "Will send alerts for 4h timeframe.");
  });
  bot.onText(RegExp("/load 1d"), (msg, match) => {
    chatId["1d"] = msg.chat.id; 
    bot.sendMessage(chatId["1d"], "Will send alerts for 1d timeframe.");
  });
  bot.onText(RegExp("/load 1w"), (msg, match) => {
    chatId["1w"] = msg.chat.id; 
    bot.sendMessage(chatId["1w"], "Will send alerts for 1w timeframe.");
  });
  bot.onText(RegExp("/load 1m"), (msg, match) => {
    chatId["1m"] = msg.chat.id; 
    bot.sendMessage(chatId["1m"], "Will send alerts for 1m timeframe.");
  });
bot.onText(RegExp("/load test"), (msg, match) => {
    chatId["test"] = msg.chat.id;
    bot.sendMessage(chatId["test"], "Will send all alerts");
  });

const searchForFailedDivergences = (rsiData, priceData) => {
    let previousPivotDateBullish = "";
    let rsiPivotsBullish = [];

    let divergencesBullish = [];
    let lastPivotValue = -1;
    for(let i = Object.keys(rsiData).length - 1; i >= 0; i--) {
        const rsi = parseFloat(rsiData[Object.keys(rsiData)[i]]);
        const rsiPivotArray = Object.values(rsiData).slice(i + 1, i + 6).concat(Object.values(rsiData).slice(i - 5, i));
        let rsiPivotLow = Math.min(...rsiPivotArray);
        if(rsi <= rsiPivotLow) {
            if(rsi == lastPivotValue) {
                rsiPivotsBullish.pop();
            }
            lastPivotValue = rsi;
            rsiPivotsBullish.push(Object.keys(rsiData)[i]);
        }

    }

    let previousPivotDateBearish = "";
    let rsiPivotsBearish = [];

    let divergencesBearish = [];
    lastPivotValue = -1;
    for(let i = Object.keys(rsiData).length - 1; i >= 0; i--) {
        const rsi = parseFloat(rsiData[Object.keys(rsiData)[i]]);
        const rsiPivotArray = Object.values(rsiData).slice(i + 1, i + 6).concat(Object.values(rsiData).slice(i - 5, i));
        let rsiPivotLow = Math.max(...rsiPivotArray);
        if(rsi >= rsiPivotLow) {
            if(rsi == lastPivotValue) {
                rsiPivotsBearish.pop();
            }
            lastPivotValue = rsi;
            rsiPivotsBearish.push(Object.keys(rsiData)[i]);
        }

    }

    let searchingForHiddenBullish = false;
    let searchingForHiddenBearish = false;
    let lowestRSIHiddenBullish = -1;
    let lowestRSIHiddenBearish = -1;
    let lowestRSIPriceHiddenBullish = -1;
    let lowestRSIDateHiddenBullish = "";
    let hiddenBullishDivergences = [];
    let highestRSIHiddenBearish = -1;
    let highestRSIHiddenBullish= -1;
    let highestRSIPriceHiddenBearish = -1;
    let highestRSIDateHiddenBearish = "";
    let hiddenBearishDivergences = [];
    for(let i = Object.keys(rsiData).length - 1; i >= 0; i--) {
        const priceLow = parseFloat(priceData[Object.keys(priceData)[i]]["Low"]);
        const priceHigh = parseFloat(priceData[Object.keys(priceData)[i]]["High"]);
        const rsi = parseFloat(rsiData[Object.keys(rsiData)[i]]);
        if(previousPivotDateBullish !== "" && rsi > parseFloat(rsiData[previousPivotDateBullish]) && priceLow < parseFloat(priceData[previousPivotDateBullish]["Low"]) && rsiPivotsBullish.indexOf(Object.keys(priceData)[i]) >= 0) {
            let highestRSI = -1;
            let highestRSIDate = "";
            let lowestRSI = Infinity;
            for(let y = Object.keys(rsiData).indexOf(previousPivotDateBullish); y >= i; y--) {
                const currentRSI = parseFloat(rsiData[Object.keys(rsiData)[y]]);
                if(currentRSI > highestRSI) {
                    highestRSI = currentRSI;
                    highestRSIPrice = parseFloat(priceData[Object.keys(priceData)[y]]["High"]);
                    highestRSIDate = Object.keys(rsiData)[y]; 
                }
                if(currentRSI < lowestRSI) {
                    lowestRSI = currentRSI;
                }
            }
            searchingForHiddenBearish = true;
            searchingForHiddenBullish = false;
            highestRSIHiddenBearish = highestRSI;
            highestRSIPriceHiddenBearish = highestRSIPrice;
            highestRSIDateHiddenBearish = highestRSIDate;
            lowestRSIHiddenBearish = lowestRSI;
            divergencesBullish.push({
                "start": previousPivotDateBullish,
                "end": Object.keys(priceData)[i]
            });
        }

        if(rsiPivotsBullish.indexOf(Object.keys(priceData)[i]) >= 0) {
            previousPivotDateBullish = Object.keys(priceData)[i];
        }

        if(previousPivotDateBearish !== "" && rsi < parseFloat(rsiData[previousPivotDateBearish]) && priceHigh > parseFloat(priceData[previousPivotDateBearish]["High"]) && rsiPivotsBearish.indexOf(Object.keys(priceData)[i]) >= 0) {
            let lowestRSI = Infinity;
            let lowestRSIDate = "";
            let highestRSI = -1;
            
            for(let y = Object.keys(rsiData).indexOf(previousPivotDateBearish); y >= i; y--) {
                const currentRSI = parseFloat(rsiData[Object.keys(rsiData)[y]]);
                if(currentRSI < lowestRSI) {
                    lowestRSI = currentRSI;
                    lowestRSIPrice = parseFloat(priceData[Object.keys(priceData)[y]]["Low"]);
                    lowestRSIDate = Object.keys(rsiData)[y]; 
                }
                if(currentRSI > highestRSI) {
                    highestRSI = currentRSI;
                }
            }
            searchingForHiddenBullish = true;
            searchingForHiddenBearish = false;
            lowestRSIHiddenBullish = lowestRSI;
            highestRSIHiddenBullish = highestRSI;
            lowestRSIPriceHiddenBullish = lowestRSIPrice;
            lowestRSIDateHiddenBullish = lowestRSIDate;
            divergencesBearish.push({
                "start": previousPivotDateBearish,
                "end": Object.keys(priceData)[i]
            });

        }

        if(rsiPivotsBearish.indexOf(Object.keys(priceData)[i]) >= 0) {
            previousPivotDateBearish = Object.keys(priceData)[i];
        }

        if(searchingForHiddenBullish && rsi < lowestRSIHiddenBullish) {
            searchingForHiddenBullish = false;
            if(priceLow > lowestRSIPriceHiddenBullish) {
                hiddenBullishDivergences.push({
                    "start": lowestRSIDateHiddenBullish,
                    "end": Object.keys(priceData)[i]
                });
            }
        }

        if(searchingForHiddenBullish && rsi > highestRSIHiddenBullish) {
            searchingForHiddenBullish = false;
        }

        if(searchingForHiddenBearish && rsi < lowestRSIHiddenBearish) {
            searchingForHiddenBearish = false;
        }

        if(searchingForHiddenBearish && rsi > highestRSIHiddenBearish) {
            searchingForHiddenBearish = false;
            if(priceHigh < highestRSIPriceHiddenBearish) {
                hiddenBearishDivergences.push({
                    "start": highestRSIDateHiddenBearish,
                    "end": Object.keys(priceData)[i]
                });
            }
        }
    }
    return {
        "bullish": hiddenBullishDivergences,
        "bearish": hiddenBearishDivergences
    }
    
};

const getHigherTimeframe = (priceData, timeframe, isEOD = false) => { 
    let TIMEFRAME_H = "";
    if(timeframe === "4h") {
        TIMEFRAME_H = 3;
        let newPriceData = {};
        for(let i = 0; i < 280; i++) {
            newPriceData[Object.keys(priceData)[i]] = Object.values(priceData)[i];
        }
        priceData = newPriceData;

        while(Object.keys(priceData)[Object.keys(priceData).length - 2].substring(0, 15) === Object.keys(priceData)[Object.keys(priceData).length - 1].substring(0, 15)) {
            delete priceData[Object.keys(priceData)[Object.keys(priceData).length - 1]];
        }
        delete priceData[Object.keys(priceData)[Object.keys(priceData).length - 1]];
        if(Object.keys(priceData).length < 15) {
            return;
        }
    }
    else if(timeframe === "1d") {
        TIMEFRAME_H = 6;
        let newPriceData = {};
        for(let i = 0; i < 512; i++) {
            newPriceData[Object.keys(priceData)[i]] = Object.values(priceData)[i];
        }
        priceData = newPriceData;
        while(Object.keys(priceData)[Object.keys(priceData).length - 2].substring(0, 15) === Object.keys(priceData)[Object.keys(priceData).length - 1].substring(0, 15)) {
            delete priceData[Object.keys(priceData)[Object.keys(priceData).length - 1]];
        }
        delete priceData[Object.keys(priceData)[Object.keys(priceData).length - 1]];
        if(Object.keys(priceData).length < 15) {
            return;
        }
    }

    let newPriceData = {};
    let h = 0;
    let H, L, O, C, V = 0;
    let startDate = "";
    for(let i = Object.keys(priceData).length - 1; i >= 0; i--) {
        if(h === 0) {
            //startDate = Object.keys(priceData)[i];
            O = parseFloat(priceData[Object.keys(priceData)[i]]["Open"]);
            H = parseFloat(priceData[Object.keys(priceData)[i]]["High"]);
            L = parseFloat(priceData[Object.keys(priceData)[i]]["Low"]);
            V = parseFloat(priceData[Object.keys(priceData)[i]]["TotalVolume"]);
            console.log("Open: " + Object.keys(priceData)[i]);
        }
        else {
            const high = parseFloat(priceData[Object.keys(priceData)[i]]["High"]);
            const low = parseFloat(priceData[Object.keys(priceData)[i]]["Low"]);
            const volume = parseFloat(priceData[Object.keys(priceData)[i]]["TotalVolume"]);

            if(high > H) H = high;
            if(low < L) L = low;
            V += volume;
        }
        if(h == TIMEFRAME_H || (timeframe === "4h" && i > 0 && Object.keys(priceData)[i].substring(0, 15) !== Object.keys(priceData)[i - 1].substring(0,15)) || (timeframe === "4h" && i === 0 && isEOD)) {
            C = parseFloat(priceData[Object.keys(priceData)[i]]["Close"]);
            startDate = Object.keys(priceData)[i];
            /*if(timeframe === "4h" && helper2 === false) {
                h = 1;
                helper2 = true;
            }
            else {*/
                h = 0;
                //helper2 = false;
            //}
            newPriceData[startDate] = {
                "Open": O,
                "High": H,
                "Low": L,
                "Close": C,
                "TotalVolume": V
            };
        }
        else {
            h++;
        }
    }
    //console.log(Object.keys(newPriceData));
  
    let helper = {};
    for(let i = Object.keys(newPriceData).length - 1; i >= 0; i--) {
        helper[Object.keys(newPriceData)[i]] = newPriceData[Object.keys(newPriceData)[i]];
    }
    priceData = helper;
        
    let reversed = Object.values(priceData).map(x => parseFloat(x["Close"]));
    reversed.reverse()
    rsiData = RSICalculator.calculate({
        values: reversed,
        period: 14
    });
    rsiData.reverse();

    let newRSIData = {};
    for(let i = 0; i < rsiData.length; i++) {
        newRSIData[Object.keys(priceData)[i]] = rsiData[i];
    }
   
    return {
        priceData: priceData,
        rsiData: newRSIData
    };
};

const getData = async (stock, timeframe) => {
    const requestPromise = new Promise((resolve, reject) => {
        let date = new Date();
        date = new Date(date);
        date.setDate(date.getDate() + 1);
        const formattedDate = parseInt(date.getMonth() + 1) + "-" + parseInt(date.getDate()) + "-" + parseInt(date.getFullYear());
        let timeframeQuery = "60/Minute";
        let quantity = 600;
        if(timeframe === "1w") {
            quantity = 60;
            timeframeQuery = "1/Weekly";
        }
        else if(timeframe === "1m") {
            quantity = 60;
            timeframeQuery = "1/Monthly";
        }
        else if(timeframe === "1d") {
            quantity = 120;
            timeframeQuery = "1/Daily";
        }

        const req = https.get({
            host: "api.tradestation.com",
            path: "/v2/stream/barchart/" + stock + "/" + timeframeQuery + "/" + quantity + "/" + formattedDate + "?SessionTemplate=Default&access_token=" + TOKEN
        }).on("response", response => {
            //console.log(response);
            if(response.statusCode === 403) {
                reject("403");
                return;
            }
            result = ""
            response.on("data", data => {
                result += data;
            });

            response.on("end", () => {
                const a = result;
                result = result.replace("\r", "").replace("END", "").split("\n");
                result = result.splice(0, result.length - 1).map(x => {
                    
                    return JSON.parse(x);
                });

                dataObject = {};

                for(let i = 0; i < result.length; i++) {
                    dataObject[result[i]["TimeStamp"].replace("/Date(", "").replace(")/", "")] = result[i];
                }

                let sortedDataKeys = Object.keys(dataObject).sort((a, b) => parseInt(b) - parseInt(a));
                let sortedData = {};

                for(let i = 0; i < sortedDataKeys.length; i++) {
                    sortedData[new Date(parseInt(sortedDataKeys[i])).toString()] = dataObject[sortedDataKeys[i]];
                }     

                if(!Object.keys(sortedData).length) {
                    console.log("WATCH: ERROR");
                    console.log(a);
                }

                resolve(sortedData);
            });
    
        });
        req.end();
    });
    let priceData;
    try {
        priceData = await requestPromise;  
    }
    catch (error) {
        if(error === "403") {
            return "403";
        }
        return;
    }
    if(!Object.keys(priceData).length) {
        return "ERROR";
    }
    const prices = Object.values(priceData).map(x => x.Close);
    prices.reverse();
        
    let rsiData = RSICalculator.calculate({
        values: prices,
        period: 14
    });
    rsiData.reverse();

    rsiMapped = {};
    priceMapped = {};
    for(let i = 0; i < rsiData.length; i++) {
        const key = Object.keys(priceData)[i];
        rsiMapped[key] = rsiData[i];
        priceMapped[key] = Object.values(priceData)[i];
    }

        /*while(Object.keys(priceMapped).length > 0 && !Object.keys(priceMapped)[Object.keys(priceMapped).length - 1].split(" ")[0].includes("Mon")) {
            delete rsiMapped[Object.keys(priceMapped)[Object.keys(priceMapped).length - 1]];
            delete priceMapped[Object.keys(priceMapped)[Object.keys(priceMapped).length - 1]];
         
        }*/

    return {
        rsiData: rsiMapped,
        priceData: priceMapped
    };
    
    
    
};


const getAccessToken = async () => {
    const refreshToken = "WkhBeWtHSkh0NDNpSC96bTFiMytRV21iMTZhT2h6alAycWxrK2c4T1FRdlBkR2t3RjAzYTcxU3hETFFOeVowenkxUHFmTjBQNVJpTEdPM09TVzU4S2NtUUVQUnFlaGJHa29kUUswcFFmSExvaloydHZOM3Erb2VkNjZjK09sRnVuWm9QdkxZUVFNS0dyT3lUQkZPaTY0ZDRJM1hRNnc4STZtbnRDSytCZ3dBZmpob1k2eERUenFrT1BRREhCaENIbU81aE1zYjhvaFplNmJ1U21pUnVwVnIxSGhzMy9MZGlzWmJKVmZJVUJPcVdHUnJESjFxeUY5a2VycDJwTVhhNA==";
    const requestPromise = new Promise((resolve, reject) => {
        const params = "grant_type=refresh_token&client_id=26A72AC9-D9EB-4E22-AD25-E11314D3BAA1&client_secret=0ddf6201bb0e26fb7946c1602e20a7b531d5&refresh_token=" + refreshToken + "&response_type=token";
        const req = https.request({
            host: "api.tradestation.com",
            path: "/v2/Security/Authorize",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(params)
            }
        }, res => { 
            let data = "";
            res.on("data", d => {  
                data += d; 
            }); 
            res.on("end", () => {
                data = JSON.parse(data);
                resolve(data);
            });
    
        });
        req.write(params);
        req.end();
    });
    const token = (await requestPromise)["access_token"];
    return token;
};

const updateQuotes = async (ticker, timeframe, barsCount = 1, removeLatest = false) => {
    
    if(!fs.existsSync("./historicalData/" + timeframe + "/" + ticker + ".json")) {
        return;
    }
    const requestPromise = new Promise((resolve, reject) => {
        let date = new Date();
        date = new Date(date);
        date.setDate(date.getDate() + 1);
        const formattedDate = parseInt(date.getMonth() + 1) + "-" + parseInt(date.getDate()) + "-" + parseInt(date.getFullYear());
        const modifiedBarsCount = barsCount === 1 ? 2 : barsCount;
        let timeframeQuery = "60/Minute";
        if(timeframe === "1w") {
            timeframeQuery = "1/Weekly";
        }
        else if(timeframe === "1m") {
            timeframeQuery = "1/Monthly";
        }
         else if(timeframe === "1d") {
            timeframeQuery = "1/Daily";
        }
        
        const req = https.get({
            host: "api.tradestation.com",
            path: "/v2/stream/barchart/" + ticker + "/" + timeframeQuery + "/" + modifiedBarsCount + "/" + formattedDate + "?SessionTemplate=Default&access_token=" + TOKEN
        }).on("response", response => {
            result = ""
            if(response.statusCode === 403) {
                reject("403");
                return;
            }
            let x = 0;
            response.on("data", data => {
                if(barsCount === 1 && x <= 1) {
                    result += data;
                }
                else if(barsCount !== 1){
                    result += data;
                }
                x++;
            });

            response.on("end", () => {
                if(result.includes("ERROR") || result.includes("<html")) {
                    reject(result);
                }
                else {
                    result = result.replace("\r", "").replace("END", "").split("\n");
                    
                    result = result.splice(0, result.length - 1).map(x => {
                    
                        return JSON.parse(x);
                    });
    
                    dataObject = {};
    
                    for(let i = 0; i < result.length; i++) {
                        dataObject[result[i]["TimeStamp"].replace("/Date(", "").replace(")/", "")] = result[i];
                    }
                    let sortedData = {};

                    if(barsCount === 1) {
                        let sortedDataKeys = Object.keys(dataObject).sort((a, b) => parseInt(a) - parseInt(b));
        
                        sortedData[new Date(parseInt(sortedDataKeys[0])).toString()] = dataObject[sortedDataKeys[0]];
                        
                    }
                    else {
                        let sortedDataKeys = Object.keys(dataObject).sort((a, b) => parseInt(b) - parseInt(a));
        
                        for(let i = 0; i < sortedDataKeys.length; i++) {
                            sortedData[new Date(parseInt(sortedDataKeys[i])).toString()] = dataObject[sortedDataKeys[i]];
                        } 
                        if(removeLatest && Object.keys(sortedData).length > 1) {
                            delete sortedData[Object.keys(sortedData)[0]];
                        } 
                    }   
                    resolve(sortedData);
                }
            });
    
        });
        req.end();
    });
    let data;
    try {
        console.time("Update quotes download");
        data = await requestPromise;
        console.timeEnd("Update quotes download");
    }
    catch (error) {
        if(error === "403" || error.includes("<html")) {
            return "403";
        }
        return;
    }
    console.time("Update quotes analysis");
    const historicalData = JSON.parse(fs.readFileSync("./historicalData/" + timeframe + "/" + ticker + ".json"));
    console.log("huj");
    for(let i = 0; i < Object.keys(historicalData.priceData).length; i++) {
        if(Object.keys(historicalData.priceData)[i].includes("Jan 25 2021")) {
            //delete historicalData.rsiData[i];
            //delete historicalData.priceData[i];
        }
    }
    const finalObject = Object.assign(data, historicalData["priceData"]);

    const prices = Object.values(finalObject).map(x => x.Close);
    prices.reverse();
    let rsiData = RSICalculator.calculate({
        values: prices,
        period: 14
    });
    const newRSI = rsiData.slice(Math.max(0, rsiData.length - 5), rsiData.length);
    newRSI.reverse();


    tempObject = {};
    for(let i = 0; i < newRSI.length; i++) {
        tempObject[Object.keys(finalObject)[i]] = newRSI[i];
    }
    //tempObject[new Date(parseInt(data.TimeStamp.replace("/Date(", "").replace(")/", ""))).toString()] = newRSI;
    const finalObjectRSI = Object.assign(tempObject, historicalData["rsiData"]);


    fs.writeFileSync("./historicalData/" + timeframe + "/" + ticker + ".json", JSON.stringify({
        priceData: finalObject,
        rsiData: finalObjectRSI
    }), () => {});
    console.timeEnd("Update quotes analysis");

    return {
        priceData: finalObject,
        rsiData: finalObjectRSI
    };
};

const saveHistoricalData = async (ticker, timeframe) => {
    console.time("Downloading");
    let data = await getData(ticker, timeframe);
    if(data === "403") {
        console.log("403");
        const waitForRateReset = new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                console.log("Retrying...");
                getData(ticker, timeframe).then(e => {
                    if(e !== "403") {
                        clearInterval(interval);
                        resolve(e);
                    }
                });
            }, 2000);
        });
        data = await waitForRateReset;
    }
    if(data === "ERROR") {
        console.log("SKIPPED: ERROR");
        return;
    }
    else if(!data) {
        console.log("SKIPPED: Not enough data");
        return;
    }
    console.timeEnd("Downloading");
    fs.writeFile("./historicalData/" + timeframe + "/" + ticker + ".json", JSON.stringify(data), () => {});
    return data;
};

const updateQuotesHandler = async (ticker, timeframe, barsBack = 1, removeLatest = false) => {
    console.time("Quotes handler");
    let result = await updateQuotes(ticker, timeframe, barsBack, removeLatest);
    if(result === "403") {
        const waitForRateReset = new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                updateQuotes(ticker, timeframe, barsBack, removeLatest).then(e => {
                    console.log(e);
		    if(e !== "403") {
                        clearInterval(interval);
                        resolve(e);
                    }
                });
            }, 2000);
        });
        result = await waitForRateReset;
        console.timeEnd("Quotes handler");
        return result;
    }
    else {
        console.timeEnd("Quotes handler");
        return result;
    }
};

const getTickersList = (shouldFilter = false, timeframe = "60min") => {
    const filters = JSON.parse(fs.readFileSync("../scanner/filters.json"))[timeframe];
    const allTickers = JSON.parse(fs.readFileSync("filtering/stocksList.json")).stocks;
    let tickers = [];
    tickers = allTickers.filter(ticker => {
        return ticker.cap !== "-";
    });
    if(!shouldFilter) {
        return tickers.map(x => x.ticker);
    }
    tickers = tickers.filter(ticker => {
        let formattedCap = parseFloat(ticker.cap.replace("K", "").replace("M", "").replace("B", ""));
        let multiplier = 1;
        if(ticker.cap[ticker.cap.length - 1] === "K")
            multiplier = 1000;
        else if(ticker.cap[ticker.cap.length - 1] === "M")
            multiplier = 1000000;
        else if(ticker.cap[ticker.cap.length - 1] === "B")
            multiplier = 1000000000;
        formattedCap *= multiplier;

        let formattedVol = parseFloat(ticker.volume.replace("K", "").replace("M", "").replace("B", ""));
        multiplier = 1;
        if(ticker.volume[ticker.volume.length - 1] === "K")
            multiplier = 1000;
        else if(ticker.volume[ticker.volume.length - 1] === "M")
            multiplier = 1000000;
        else if(ticker.volume[ticker.volume.length - 1] === "B")
            multiplier = 1000000000;
        
        formattedVol *= multiplier;

        let price = parseFloat(ticker.price);

        return formattedCap >= filters.marketCap.min && formattedCap <= filters.marketCap.max
            && formattedVol >= filters.volume.min && formattedVol <= filters.volume.max
            && price >= filters.price.min && price <= filters.price.max;
    }).map(x => x.ticker);
    return tickers;
}

const sendAlert = (ticker, type, timeframe, date) => {
    console.log("Alert " + ticker + " " + type + " " + timeframe + " " + date);
    /*const requestPromise = new Promise((resolve, reject) => {
        const req = https.get({
            host: "api.tradestation.com",
            path: "/v2/data/symbol/" + ticker + "?access_token=" + TOKEN
        }).on("response", response => {
            result = ""
            if(response.statusCode === 403) {
                reject("403");
                return;
            }
            
            response.on("data", data => {
                result += data;
               
            });

            response.on("end", () => {
                if(result.includes("ERROR") || result.includes("<html")) {
                    reject(result);
                }
                else {
                  
                    resolve(JSON.parse(result)["Exchange"]);
                }
            });
    
        });
        req.end();
    });
    let exchange = "";
    try {
        exchange = await requestPromise;
    }
    catch (e) {
        console.log(e);
        exchange = "error";
    }*/
    let exchange = "";
    try {
        const exchangeFile = JSON.parse(fs.readFileSync("./exchanges.json"));
        exchange = exchangeFile.exchanges[ticker];
    }
    catch (e) {
         console.log(e);
         console.log("THREW");
         exchange = "error";
    }
    const dateObject = new Date();
//    console.log("Alert exchange " + exchange);
    if(chatId[timeframe]) {
        console.log("Sending timeframe message");
	bot.sendMessage(chatId[timeframe],"Alert " + ticker + " " + type + " " + timeframe + " " + date);
    }
    if(chatId["test"]) {
         console.log("Sending test message");
         bot.sendMessage(chatId["test"],"Alert " + ticker + " " + type + " " + timeframe + " " + date);
    }
    io.emit("message", {
        ticker,
        exchange,
        type,
        timeframe,
        date
    });
    let currentAlerts = JSON.parse(fs.readFileSync("../scanner/stocks.json"));
    const dateFormatted = dateObject.getUTCDate() + "-" + (dateObject.getUTCMonth() + 1).toString() + "-" + dateObject.getUTCFullYear();
    if(!currentAlerts[timeframe][dateFormatted])
        currentAlerts[timeframe][dateFormatted] = [];
    currentAlerts[timeframe][dateFormatted].push({
        ticker,
        type,
        date,
        comment: "",
        exchange
    });
    fs.writeFileSync("../scanner/stocks.json", JSON.stringify(currentAlerts));

};

const checkForDivergences = (ticker, result, timeframe) => {
    if(!result) {
        return;
    }
    let newRSI = {};
    let newPrice = {};
    for(let i = 0; i < Math.min(50, Object.keys(result.rsiData).length); i++) {
        const date = Object.keys(result.rsiData)[i];
        newRSI[date] = Object.values(result.rsiData)[i];
        newPrice[date] = Object.values(result.priceData)[i];

    }
    const divergences = searchForFailedDivergences(newRSI, newPrice);
    const currentDate = Object.keys(newRSI)[0];
    for(let y = 0; y < divergences.bullish.length; y++) {
        if(divergences.bullish[y].end === currentDate) {
      //          fs.appendFileSync("./" + timeframe + ".txt", ticker + " bullish \n"); 
                sendAlert(ticker, "bullish", timeframe, Object.keys(newPrice)[0]);
        }
    } 
    for(let y = 0; y < divergences.bearish.length; y++) {
        if(divergences.bearish[y].end === currentDate) {
             //fs.appendFileSync("./" + timeframe + ".txt", ticker + " bearish \n");

                sendAlert(ticker, "bearish", timeframe, Object.keys(newPrice)[0]);
             }
    } 
};



const getAllTickers = async () => {
    let end = false;
    let page = 1;
    let tickers = [];
    while(!end) {
        console.log(page);
        const requestPromise = new Promise((resolve, reject) => {
            const req = https.get({
                host: "api.polygon.io",
                path: "/v2/reference/tickers?sort=-type&locale=us&perpage=50&page=" + page + "&active=true&apiKey=" + API_KEY
            }).on("response", response => {
                result = ""
                
                response.on("data", data => {
                    result += data;
                   
                });
    
                response.on("end", () => {
                    resolve(JSON.parse(result));
                });
        
            });
            req.end();
        });
        let response = (await requestPromise).tickers;
        if(response.length === 0) {
            end = true;
            break;
        }
        response = response.filter(x => x.primaryExch === "AMX" || x.primaryExch === "NYE" || x.primaryExch === "ARCA" || x.primaryExch === "NSD").map(x => x.ticker);
        tickers = tickers.concat(response);
        page++;
    }
    return tickers;
    
};

const updateQuotesFile = (ticker, candle, timeframe) => {
    if(!candle) {
        return;
    }
    if(!fs.existsSync("./historicalData/" + timeframe + "/" + ticker + ".json")) {
        return;
    }
    const historicalData = JSON.parse(fs.readFileSync("./historicalData/" + timeframe + "/" + ticker + ".json"));
    const data = {};
    data[candle.date] = {
        Close: candle.close,
        High: candle.high,
        Open: candle.open,
        Low: candle.low
    };
    const finalObject = Object.assign(data, historicalData["priceData"]);

    const prices = Object.values(finalObject).map(x => x.Close);
    prices.reverse();
    let rsiData = RSICalculator.calculate({
        values: prices,
        period: 14
    });
    const newRSI = rsiData.slice(Math.max(0, rsiData.length - 5), rsiData.length);
    newRSI.reverse();


    tempObject = {};
    for(let i = 0; i < newRSI.length; i++) {
        tempObject[Object.keys(finalObject)[i]] = newRSI[i];
    }
    //tempObject[new Date(parseInt(data.TimeStamp.replace("/Date(", "").replace(")/", ""))).toString()] = newRSI;
    const finalObjectRSI = Object.assign(tempObject, historicalData["rsiData"]);


    fs.writeFileSync("./historicalData/" + timeframe + "/" + ticker + ".json", JSON.stringify({
        priceData: finalObject,
        rsiData: finalObjectRSI
    }), () => {});
    return {
        priceData: finalObject,
        rsiData: finalObjectRSI
    };
};

const updateDaily = (ticker, plainData, date) => {
    let data = {};
    data[date]= plainData;
    if(!fs.existsSync("./historicalData/1d/" + ticker + ".json")) {
        return;
    }
 
    const historicalData = JSON.parse(fs.readFileSync("./historicalData/1d/" + ticker + ".json"));

    const finalObject = Object.assign(data, historicalData["priceData"]);

    const prices = Object.values(finalObject).map(x => x.Close);
    prices.reverse();
    let rsiData = RSICalculator.calculate({
        values: prices,
        period: 14
    });
    const newRSI = rsiData.slice(Math.max(0, rsiData.length - 5), rsiData.length);
    newRSI.reverse();


    tempObject = {};
    for(let i = 0; i < newRSI.length; i++) {
        tempObject[Object.keys(finalObject)[i]] = newRSI[i];
    }
    //tempObject[new Date(parseInt(data.TimeStamp.replace("/Date(", "").replace(")/", ""))).toString()] = newRSI;
    const finalObjectRSI = Object.assign(tempObject, historicalData["rsiData"]);


    fs.writeFileSync("./historicalData/1d/" + ticker + ".json", JSON.stringify({
        priceData: finalObject,
        rsiData: finalObjectRSI
    }), () => {});
    console.timeEnd("Update quotes analysis");

    return {
        priceData: finalObject,
        rsiData: finalObjectRSI
    };
}; 

const openSocket = (startedToday = false, stocksBars = {}, barsCreated = {}, dailyData = {}, didReset = false) => {
    const tickers = getTickersList();

    const tickersString = tickers.map(x => "AM." + x).join();
    const ws = new WebSocket("wss://delayed.polygon.io/stocks")
    let filteredTickers = getTickersList(true, "60min");
    let filteredTickers4H = getTickersList(true, "4h");
    let filteredTickers1D = getTickersList(true, "1d");
    /*setInterval(() => {
        filteredTickers = getTickersList(true, "60min");
        filteredTickers4H = getTickersList(true, "4h");
        filteredTickers1D = getTickersList(true, "1d");
    }, 60000 * 5);*/

    // Connection Opened:
    ws.on("open", () => {
        console.log("Connected!")
        ws.send(`{"action":"auth","params":"${API_KEY}"}`)
        ws.send(`{"action":"subscribe","params":"${tickersString}"}`)
    })

    
    
    // Per message packet:
    ws.on("message", ( data ) => {
        data = JSON.parse( data )
        data.map(( msg ) => {
            if( msg.ev === "status" ){
                if(msg.message.includes("subscribed to") && !startedToday) {
                    stocksBars[msg.message.split("AM.")[1]] = [];
                    dailyData[msg.message.split("AM.")[1]] = {};
                    barsCreated[msg.message.split("AM.")[1]] = [false, false, false, false, false, false, false];
                }
                return console.log("Status Update:", msg.message)
            }
            if(msg.ev === "AM") {
                const date = new Date(msg.s);
                const hour = date.getUTCHours();
                const minute = date.getUTCMinutes();
                console.log("New tick " + date);
                if(hour === 21 && !didReset) {
                    didReset = true;
                        for(let i = 0; i < Object.keys(stocksBars).length; i++) {
        	            console.log("EOD RESET");
                	    const result = updateQuotesFile(Object.keys(stocksBars)[i], stocksBars[Object.keys(stocksBars)[i]][stocksBars[Object.keys(stocksBars)[i]].length - 1], "60min");
              	        if(filteredTickers.includes(Object.keys(stocksBars)[i]) && result) {
                            console.log("Checking...");
                            if(result)
                                checkForDivergences(Object.keys(stocksBars)[i], result, "60min");
                            }
                            if(filteredTickers4H.includes(msg.sym) && result) {
                                console.log("Checking 4H...");
                                const result4H = getHigherTimeframe(result.priceData, "4h", true);
                                if(result4H)
                                    checkForDivergences(Object.keys(stocksBars)[i], result4H, "4h");
                            }
			                if(filteredTickers1D.includes(msg.sym) && result) {
                                console.log("Checking 1D...");                                    
                                const result1D = updateDaily(Object.keys(stocksBars)[i], dailyData[Object.keys(stocksBars)[i]], Object.keys(result.priceData)[0]);
				                if(result1D)
                                    checkForDivergences(Object.keys(stocksBars)[i], result1D, "1d");
                            }
                            stocksBars[Object.keys(stocksBars)[i]] = [];
                            barsCreated[Object.keys(stocksBars)[i]] = [false, false, false, false, false, false, false];
                        }
                   
            
                }
                if((hour === 14 && minute >= 30) || (hour >= 15 && hour <= 20)) {
                    let hourIndex;
                    didReset = false;
		            let check4H = false;
                    if((hour === 14 && minute >= 30) || (hour === 15 && minute <= 29))
                        hourIndex = 0;
                    else if((hour === 15 && minute >= 30) || (hour === 16 && minute <= 29))
                        hourIndex = 1;
                    else if((hour === 16 && minute >= 30) || (hour === 17 && minute <= 29))
                        hourIndex = 2;
                    else if((hour === 17 && minute >= 30) || (hour === 18 && minute <= 29))
                        hourIndex = 3;
                    else if((hour === 18 && minute >= 30) || (hour === 19 && minute <= 29)) {
                        hourIndex = 4;
 		                check4H = true;
		            }
                    else if((hour === 19 && minute >= 30) || (hour === 20 && minute <= 29))
                        hourIndex = 5;
                    else if((hour === 20 && minute >= 30))
                        hourIndex = 6;

                    if(!barsCreated[msg.sym][hourIndex]) {
                        barsCreated[msg.sym][hourIndex] = true;
                        console.log("New candle");
                        if(stocksBars[msg.sym].length - 1 >= 0) {
                            console.log("Updated previous candle");
                            if(dailyData[msg.sym]) {
                                if(!dailyData[msg.sym].Open) {
                                    dailyData[msg.sym].Open = stocksBars[msg.sym][stocksBars[msg.sym].length - 1].open; 
                                }
                                if(!dailyData[msg.sym].High || stocksBars[msg.sym][stocksBars[msg.sym].length - 1].high > dailyData[msg.sym].High) {
                                    dailyData[msg.sym].High = stocksBars[msg.sym][stocksBars[msg.sym].length - 1].high;
                                }
                                if(!dailyData[msg.sym].Low || stocksBars[msg.sym][stocksBars[msg.sym].length - 1].low < dailyData[msg.sym].Low) {
                                    dailyData[msg.sym].Low = stocksBars[msg.sym][stocksBars[msg.sym].length - 1].low;
                                }
			                    dailyData[msg.sym].Close = stocksBars[msg.sym][stocksBars[msg.sym].length - 1].close;
                            }
                            const result = updateQuotesFile(msg.sym, stocksBars[msg.sym][stocksBars[msg.sym].length - 1], "60min");
                            if(filteredTickers.includes(msg.sym) && result) {
                                console.log("Checking...");
                                checkForDivergences(msg.sym, result, "60min");
		                    }
                            if(filteredTickers4H.includes(msg.sym) && check4H && result) {
 			                    console.log("Checking 4H...");
  				                const result4H = getHigherTimeframe(result.priceData, "4h", false);
				                checkForDivergences(msg.sym, result4H, "4h");
                            }
                        }
                        let modifiedDate = new Date(date.getTime());
                        modifiedDate.setUTCHours(15 + hourIndex, 30);
                        if(hourIndex === 6) {
			                modifiedDate.setUTCHours(21, 0);
                        }
                        stocksBars[msg.sym].push({
                            date: modifiedDate.toString()
                        });
                    }
                    const lastIndex = stocksBars[msg.sym].length - 1;
                    if(lastIndex !== -1) {
                        if(!stocksBars[msg.sym][lastIndex].open) {
                            stocksBars[msg.sym][lastIndex].open = msg.o;
                        }
                        console.log("Updating candles");
                        stocksBars[msg.sym][lastIndex].close = msg.c;
                        
                        
                        if(!stocksBars[msg.sym][lastIndex].high || msg.h > stocksBars[msg.sym][lastIndex].high) {
                            
    
                            stocksBars[msg.sym][lastIndex].high = msg.h;
                        }
                        if(!stocksBars[msg.sym][lastIndex].low || msg.l < stocksBars[msg.sym][lastIndex].low) {
                           
    
                            stocksBars[msg.sym][lastIndex].low = msg.l;
                        }
                    }
                    
                }
                
            }

        });
    })

    ws.on("error", console.log);
    ws.on("close", () => {
        console.log("Close");
        openSocket(true, stocksBars, barsCreated, dailyData, didReset);
    });
};

const updateWeeklyAndMonthly = async (tickers, endOfMonth) => {
    TOKEN = await getAccessToken();
    const interval = setInterval(() => {
	getAccessToken().then(x => {
	    console.log("Updating token");
            TOKEN = x;
        });
    }, 15 * 1000 * 60);
    for(let i = 0; i < tickers.length; i++) {
        const result = await updateQuotesHandler(tickers[i], "1w", 2, false);
        await checkForDivergences(tickers[i], result, "1w");
	if(endOfMonth) {
            const resultMonthly = await updateQuotesHandler(tickers[i], "1m", 2, false);
	    await checkForDivergences(tickers[i], resultMonthly, "1m");
        }
    }
    clearInterval(interval);
};

const updateHistoricalData = async (tickers) => {
    TOKEN = await getAccessToken();
    const interval = setInterval(() => {
	getAccessToken().then(x => {
	    console.log("Updating token");
            TOKEN = x;
        });
    }, 15 * 1000 * 60);
    for(let i = 0; i < tickers.length; i++) {
        await updateQuotesHandler(tickers[i], "60min", 10, false);
        await updateQuotesHandler(tickers[i], "1d", 2, false);
        await updateQuotesHandler(tickers[i], "1w", 2, false);
        await updateQuotesHandler(tickers[i], "1m", 2, false);
    }
    clearInterval(interval);

};

const lastFriday = () => {
    const lastDay = moment().endOf("month");
    let sub;
    if (lastDay.day() >= 5)
        sub = lastDay.day() - 5;
    else
        sub = lastDay.day() + 2;
    return lastDay.subtract(sub, "days").date();
}
(async () => {
    setInterval(() => {
        const date = new Date();
	    if(date.getDay() == 5 && date.getHours() == 22) {
            let monthly = false;
            const tickers = getTickersList();
            if(lastFriday() === date.getDate())
                monthly = true;
            updateWeeklyAndMonthly(tickers, monthly).then(() => {console.log("Finished 1M and 1W");});
        }
        if(date.getHours() === 2) {
            updateHistoricalData(tickers).then(() => {console.log("Finished daily update")});
        }
    }, 60 * 1000 * 60);
   openSocket();
})();

	
