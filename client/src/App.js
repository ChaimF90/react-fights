import React, { Component } from 'react';
import './App.css';
import axios from "axios";

class App extends Component {
  state = {
    code: "",
    enteredCode: `
    import React from "react";
    import ReactDOM from "react-dom";
    
    const Index = () => {
      return <div>Hello React!</div>;
    };
    
    ReactDOM.render(<Index />, document.getElementById("index"));
    `,
  }

  componentDidMount() {
    axios.get("/sample").then(res => this.setState({code: res.data.code}));
  }

  compile = () => {
    axios.post("/compile", {code: this.state.enteredCode}).then(res => this.setState({code: res.data.code}));
  }

  render() {
    return (
      <div className="App">
        <iframe 
          title="sandbox"
          id="hahah"
          srcDoc={this.state.code}
        />
        <br />
        <textarea 
          value={this.state.enteredCode}
          onChange={(e) => this.setState({enteredCode: e.target.value})}
        />
        <button onClick={this.compile}>Compile</button>
      </div>
    );
  }
}

export default App;
