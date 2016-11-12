import React from 'react';
import List from './List';
import './App.css';

class HomeRender extends React.Component {
	state = {
		status: null,
	};

	render() {
		return (
			<List />
		);
	};
};


const Home = () => {
	return (
		<div className="home">
			<HomeRender />
		</div>
	);
};

export default Home;
