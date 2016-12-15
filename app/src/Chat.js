import React from 'react';
import axios from 'axios';
import { browserHistory } from 'react-router';
import './App.css';

class ChatRender extends React.Component {
	state = {
		currentuser: null,
		users: [],
		onlineusers: [],
		recipient: null,
		room: [],
		socket: null,
	};

	componentWillMount() {
		axios({
			method: 'get',
			url: 'https://46.101.246.154:8080/profile',
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (this.unmounted) return ;
			if (data.error) return (browserHistory.push('/login'));
			const liked = data.liked;
			const likes = data.likes;
			const users = likes.filter((like) => liked && liked.indexOf(like) !== -1);
			this.setState({ currentuser: data.username, users, onlineusers: data.onlineusers });
		});
		this.setupSocket();
	};

	setupSocket = async () => {
		await this.setState({socket: this.props.socket});
		this.state.socket.on('message', (content) => {
			axios({
				method: 'post',
				url: 'https://46.101.246.154:8080/chat',
				data: {
					recipient: this.state.recipient,
					sender: this.state.currentuser,
					clearnotif: true,
				},
				headers: { logToken: localStorage.getItem('logToken') },
			}).then(({data}) => {
				if (!data.error) this.setState({room: data.reverse()})
			});
		});
	};

	componentWillUnmount() {
		this.unmounted = true;
		if (this.state.socket) this.state.socket.removeListener('message');
	};

	selectUser = async (e) => {
		e.preventDefault();
		e.persist();
		axios({
			method: 'post',
			url: 'https://46.101.246.154:8080/chat',
			data: {
				recipient: e.target.id,
				sender: this.state.currentuser,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (!data.error) this.setState({room: data.reverse(), recipient: e.target.id})
		});
	};

	sendMessage = (e) => {
		e.preventDefault();
		if (e.target.message.value.length > 1000) {
			(e.target.message.value = "");
			return ;
		}
		axios({
			method: 'post',
			url: 'https://46.101.246.154:8080/chat',
			data: {
				message: e.target.message.value,
				recipient: this.state.recipient,
				sender: this.state.currentuser,
				date: Date.now(),
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (!data.error) this.setState({room: data.reverse()});
		});
		e.target.message.value = "";
	};

	render() {
		return (
			<div className="chat">
			<div className="userslist">
			{!this.state.users.length && <div>You need to be connected with another user to chat!</div>}
			{this.state.users.length > 0 && this.state.users.sort((a, b) =>
				(this.state.onlineusers.indexOf(b) - this.state.onlineusers.indexOf(a))).map((user, i) =>
					<li className={this.state.onlineusers.indexOf(user) !== -1 ? (`green ${user === this.state.recipient && 'selected'}`) : (`red ${user === this.state.recipient && 'selected'}`)} onClick={this.selectUser} id={user} key={i}>{user}{this.state.onlineusers.indexOf(user) !== -1 && <span className="onlinepoint" />}</li>
			)}
			</div>

			<div className="chatroom">


				{this.state.recipient && <div>
				<form onSubmit={this.sendMessage}>
				<input id="chatinput" type="text" autoComplete="off" name="message" placeholder="write something..."/>
				<input type="submit" hidden={true} />
				</form>
				</div>}

				<div className="tchat">
				{this.state.room.map((message, i) => i < 25 &&
					<div key={i} className={message.sender === this.state.currentuser ? ("self-msg") : ("other-msg")}>
						<div className={message.sender === this.state.currentuser ? ("self-self") : ("other-other")}>
						<span className="message">{message.message}</span>

						</div>
					</div>
				)}
				</div>

			</div>
			</div>
		);
	};
};

const Chat = ({ socket }) => {
	return (
		<div className="chatcomponent">
			<ChatRender socket={socket}/>
		</div>
	);
};

ChatRender.contextTypes = {
	socket: React.PropTypes.object,
};

export default Chat;
