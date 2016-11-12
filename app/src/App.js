import React, { Component } from 'react';
import Header from './partials/Header';
import Footer from './partials/Footer';

class App extends Component {

	render() {
		return (
			<div className="App">
			  <Header location={this.props.location} ref="header" socket={this.props.socket}/>
			  {this.props.children}
			  <Footer />
		  </div>
	    );
	  }
};

export default App;
