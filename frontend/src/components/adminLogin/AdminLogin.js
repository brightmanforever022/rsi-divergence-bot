import React from "react";
import logo from "../../logo.svg";
import "./AdminLogin.css";
import fetch from "node-fetch";
import {Redirect} from "react-router-dom";

class CoinDescription extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            redirect: false,
            username: "",
            password: ""
        }
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.login = this.login.bind(this);
    }


    renderRedirect() {
        if (this.state.redirect) {
            //return <Redirect to="/admin/dashboard" />
            window.location.href = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/";
        }
    }

    handleUsernameChange(event) {
        this.setState({
            ...this.state,
            username: event.target.value
        });
    }

    handlePasswordChange(event) {
        this.setState({
            ...this.state,
            password: event.target.value
        });
    }

    render() {
        const redirect = this.renderRedirect();
        return (
            <section>
                {redirect}
                <form onSubmit={this.login}>
                    <label>
                        <span>Username</span>
                        <input value={this.state.username} onChange={this.handleUsernameChange} type="text"></input>    
                    </label>         
                    <label>
                        <span>Password</span>
                        <input value={this.state.password} onChange={this.handlePasswordChange} type="text"></input>    
                    </label> 
                    <button type="submit">Login</button>          
                </form>
            </section>
        );
    }

    login(event) {
        event.preventDefault();
        fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/login", {
            method: "POST",
            headers:{"content-type": "application/json"},
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })
        }).then(response => {
            if(response.status === 200) {
                this.setState({
                    ...this.state,
                    redirect: true
                });
            }
        });
    }
    

    componentDidMount() {
        document.title = "Admin Login - WhatsThisCrypto";

        fetch(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/admin/ping")
            .then(response => {
                if(response.status === 200 && this.state.redirect !== true) {
                    this.setState({
                        ...this.state,
                        redirect: true
                    });
                }
            });

    }


}

export default CoinDescription;
