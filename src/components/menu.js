import React, { Component } from 'react'

export default class Menu extends Component {
  constructor(props){
    super(props);
    this.state = {
      feature:""
    }
  }
  render() {
    return (
      <div>
        <div id="menu">
            <button onClick={this.props.handleFileSelect}>Load map</button>
            <button onClick={this.props.handleSaveGraphs}>Save graphs</button>
            <button onClick={this.props.LoadGraphsFile}>Load Graphs File</button>
        </div>
        <div>
            <input type="radio" id="draw" onChange={() => {this.setState({feature:""}); this.props.drawEdgeFromGraphs(); this.props.OnDrawingEgde();}}name="chooseFeature"/>DRAW <br />
            <input type="radio" id="delete" onChange={() => { this.setState({feature:""}); this.props.OnDeleteEgde();}} name="chooseFeature"/>DELETE <br />
            <input type="radio" id="way-Finding" onChange={() => {this.setState({feature:"find"}); this.props.OnWayFinding();}} name="chooseFeature"/>Way Finding <br />
        </div>
        {
            this.state.feature === 'find' ? (
                <div>
                    <input type="text" id="first-vertex" />
                    <span> </span>
                    <input type="text" id="second-vertex" />
                </div>) : null
        }
      </div>
    )
  }
}

