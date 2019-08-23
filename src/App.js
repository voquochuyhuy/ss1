import React from "react";
import "./App.css";
const Graph = require("node-dijkstra");
class App extends React.Component {
  isDrawingEdge = false;
  vertices = null;
  componentDidMount() {}
  constructor(props) {
    super(props);
    this.state = {
      vertex1: {},
      vertex2: {},
      edges: [],
      graphs: [],
      edgeVertex1: null,
      edgeVertex2: null,
      feature :"",
    };
    this.addClickEventForCircle = this.addClickEventForCircle.bind(this);
  }
  OnDrawingEgde = ()=>{
    this.setState({feature:"draw"});
  }
  drawEdge(vertex1, vertex2) {
    console.log('draw');
    if(this.state.feature === "draw")
    {
      const { graphs } = this.state;
      const x1 = vertex1.getAttributeNS(null, "cx");
      const y1 = vertex1.getAttributeNS(null, "cy");
      const x2 = vertex2.getAttributeNS(null, "cx");
      const y2 = vertex2.getAttributeNS(null, "cy");
      const deltaX = Math.abs(parseInt(x2) - parseInt(x1));
      const deltaY = Math.abs(parseInt(y2) - parseInt(y1));
      const cost = Math.round(
        Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
      );
      const idVertex1 = vertex1.id;
      const idVertex2 = vertex2.id;
      //check idVertex1 is existed in graphs
      if (graphs[idVertex1]) {
        graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
        this.setState({ graphs });
      } else {
        const graph = {
          [idVertex1]: {
            [idVertex2]: cost
          }
        };
        this.setState({ graphs: { ...graphs, ...graph } });
      }

      //check edge exist
      let edgeExist = false;
      if (graphs[idVertex2] && graphs[idVertex2][idVertex1]) {
        edgeExist = true;
      }
      if (edgeExist) {
        alert("Edges exist");
      } else {
        const node_path = document.getElementById("node-pathline");
        let edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
        edge.setAttributeNS(null, "x1", x1);
        edge.setAttributeNS(null, "y1", y1);
        edge.setAttributeNS(null, "x2", x2);
        edge.setAttributeNS(null, "y2", y2);
        edge.setAttributeNS(null, "stroke", "red");
        edge.setAttributeNS(null, "stroke-width", "3");
        edge.setAttributeNS(null, "fill", "none");
        edge.setAttributeNS(null, "stroke-dasharray", "5,5");
        edge.addEventListener("click",()=>{this.DeleteEgde(edge)});
        node_path.appendChild(edge);
        // SVGnodes.appendChild(g);
      }
    }
  }
  /**********************START wayFiding***********************/
  wayFiding() {
    const el = document.createElement("div");
    el.innerHTML = "<input type='file'/>";
    const fileInput = el.firstChild;
    fileInput.addEventListener("change", this.onFileGraphsChange);
  }
  onFileGraphsChange = e => {
    const reader = new FileReader();
    reader.onload = e => {
      const graphsStr = e.target.result;
      const graphsJson = JSON.parse(graphsStr);
      console.log("length graphsJson", graphsJson.length);
    };
    reader.readAsText(e.target.files[0]);
  };
  findShortestPath(graphs, vertex1, vertex2) {
    const route = new Graph({
      ...graphs
    });
    //vertex1 is id of element's circle vertex1
    const path = route.path(vertex1, vertex2);
    return path;
  }
  drawShortestPath(graphs, vertex1, vertex2) {
    const pathArr = this.findShortestPath(graphs, vertex1, vertex2);
    let X = [];
    let Y = [];
    pathArr.forEach(vertexId => {
      X.push(document.getElementById(vertexId).attributes.cx.value);
      Y.push(document.getElementById(vertexId).attributes.cy.value);
    });
    // X.push(document.getElementById("L4_24_NODE").attributes.cx.value);
    // X.push(document.getElementById("L4_21B_NODE").attributes.cx.value);
    // X.push(document.getElementById("L4_20_A_NODE").attributes.cx.value);
    // X.push(document.getElementById("L4_19_A_NODE").attributes.cx.value);
    // X.push(document.getElementById("L4_18_A_NODE").attributes.cx.value);
    // X.push(document.getElementById("L4_32_NODE").attributes.cx.value);

    // Y.push(document.getElementById("L4_24_NODE").attributes.cy.value);
    // Y.push(document.getElementById("L4_21B_NODE").attributes.cy.value);
    // Y.push(document.getElementById("L4_20_A_NODE").attributes.cy.value);
    // Y.push(document.getElementById("L4_19_A_NODE").attributes.cy.value);
    // Y.push(document.getElementById("L4_18_A_NODE").attributes.cy.value);
    // Y.push(document.getElementById("L4_32_NODE").attributes.cy.value);

    let SVGnodes = document.getElementById("nodes");
    var NoAnimatedPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    NoAnimatedPath.setAttributeNS(
      null,
      "d",
      `M ${X[0]} ${Y[0]} L ${X[1]} ${Y[1]} L ${X[2]} ${Y[2]} L ${X[3]} ${
        Y[3]
      } L ${X[4]} ${Y[4]}`
    );
    NoAnimatedPath.setAttributeNS(null, "stroke", "red");
    NoAnimatedPath.setAttributeNS(null, "stroke-width", "3");
    NoAnimatedPath.setAttributeNS(null, "fill", "none");
    NoAnimatedPath.setAttributeNS(null, "stroke-dasharray", "10");
    SVGnodes.appendChild(NoAnimatedPath);

    var animatedPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    animatedPath.setAttributeNS(
      null,
      "d",
      `M ${X[0]} ${Y[0]} L ${X[1]} ${Y[1]} L ${X[2]} ${Y[2]} L ${X[3]} ${
        Y[3]
      } L ${X[4]} ${Y[4]}`
    );
    animatedPath.setAttributeNS(null, "id", "animated-path");
    animatedPath.setAttributeNS(null, "stroke-width", "3");
    // animatedPath.setAttributeNS(null, "stroke", "red");
    SVGnodes.appendChild(animatedPath);
  }
  /********************END wayFiding*************************/

