import React from "react";
import logo from "../../logo.svg";
import "./AdminDashboard.css";
import fetch from "node-fetch";
import {Redirect} from "react-router-dom";
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";
import Collapsible from "react-collapsible";

const TIMEFRAMES = ["60min", "4h", "1d", "1w"];

class AdminDashboard extends React.Component {
    constructor(props) {
        super(props);
        console.log("mssdsdsdasno");
        this.state = {
            redirect: false,
            verified: false,
            filters: {
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
            history: {
                "1h": {},
                "4h": {},
                "1d": {},
                "1w": {}
            }
        };
        this.updateFilters = this.updateFilters.bind(this);
        this.updateAlertComment = this.updateAlertComment.bind(this);
        this.handleMarketCapMinFilterChange = this.handleMarketCapMinFilterChange.bind(this);
        this.handleMarketCapMaxFilterChange = this.handleMarketCapMaxFilterChange.bind(this);

        this.handleVolumeMinFilterChange = this.handleVolumeMinFilterChange.bind(this);
        this.handleVolumeMaxFilterChange = this.handleVolumeMaxFilterChange.bind(this);
        this.handleAlertCommentChange = this.handleAlertCommentChange.bind(this);
        this.handlePriceMinFilterChange = this.handlePriceMinFilterChange.bind(this);
        this.handlePriceMaxFilterChange = this.handlePriceMaxFilterChange.bind(this);
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
        console.log(state);
        this.setState(state);
    }
    handleMarketCapMinFilterChange(value) {
        const filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        this.setState({
            ...this.state,
            filters: {
                ...filters,
                marketCap: {
                    max: this.state.filters.marketCap.max,
                    min: parseInt(value.target.value)
                }
            }
        });
    }
    handleMarketCapMaxFilterChange(value) {
        const filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }

        this.setState({
            ...this.state,
            filters: {
                ...filters,
                marketCap: {
                    min: this.state.filters.marketCap.min,
                    max: parseInt(value.target.value)
                }
            }
        });
    }

    handleVolumeMinFilterChange(value) {
        const filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        this.setState({
            ...this.state,
            filters: {
                ...filters,
                volume: {
                    max: this.state.filters.volume.max,
                    min: parseInt(value.target.value)
                }
            }
        });
    }
    handleVolumeMaxFilterChange(value) {
        const filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        this.setState({
            ...this.state,
            filters: {
                ...filters,
                volume: {
                    min: this.state.filters.volume.min,
                    max: parseInt(value.target.value)
                }
            }
        });
    }

    handlePriceMinFilterChange(value) {
        const filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        this.setState({
            ...this.state,
            filters: {
                ...filters,
                price: {
                    max: this.state.filters.price.max,
                    min: parseInt(value.target.value)
                }
            }
        });
    }
    handlePriceMaxFilterChange(value) {
        const filters = this.state.filters;
        if(value.target.value === "") {
            value.target.value = "0";
        }
        this.setState({
            ...this.state,
            filters: {
                ...filters,
                price: {
                    min: this.state.filters.price.min,
                    max: parseInt(value.target.value)
                }
            }
        });
    }

    updateFilters(event) {
        event.preventDefault();
        fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/scanner/filters/update", {
            method: "post",
            body: JSON.stringify(this.state.filters),
            headers: {"Content-Type": "application/json"}
        });
    }

    renderRedirect() {
        if (this.state.redirect) {
            return <Redirect to="/login" />
        }
    }


    render() {
        const redirect = this.renderRedirect();

        return (
            <section>
                {redirect}
                <h1 className="adminDashboardTitle">Admin Dashboard</h1>
                <form onSubmit={this.updateFilters}>
                    <div class="allFiltersContainer">
                        <section class="filtersSection">
                            <label>
                                <span>Min Market Captialisation</span>
                                <input type="number" max={this.state.filters.marketCap.max} value={this.state.filters.marketCap.min} onChange={this.handleMarketCapMinFilterChange}></input>
                            </label>
                            <label>
                                <span>Max Market Captialisation</span>
                                <input type="number" min={this.state.filters.marketCap.min} value={this.state.filters.marketCap.max} onChange={this.handleMarketCapMaxFilterChange}></input>
                            </label>
                        </section>
                        
                        <section class="filtersSection">
                            <label>
                                <span>Min Average Volume</span>
                                <input type="number" max={this.state.filters.volume.max} value={this.state.filters.volume.min} onChange={this.handleVolumeMinFilterChange}></input>
                            </label>
                            <label>
                                <span>Max Average Volume</span>
                                <input type="number" min={this.state.filters.volume.min} value={this.state.filters.volume.max} onChange={this.handleVolumeMaxFilterChange}></input>
                            </label>
                        </section>
                        
                        <section class="filtersSection">
                            <label>
                                <span>Min Price</span>
                                <input type="number" max={this.state.filters.price.max} value={this.state.filters.price.min} onChange={this.handlePriceMinFilterChange}></input>
                            </label>
                            <label>
                                <span>Max Price</span>
                                <input type="number" min={this.state.filters.price.min} value={this.state.filters.price.max} onChange={this.handlePriceMaxFilterChange}></input>
                            </label>
                        </section>
                    </div>
                    
                    
                    <button class="updateFiltersButton" type="submit">Update filters</button>          
                </form>

                <section>
                    {Object.keys(this.state.history).map(timeframe => {
                        return (
                            <section className="history" key={timeframe}>
                                <h1 className="timeframeTitle">{timeframe}</h1>
                                <Collapsible trigger="Expand">
				    {Object.keys(this.state.history[timeframe]).length == 0 ? (<p>Empty</p>) : (<div></div>)}
                                    {Object.keys(this.state.history[timeframe]).map(date => {
                                        return (
                                            <article key={date}>
                                                <h1>{date}</h1>
                                                <Collapsible trigger="Expand">
                                                    <section>
                               				
                                                        {this.state.history[timeframe][date].map((stock, index) => {
                                                            return (
                                                                <article key={stock.ticker}>
								    <p>Hidden {stock.type} divergence for {stock.ticker} on {stock.date}</p>
								    <textarea value={this.state.history[timeframe][date][index].comment} onChange={(e) => this.handleAlertCommentChange(timeframe, date, index, e.target.value)}></textarea>
								    <button onClick={(e) => {e.preventDefault(); this.updateAlertComment(timeframe,date,stock.ticker,stock.date, index);}}>
                                                                        Update comment
                                                                    </button>
								</article>
                   						
                                                            );
                                                        })}
                                                    </section>
                                               
                                                </Collapsible>
                                                
                                            </article>
                                        );
                                    })}
                                </Collapsible>
                            </section>
                        );
                    })}
                </section>

            </section>
        );
    }
    

    componentDidMount() {
        document.title = "Admin Dashboard - WhatsThisCrypto";
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
                        console.log(result);
                        this.setState({
                            ...this.state,
                            history: result
                        });

                    });
                    
                }
            });
    }


}

export default AdminDashboard;
