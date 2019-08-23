import React from "react";
export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: ""
    };
  }
  handleChange = e => {
    const value = e.currentTarget.value;
  };
  render() {
    return (
      <div>
        <div className="radio">
          <label>
            <input
              type="radio"
              value="draw"
              checked={this.state.selectedOption}
              onChange={this.handleChange}
            />
            Draw Edges
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" value="delete" />
            Delete Edges
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" value="way-finding" />
            Way Finding
          </label>
        </div>
      </div>
    );
  }
}
