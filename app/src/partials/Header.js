import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';

class Header extends React.Component {
	state = {
		socket: null,
		notifications: [],
		username: null,
	};

	componentWillMount() {
		if (localStorage.getItem('logToken')) {
			axios({
				url: 'https://46.101.169.42:4433/check',
				method: 'post',
				headers: { logToken: localStorage.getItem('logToken') },
			}).then((response) => {
				if (!response.data.error){
					if (this.unmounted) return ;
					const notifications = (response.data.notifications && response.data.notifications.length > 0) ? response.data.notifications.reverse() : [];
					const username = response.data.username;
					this.setState({ notifications, username });
					this.setupSocket(this.props);
				}
			});
		}
	};


	componentWillReceiveProps = (newProps) => {
		this.setupSocket(newProps);
	};

	componentWillUnmount() {
		this.unmounted = true;
		if (this.state.socket) this.state.socket.removeListener('notifications');
	};

	setupSocket = async (newProps) => {
		if (this.socket) return (false);
		this.socket = newProps.socket;
		this.socket.on('connection status', (status) => {
			// console.log('connected', newProps.location.pathname);
		});
		this.socket.on('notifications', (content) => {
			const notifications = this.state.notifications;
			if (content.content !== "has just sent you a message!" || this.props.location.pathname !== '/chat') notifications.unshift({ content: content.content, from: content.from, key: content.key });
			if (this.unmounted) return ;
			this.setState({notifications});
		});
		this.socket.emit('auth', localStorage.getItem('logToken'));
	};

	untoggleNotif = (e) => {
		e.preventDefault();
		e.persist();
		axios({
			url: 'https://46.101.169.42:4433/unnotify',
			method: 'post',
			data: {
				key: e.target.id,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			const notifications = this.state.notifications.filter((notif) => notif.key !== e.target.id);
			this.setState({notifications});
		});
	};

	render () {
		return (
		<nav className="navbar navbar-inverse">
		  <div className="container-fluid">
			<div className="navbar-header">
			  <a className="navbar-brand" href="#">Matcha</a>
			</div>
			<ul className="nav navbar-nav">
			  <li><Link to="/">Home</Link></li>
			  <li><Link to="/profile">Profile</Link></li>
			  <li><Link to="/search">Search</Link></li>
			  <li><Link to="/chat">Chat</Link></li>
			</ul>
			<ul className="nav navbar-nav navbar-right">
				<li><Link to="/logout"><span className="glyphicon glyphicon-log-out"></span> Logout ({this.state.username})</Link></li>
			</ul>
		  </div>
		  <div className="notifications">
		  {this.state.notifications.map((notification, i) => <li onClick={this.untoggleNotif} id={notification.key} key={i} className="single-notif" ><Link to={`/profile/${notification.from}`}>{notification.from}</Link> {notification.content}</li>)}
		  </div>
		</nav>
	);
	};
};

export default Header;