  handleMouseClick(e) {
    if(this.state.feature === "draw")
    {
      const clickTarget = e.target;
      if (clickTarget.nodeName === "circle") {
        if (!this.isDrawingEdge) {
          this.state.edgeVertex1 = clickTarget;
          this.isDrawingEdge = true;
        } else if (clickTarget !== this.state.edgeVertex1) {
          this.state.edgeVertex2 = clickTarget;
          this.drawEdge(this.state.edgeVertex1, this.state.edgeVertex2);
          this.state.edgeVertex1 = null;
          this.state.edgeVertex2 = null;
          this.isDrawingEdge = false;
        }
      }
    }
  }
  addClickEventForCircle = () => {
    const vertices = document.getElementsByTagName("circle");
    this.vertices = vertices;
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].addEventListener("click", e => {
        this.handleMouseClick(e);
      });
    }
  };


  
  OnDeleteEgde = ()=>{
    this.setState({feature:"delete"});
  }
  DeleteEgde = (edge)=>{
    console.log("ham` xoa");
    console.log(edge);
    if(this.state.feature === "delete")
    {
      edge.parentElement.removeChild(edge);
    }
  }
  OnWayFinding = ()=>{
    this.setState({feature:"find"});
  }
  WayFinding = ()=>{

  }
  handleFileSelect = e => {
    var element = document.createElement("div");
    element.innerHTML = '<input type="file">';
    var fileInput = element.firstChild;
    fileInput.addEventListener("change", () => {
      var file = fileInput.files[0];
      if (file.name.match(/\.(txt|svg)$/)) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async () => {
          const result = await reader.result;
          const node_pathline = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
          );
          node_pathline.setAttributeNS(null, "id", "node-pathline");
          if (document.getElementsByTagName("svg").length === 0) {
            const div = document.createElement("div");
            div.innerHTML = result.trim();
            document.body.appendChild(div);
          } else {
            let oldSVG = document.getElementsByTagName("svg")[0].parentElement;
            const newSVG = document.createElement("div");
            newSVG.innerHTML = result.trim();
            oldSVG.parentElement.replaceChild(newSVG, oldSVG);
          }
          const nodes = document.getElementById("nodes");
          nodes.parentElement.appendChild(node_pathline);

          const node_pathline_clone = node_pathline.cloneNode(true);
          const nodes_clone = nodes.cloneNode(true);
          console.log(nodes_clone);
          nodes.replaceWith(node_pathline_clone);
          node_pathline.replaceWith(nodes_clone);
          this.addClickEventForCircle();
          // this.Effect();
        };
      } else {
        alert("File not supported, .txt or .svg files only");
      }
    });

    fileInput.click();
  };
  handleSaveGraphs = e => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    const data = this.state.graphs;
    const fileName = "graphs.json";
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "octet/stream" });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  render() {
    return (
      <div className="App">
        <button onClick={this.handleFileSelect}>button</button>
        <button onClick={this.handleSaveGraphs}>Save graphs</button>
        <div>
          <input type="radio" id="draw" onChange={()=>{this.OnDrawingEgde()}}   name="chooseFeature"></input>DRAW <br/>
          <input type="radio" id="delete" onChange={()=>{this.OnDeleteEgde()}}  name="chooseFeature"></input>DELETE <br/>
          <input type="radio" id="way-Finding" onChange={()=>{this.OnWayFinding()}} name="chooseFeature"></input>Way Finding <br/>
          {
            this.state.feature === "find" ? (
              <div>
              <input type="text" ></input>
              <span >      </span>
              <input type="text" ></input>
              </div>
            ):null
          }
        </div>
      </div>
    );
  }
}

export default App;
