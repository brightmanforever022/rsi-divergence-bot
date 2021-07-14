from finviz.screener import Screener
import json

filters = ["exch_nasd"]  # Shows companies in NASDAQ which are in the S&P500
stock_list = Screener(filters=filters, table='Ownership', order="price")  # Get the performance table and sort it by price ascending

# Export the screener results to .csv
tickers_list = {
    "stocks": []
}
for stock in stock_list:
    tickers_list["stocks"].append({
        "ticker": stock["Ticker"],
        "cap": stock["Market Cap"],
        "volume": stock["Avg Volume"],
        "price": stock["Price"]
    })

filters = ["exch_nyse"]  # Shows companies in NASDAQ which are in the S&P500
stock_list = Screener(filters=filters, table='Ownership', order="price")  # Get the performance table and sort it by price ascending

for stock in stock_list:
    tickers_list["stocks"].append({
        "ticker": stock["Ticker"],
        "cap": stock["Market Cap"],
        "volume": stock["Avg Volume"],
        "price": stock["Price"]
    })

with open("stocksList.json", 'w') as fp:
    json.dump(tickers_list, fp)