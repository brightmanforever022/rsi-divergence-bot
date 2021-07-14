import React from "react";
import logo from "../../logo.svg";
import "./AdminDashboard.css";
import fetch from "node-fetch";
import {Redirect} from "react-router-dom";
import "react-input-range/lib/css/index.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import socketIOClient from "socket.io-client";
import Cookies from "js-cookie";
import BellIcon from "react-bell-icon";

const TIMEFRAMES = ["60min", "4h", "1d", "1w"];

class AdminDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: "60min",
            bellActive: false,
            redirect: false,
            verified: false,
            filtersResult: {
		price: {min: 1, max: 10000000, on: false},
		volume: {min: 1, max: 1000000, on: false}
	    },
	    filters: {
                "60min":{
                    marketCap: {
                        min: 50,
                        max: 100
                    },
                    price: {
                        min: 1,
                        max: 2
                    },
                    volume: {
                        min: 1,
                        max: 2
                    }
                },
                "4h":{
                    marketCap: {
                        min: 50,
                        max: 100
                    },
                    price: {
                        min: 1,
                        max: 2
                    },
                    volume: {
                        min: 1,
                        max: 2
                    }
                },
                "1d":{
                    marketCap: {
                        min: 50,
                        max: 100
                    },
                    price: {
                        min: 1,
                        max: 2
                    },
                    volume: {
                        min: 1,
                        max: 2
                    }
                },
                "1w":{
                    marketCap: {
                        min: 50,
                        max: 100
                    },
                    price: {
                        min: 1,
                        max: 2
                    },
                    volume: {
                        min: 1,
                        max: 2
                    }
                },
                "1m":{
                    marketCap: {
                        min: 50,
                        max: 100
                    },
                    price: {
                        min: 1,
                        max: 2
                    },
                    volume: {
                        min: 1,
                        max: 2
                    }
                },
		 "3m":{
                    marketCap: {
                        min: 50,
                        max: 100
                    },
                    price: {
                        min: 1,
                        max: 2
                    },
                    volume: {
                        min: 1,
                        max: 2
                    }
                }

            },
            history: {
                "60min": {},
                "4h": {},
                "1d": {},
                "1w": {},
		"3m": {},
		"1m": {}
            },
	    sortingDescending: true,
            alerts: [],
	    alertsCfopy: [],
            showNotifications: false,
            selectedDate: new Date()
        };
        this.updateFilters = this.updateFilters.bind(this);
	this.updateFiltersResult = this.updateFiltersResult.bind(this);
	this.clearFiltersResult = this.clearFiltersResult.bind(this);
        this.updateAlertComment = this.updateAlertComment.bind(this);
        this.handleMarketCapMinFilterChange = this.handleMarketCapMinFilterChange.bind(this);
        this.handleMarketCapMaxFilterChange = this.handleMarketCapMaxFilterChange.bind(this);

        this.handleVolumeMinFilterChange = this.handleVolumeMinFilterChange.bind(this);
        this.handleVolumeMaxFilterChange = this.handleVolumeMaxFilterChange.bind(this);
        this.handleAlertCommentChange = this.handleAlertCommentChange.bind(this);
        this.handlePriceMinFilterChange = this.handlePriceMinFilterChange.bind(this);
        this.handlePriceMaxFilterChange = this.handlePriceMaxFilterChange.bind(this);

 	this.handleVolumeMinFilterChangeResult = this.handleVolumeMinFilterChangeResult.bind(this);
        this.handleVolumeMaxFilterChangeResult = this.handleVolumeMaxFilterChangeResult.bind(this);
        
        this.handlePriceMinFilterChangeResult = this.handlePriceMinFilterChangeResult.bind(this);
        this.handlePriceMaxFilterChangeResult = this.handlePriceMaxFilterChangeResult.bind(this);

	this.handlePriceCheckboxChangeResult = this.handlePriceCheckboxChangeResult.bind(this);
	this.handleVolumeCheckboxChangeResult = this.handleVolumeCheckboxChangeResult.bind(this);

        this.dateChanged = this.dateChanged.bind(this);
	this.setSortedField = this.setSortedField.bind(this);
    }

    handlePriceCheckboxChangeResult() {
        let priceFilters = this.state.filtersResult;
        priceFilters.price.on = !priceFilters.price.on;
        this.setState({
	    ...this.state,
	    filtersResult: priceFilters
	});
    }

    handleVolumeCheckboxChangeResult() {
        let volumeFilters = this.state.filtersResult;
        volumeFilters.volume.on = !volumeFilters.price.on;
        this.setState({
            ...this.state,
            filtersResult: volumeFilters
        });

    }

    dateChanged(date) {
        this.setState({
            ...this.state,
            selectedDate: date
        });
    }

    clearFiltersResult() {
	this.setState({
	    ...this.state,
	    history: this.state.alertsCopy
	});
    }

    setSortedField(key) {
        const selectedDate = this.state.selectedDate;
        const formattedDate = selectedDate.getDate() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getFullYear();
	
	let sorted = this.state.history[this.state.selectedTab][formattedDate];
        let history = this.state.history;
	sorted.sort((a, b) => {
	    
	    if(a[key]) {
		if(b[key])
		    if(key === "date")
		        return parseFloat(Date.parse(a[key])) - parseFloat(Date.parse(b[key]));
		    else if(key === "type" || key === "ticker") {
			if(a[key] < b[key])
			    return -1;
			else if(a[key] > b[key])
			    return 1;
		    }
		    else
			return parseFloat(a[key]) - parseFloat(b[key]);
		else
		    return 1;
	    }
	    else if(b[key]) {
		return -1;
	    }
	    return 0;
        });
        if(this.state.sortDescending) {
	    sorted.reverse();
	}
        this.state.history[this.state.selectedTab][formattedDate] = sorted;
        this.setState({
	    ...this.state,
	    history,
	    sortDescending: !this.state.sortDescending
	});
    }

    updateAlertComment(timeframe, date, ticker, alertDate, index) {
        fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/scanner/stocks/updateComment?timeframe=" + timeframe + "&date=" + date + "&ticker=" + ticker + "&alertDate=" + alertDate, {
            method: "post",
            body: JSON.stringify(this.state.history[timeframe][date][index]),
            headers: {"Content-Type": "application/json"}
        });
    }

    handleAlertCommentChange(timeframe, date, index, value) {
        let state = this.state;
        state.history[timeframe][date][index].comment = value;
        this.setState(state);
    }
    handleMarketCapMinFilterChange(value) {
        let filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filters[this.state.selectedTab].marketCap.min = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filters
        });
    }
    handleMarketCapMaxFilterChange(value) {
        let filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filters[this.state.selectedTab].marketCap.max = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filters
        });
    }

    handleVolumeMinFilterChange(value) {
        let filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filters[this.state.selectedTab].volume.min = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filters
        });
    }
    handleVolumeMaxFilterChange(value) {
        let filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filters[this.state.selectedTab].volume.max = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filters
        });
    }

    handlePriceMinFilterChange(value) {
        let filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filters[this.state.selectedTab].price.min = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filters
        });
    }
    handlePriceMaxFilterChange(value) {
        let filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filters[this.state.selectedTab].price.max = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filters
        });
    }
    handleVolumeMinFilterChangeResult(value) {
        let filtersResult = this.state.filtersResult;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filtersResult.volume.min = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filtersResult
        });
    }
    handleVolumeMaxFilterChangeResult(value) {
        let filtersResult = this.state.filtersResult;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filtersResult.volume.max = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filtersResult
        });
    }

    handlePriceMinFilterChangeResult(value) {
        let filtersResult = this.state.filtersResult;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filtersResult.price.min = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filtersResult
        });
    }
    handlePriceMaxFilterChangeResult(value) {
        let filtersResult = this.state.filtersResult;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        filtersResult.price.max = parseInt(value.target.value);
        this.setState({
            ...this.state,
            filtersResult
        });
    }

    updateFilters(event) {
        event.preventDefault();
        fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/scanner/filters/update?timeframe=" + this.state.selectedTab, {
            method: "post",
            body: JSON.stringify(this.state.filters[this.state.selectedTab]),
            headers: {"Content-Type": "application/json"}
        });
    }

    updateFiltersResult(event) {
        event.preventDefault();
        const alerts = this.state.alertsCopy;
	console.log(alerts);
	let filters = this.state.filtersResult;
        let newAlerts = {};
	
	for(let i = 0; i < Object.keys(alerts).length; i++) {
	    const timeframe = alerts[Object.keys(alerts)[i]];
	    newAlerts[Object.keys(alerts)[i]] = {};
	    for(let y = 0; y < Object.keys(timeframe).length; y++) {
		let date = timeframe[Object.keys(timeframe)[y]];
		
		date = date.filter(x => {
		    if(x.price)
		    	x.price = parseFloat(x.price);
		    if(x.averageVolume)
		    	x.volume = parseFloat(x.averageVolume);
		    return (x.price || !filters.price.on) && (x.volume || !filters.volume.on) && ((x.price >= filters.price.min && x.price <= filters.price.max) || !filters.price.on) && ((x.volume >= filters.volume.min && x.volume <= filters.volume.max) || !filters.volume.on);
		});
		newAlerts[Object.keys(alerts)[i]][Object.keys(timeframe)[y]] = date;
	    }
	}
	this.setState({
	    ...this.state,
	    alertsCopy: alerts,
	    history: newAlerts
	});
    }

    renderRedirect() {
        if (this.state.redirect) {
            return <Redirect to="/login" />
        }
    }


    render() {
        const redirect = this.renderRedirect();
        let notificationsList;
        if(this.state.showNotifications) {
            notificationsList = (
            <section className="notificationsList">
                <h2>Notifications:</h2>
                {this.state.alerts.map((alert, index) => {
                    return (
                        <div key={index}>
                            <p>{alert.ticker} on {alert.timeframe}</p>
                            <button onClick={() => {
                                let alerts = this.state.alerts;
                                alerts.splice(index, 1);
                                this.setState({
                                    ...this.state,
                                    alerts

                                });
                            }}>Remove</button>
                        </div>
                    );
                })}
            </section>);
        }
        return (
            <section className="container">
                {redirect}
                <div className="heading">
                    <h1 className="adminDashboardTitle">Admin Dashboard</h1>
                    <BellIcon className="bellIcon" onClick={() => {this.setState({
                        ...this.state,
                        showNotifications: !this.state.showNotifications
                    })}} width="40" active={this.state.bellActive} animate={this.state.bellActive}/>
                    {notificationsList}
                </div>
                <form onSubmit={this.updateFilters}>
                    <div className="allFiltersContainer">
                        <section className="filtersSection">
                            <label>
                                <span>Min Market Captialisation</span>
                                <input type="number" max={this.state.filters[this.state.selectedTab].marketCap.max} value={this.state.filters[this.state.selectedTab].marketCap.min} onChange={this.handleMarketCapMinFilterChange}></input>
                            </label>
                            <label>
                                <span>Max Market Captialisation</span>
                                <input type="number" min={this.state.filters[this.state.selectedTab].marketCap.min} value={this.state.filters[this.state.selectedTab].marketCap.max} onChange={this.handleMarketCapMaxFilterChange}></input>
                            </label>
                        </section>
                        
                        <section className="filtersSection">
                            <label>
                                <span>Min Average Volume</span>
                                <input type="number" max={this.state.filters[this.state.selectedTab].volume.max} value={this.state.filters[this.state.selectedTab].volume.min} onChange={this.handleVolumeMinFilterChange}></input>
                            </label>
                            <label>
                                <span>Max Average Volume</span>
                                <input type="number" min={this.state.filters[this.state.selectedTab].volume.min} value={this.state.filters[this.state.selectedTab].volume.max} onChange={this.handleVolumeMaxFilterChange}></input>
                            </label>
                        </section>
                        
                        <section className="filtersSection">
                            <label>
                                <span>Min Price</span>
                                <input type="number" max={this.state.filters[this.state.selectedTab].price.max} value={this.state.filters[this.state.selectedTab].price.min} onChange={this.handlePriceMinFilterChange}></input>
                            </label>
                            <label>
                                <span>Max Price</span>
                                <input type="number" min={this.state.filters[this.state.selectedTab].price.min} value={this.state.filters[this.state.selectedTab].price.max} onChange={this.handlePriceMaxFilterChange}></input>
                            </label>
                        </section>
                    </div>
                    
                    
                    <button className="updateFiltersButton" type="submit">Update filters</button>          
                </form>
		 <form onSubmit={this.updateFiltersResult}>
                    <div className="allFiltersContainer">
			<h1>Results filter</h1>
                      
                        <section className="filtersSection">
                            <label>
				<span>Enable filtering alerts by volume</span>
				<input type="checkbox" onClick={this.handleVolumeCheckboxChangeResult}/>
			    </label>
			    <label>
                                <span>Min Average Volume</span>
                                <input type="number" max={this.state.filtersResult.volume.max} value={this.state.filtersResult.volume.min} onChange={this.handleVolumeMinFilterChangeResult}></input>
                            </label>
                            <label>
                                <span>Max Average Volume</span>
                                <input type="number" min={this.state.filtersResult.volume.min} value={this.state.filtersResult.volume.max} onChange={this.handleVolumeMaxFilterChangeResult}></input>
                            </label>
                        </section>

                        <section className="filtersSection">
			    <label>
                                <span>Enable filtering alerts by price</span>
                                <input type="checkbox" onClick={this.handlePriceCheckboxChangeResult}/>
                            </label>
                            <label>
                                <span>Min Price</span>
                                <input type="number" max={this.state.filtersResult.price.max} value={this.state.filtersResult.price.min} onChange={this.handlePriceMinFilterChangeResult}></input>
                            </label>
                            <label>
                                <span>Max Price</span>
                                <input type="number" min={this.state.filtersResult.price.min} value={this.state.filtersResult.price.max} onChange={this.handlePriceMaxFilterChangeResult}></input>
                            </label>
                        </section>
                        
		    </div>

		    
                    <button className="updateFiltersButton" type="submit">Update filters</button>
                
		    <button type="reset" className="updateFiltersButton" onClick={this.clearFiltersResult}>Clear alerts filters</button>
                </form>
		<section>
                    <DatePicker selected={this.state.selectedDate} onChange={this.dateChanged} />
                    <Tabs onSelect={(tab) => {
                        this.setState({
                            ...this.state,
                            selectedTab: Object.keys(this.state.history)[tab]
                        });
                    }}>
                        <TabList>
                            {Object.keys(this.state.history).map((timeframe) => {
                                return (
                                    <Tab key={timeframe}>{timeframe}</Tab>
                                );
                            })}
                        </TabList>
                        
                        {Object.values(this.state.history).map((objects, timeframeIndex) => {
                            const formattedDate = this.state.selectedDate.getDate() + "-" + parseInt(this.state.selectedDate.getMonth() + 1) + "-" + this.state.selectedDate.getFullYear();
                            if(!objects[formattedDate]) {
                                return (
                                    <TabPanel key={timeframeIndex}>
                                        <p>No alerts for selected date.</p>

                                    </TabPanel>
                                );
                            }
                            return (
                                <TabPanel key={timeframeIndex}>
                                    <table className="alertsTable">
                                        <thead>
					    <tr>
                                                <th><button type="button" onClick={() => this.setSortedField("date")}>Time</button></th>
                                                <th><button type="button" onClick={() => this.setSortedField("type")}>Signal</button></th>
                                                <th><button type="button" onClick={() => this.setSortedField("ticker")}>Symbol</button></th>
						<th><button type="button" onClick={() => this.setSortedField("price")}>Price</button></th>
						<th><button type="button" onClick={() => this.setSortedField("averageVolume")}>Volume</button></th>
                                                <th><button type="button" onClick={() => this.setSortedField("date")}>Float</button></th>
                                            </tr>
					</thead>
					<tbody>
                                        {objects[formattedDate].map((alert, index) => {
                                            let formattedAlertTime = new Date(alert.date);
                                            formattedAlertTime = formattedAlertTime.getHours() + ":" + formattedAlertTime.getMinutes();
                                            const timeframe = Object.keys(this.state.history)[timeframeIndex];
                                            return (
                                                <tr key={index}>
                                                    <td>Bar close on {formattedAlertTime} UTC</td>
                                                    <td>Hidden {alert.type} divergence</td>
                                                    <td><a target="_blank" href={"https://www.tradingview.com/chart/?symbol=" + alert.exchange + ":" + alert.ticker}>{alert.ticker}</a></td>
                                                    <td>{alert.price}</td>
                                                    <td>{alert.averageVolume ? alert.averageVolume.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                    <td>{alert.float}</td>
                                                </tr>
                                            );
                                        })}
				        </tbody>
                                    </table>
                                </TabPanel>
                            );
                        })}
                        
                    </Tabs>
                </section>

            </section>
        );
    }
    

    componentDidMount() {
        document.title = "Admin Dashboard - WhatsThisCrypto";       const socket = socketIOClient("ws://" + window.location.hostname + ":3000", {
                query: {
                    "token": Cookies.get("token")
                },
                transport: ["websocket"]
            });
            socket.on("connect", () => {
                console.log("connected");
            });
            socket.on("message", alert => {
                let history = this.state.history;
                let formattedDate = new Date();
                formattedDate = formattedDate.getDate() + "-" + parseInt(formattedDate.getMonth() + 1) + "-" + formattedDate.getFullYear();
                if(!history[alert.timeframe][formattedDate])
                    history[alert.timeframe][formattedDate] = [];
                history[alert.timeframe][formattedDate].push({
                    ticker: alert.ticker,
                    type: alert.type,
		    exchange: alert.exchange,
                    date: alert.date,
                    comment: ""
                });
                let alerts = this.state.alerts;
                alerts.push({
                    ticker: alert.ticker,
                    timeframe: alert.timeframe
                });

                this.setState({
                    ...this.state,
                    history,
		    alertsCopy: history,
                    bellActive: true,
                    alerts
                });
		setTimeout(() => {
		    this.updateFiltersResult();   
		}, 1000);
                setTimeout(() => {
                    this.setState({
                        ...this.state,
                        bellActive: false
                    });
                }, 5000);
            });
        fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/ping")
            .then(response => {
                if(response.status === 401 && this.state.redirect !== true) {
                    this.setState({
                        ...this.state,
                        redirect: true
                    });
                }
                else if(response.status === 200){
                    fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/scanner/filters").then(result => result.json()).then(result => {  
                        this.setState({
                            ...this.state,
                            verified: true,
                            filters: result
                        });
                    });
                    fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/scanner/history").then(result => result.json()).then(result => {
                        console.log("test");
			console.log(result);
                        this.setState({
                            ...this.state,
                            history: result,
			    alertsCopy: result
                        });

                    });
                    
                }
            });
    }


}

export default AdminDashboard;
