import React from "react";
import "./App.css";
import Icon from "./map_07";

class App extends React.Component {
  componentDidMount() {
    // let x = document.getElementsByTagName("circle");
    // console.log(x);
  }
  constructor(props) {
    super(props);
    this.state = {};
  }

  createElementFromHTML = htmlString => {};

  handleFileSelect = e => {
    var element = document.createElement("div");
    element.innerHTML = '<input type="file">';
    var fileInput = element.firstChild;

    fileInput.addEventListener("change", function() {
      var file = fileInput.files[0];

      if (file.name.match(/\.(txt|svg)$/)) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async () => {
          const result = await reader.result;
          const div = document.createElement("div");
          div.innerHTML = result.trim();

          // if (svg) {
          //     const levelElement = document.createElement('div');
          //     levelElement.appendChild(svg);
          //     document.push(levelElement);
          //     console.log(levelElement);

          // } else {
          //     // reject("404");
          // }
          // console.log("reader.result");
        };
      } else {
        alert("File not supported, .txt or .svg files only");
      }
    });

    fileInput.click();
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Icon />
        </header>
        <button onClick={this.handleFileSelect}>button</button>
      </div>
    );
  }
}

export default App;
