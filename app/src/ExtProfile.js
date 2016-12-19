import React from 'react';
import { browserHistory, Link } from 'react-router';
import axios from 'axios';
import moment from 'moment';
import './App.css';

class ExtProfileRender extends React.Component {
	state = {
		status: null,
		username: undefined,
		popscore: 0,
		firstname: undefined,
		lastname: undefined,
		bio: undefined,
		gender: undefined,
		orientation: undefined,
		location: undefined,
		interests: [],
		pictures: [],
		visitor: true,
		liked: false,
		blocks: false,
		blocked: false,
		isblocked: false,
		isliked: false,
		lastOnline: Date(),
		age: undefined,
		likedClass: "btn btn-default glyphicon glyphicon-hand-up",
		blockedClass: "btn btn-default glyphicon glyphicon-minus-sign",
	};

	getData = () => {
		if (!localStorage.getItem('logToken')) return (browserHistory.push('/login'));
		const path = this.props.location.pathname.split('/');
		axios({
			method: 'put',
			url: `https://montasar.me:4433/profile/${path[2]}`,
			data: {
				visited: path[2],
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (this.unmounted) return ;
			if (data.error) return (browserHistory.push('/login'));
			this.setState({
				username: data.username,
				firstname: data.firstname,
				lastname: data.lastname,
				popscore: data.popscore + 1,
				bio: data.bio,
				interests: data.interests,
				gender: data.gender,
				orientation: data.orientation,
				fullocation: data.location,
				location: data.location.addr,
				pictures: data.pictures,
				visitor: data.visitor,
				liked: data.liked,
				blocked: data.blocked,
				blocks: data.blocks,
				age: data.age,
				lastOnline: data.lastOnline,
			});
			if (data.liked) this.setState({ likedClass: "btn btn-default glyphicon glyphicon-hand-down" });
			if (data.likes.indexOf(data.querier) !== -1) this.setState({ isliked: true });
			if (data.blocks.indexOf(data.querier) !== -1) this.setState({ isblocked: true });
			if (data.blocked) this.setState({ blockedClass: "btn btn-default glyphicon glyphicon-ok-sign" });
		});
	};

	like = () => {
		const { username, liked, popscore } = this.state;
 		axios({
			method: 'post',
			url: `https://montasar.me:4433/${liked ? 'unlike' : 'like'}`,
			data: {
				liked: username,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ status: data.details });
			} else {
				this.setState({ liked: !liked,
					likedClass: `btn btn-default glyphicon glyphicon-hand-${liked ? 'up' : 'down'}`,
					popscore: liked ? popscore-10 : popscore+10 });
			}
		});
	};

	block = () => {
		const { username, blocked, popscore } = this.state;
		axios({
			method: 'post',
			url: `https://montasar.me:4433/${blocked ? 'unblock' : 'block'}`,
			data: {
				blocked: username,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ status: data.details })
			} else {
				this.setState({ blocked: !blocked,
					blockedClass: `btn btn-default glyphicon glyphicon-${blocked ? 'minus-sign' : 'ok-sign'}`,
					popscore: blocked ? popscore+50 : popscore-50 });
			}
		});
	};

	report = () => {
		const { username } = this.state;
		axios({
			method: 'post',
			url: 'https://montasar.me:4433/report',
			data: {
				reported: username,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ status: data.details });
			}
		});
	};

	componentWillMount() {
		this.getData();
	};

	componentWillUnmount() {
		this.unmounted = true;
	};

	clearstatus = (e) => {
		this.setState({status: null});
	};

	render() {
		return (
			<div>
			<div className="wrapper">
				{this.state.status && <div onClick={this.clearstatus} className="alert alert-danger">{this.state.status}</div>}
				{this.state.lastOnline === 'now' ? (<div className="profilefield">online <span className="onlinepoint"></span></div>) : (<div className="profilefield">last connected: {moment(new Date(this.state.lastOnline)).fromNow()}</div>)}
				{((this.state.isliked && this.state.liked) && (<div className="profilefield"> its a match !! <Link to="/chat">chat with {this.state.username} ?</Link></div>))
				|| ((this.state.isliked) && (<div className="profilefield"><i className="fa fa-heartbeat" aria-hidden="true"></i> this user likes you</div>))
				|| (<div></div>)}
				{this.state.pictures[0] && (
					<div className="thumbnails">
					<div className="thumbnail">
						<img role="presentation" id={0} height="300px" src={"https://montasar.me:4433" + this.state.pictures[0]} key={0}/>
					</div>
					</div>
				)}
				<div className="profiledetail">
				<p>
				<span className="profiledetail-art">username</span>
				{this.state.username}</p>
				<p>
					<span className="profiledetail-art">popularity</span>
					<i className="fa fa-fire" aria-hidden="true"></i>
					{this.state.popscore}
				</p>
				<p>
				<span className="profiledetail-art">firstname</span>
				{this.state.firstname}</p>
				<p>
				<span className="profiledetail-art">lastname</span>
				{this.state.lastname}</p>
				<p>
				<span className="profiledetail-art">gender</span>
				{this.state.gender}</p>
				<p>
				<span className="profiledetail-art">looking for</span>
				{this.state.orientation}</p>

				{this.state.bio &&
					(
						<div>
					<span className="profiledetail-art">bio</span>
					<div>
					<blockquote>{this.state.bio}</blockquote>
					</div>
					</div>)
				}
				{this.state.interests.length > 0 &&
				<div>
				<span className="profiledetail-art">interested in</span>
				<div>
				{this.state.interests.map((interest, i) =>
					<li className="btn btn-default btn-file" key={i} id={i}>{interest}</li>
				)}
				</div>
				</div>
				}
				<p><span className="profiledetail-art">location</span><i className="fa fa-map-marker" aria-hidden="true"></i> {this.state.location}</p>
				<p><span className="profiledetail-art">age</span>{this.state.age} years old</p>


				</div>
				<div className="thumbnails">
				{this.state.pictures.map((picture, i) => i !== 0 &&
					<div key={i} className="thumbnail">
					<img role="presentation" id={i} height="200px" src={"https://montasar.me:4433" + picture} key={i}/>
					</div>
				)}
				</div>


				<div className="interact">
				{(this.state.visitor && !this.state.isblocked) ? (<a onClick={this.like} className={this.state.likedClass}></a>) : (<div></div>)}
				{(this.state.visitor && !this.state.isblocked) ? (<a onClick={this.block} className={this.state.blockedClass}></a>) : (<div></div>)}
				{this.state.visitor ? (<a onClick={this.report} className="btn btn-default glyphicon glyphicon-exclamation-sign"></a>) : (<div></div>)}
				</div>
			</div>
			</div>
		);
	};
};

const ExtProfile = ({ location }) => {
	return (
		<div className="ext-profile">
			<ExtProfileRender location={ location } />
		</div>
	);
};

export default ExtProfile;
