import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import App from './App';
import Home from './Home';
import Login from './Login';
import Reset from './Reset';
import Forgot from './Forgot';
import './index.css';
import Logout from './Logout';
import Register from './Register';
import Profile from './Profile';
import ExtProfile from './ExtProfile';
import Search from './Search';
import Chat from './Chat';
import Error404 from './Error404';

// import List from './List';

const socket = io('https://46.101.246.154:8080');
const AppCaller = React.createClass({
	render() {
		return (<App socket={socket} location={this.props.location}>{this.props.children}
		</App>)
	}
});

const ChatCaller = React.createClass({
	render() {
		return (<Chat socket={socket} location={this.props.location}>{this.props.children}
		</Chat>)
	}
});

ReactDOM.render(
	(<Router history={browserHistory}>
		<Route path="/" component={AppCaller}>
		<IndexRoute component={Home} />
			<Route path="/logout" component={Logout} />
			<Route path="/profile" component={Profile} />
			<Route path="/profile/:user" component={ExtProfile} />
			<Route path="/search" component={Search} />
			<Route path="/chat" component={ChatCaller} />
		</Route>
		<Route path="/login" component={Login} />
		<Route path="/register" component={Register} />
		<Route path="/forgot" component={Forgot} />
		<Route path="/reset" component={Reset} />
		<Route path="*" component={Error404} />
	</Router>),
	document.getElementById('root')
);

export default App;
