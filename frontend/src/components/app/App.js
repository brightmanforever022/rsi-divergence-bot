import React from "react";
import { Route, Link, BrowserRouter as Router, Redirect } from "react-router-dom";
import "./App.css";
import Home from "../home/Home";
import AdminLogin from "../adminLogin/AdminLogin";
import AdminDashboard from "../adminDashboard/AdminDashboard";
import Header from "../header/Header";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false
        };
        this.home = React.createRef();
        this.admin = React.createRef();
    }
    render() {
        let redirect;
        if(this.state.redirect) {
            redirect = (<Redirect to="/"/>)
        }
        return (
            <div>
                <Router>
                    <div className="app">
                        {redirect}
                        <div id="pageMask"/>
                        <div className="content">
                            <Route path="/login" component={AdminLogin} />
                            <Route path="/" render={(props) => <AdminDashboard ref={this.admin} {...props} />} exact/>
                        </div>
                    </div>
                </Router>
            </div>
        );
    }
}

export default App;
