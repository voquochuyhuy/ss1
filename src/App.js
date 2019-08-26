import React from "react";
import "./App.css";
import pinLogo from "./pin-logo.png";
const Graph = require("node-dijkstra");
class App extends React.Component {
  isDrawingEdge = false;
  isFindingPath = false;
  vertices = null;
  componentDidMount() {}
  constructor(props) {
    super(props);
    this.state = {
      vertex1: "",
      vertex2: "",
      edges: [],
      graphs: [],
      loadedGraphs: {},
      edgeVertex1: null,
      edgeVertex2: null,
      feature: "",
      route: null
    };
    this.addClickEventForCircle = this.addClickEventForCircle.bind(this);
  }
  OnDrawingEgde = () => {
	this.setState({ feature: "draw" });
  };
  /**@description add two vertex to graphs
   * @returns edgeExisted : if exist edge between them, return false, otherwise, null
   */
  addVertexToGraphs(vertex1, vertex2) {
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
    let edgeExisted = false;
    //check idVertex1 is existed in graphs
    if (graphs[idVertex1]) {
      if (graphs[idVertex2] && graphs[idVertex2][idVertex1]) {
        console.log("ton tai v1, v2 va v1 co v2 => trung nhau");
        edgeExisted = true;
        return edgeExisted;
      } else if (graphs[idVertex2] && !graphs[idVertex2][idVertex1]) {
        console.log("ton tai v1, v2 nhung v1 chua co v2");
        graphs[idVertex2] = { ...graphs[idVertex2], [idVertex1]: cost };
        graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
        this.setState({ graphs });
      } else if (!graphs[idVertex2]) {
        console.log("ton tai v1 va ko ton tai v2");
        graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
        const graph = {
          [idVertex2]: {
            [idVertex1]: cost
          }
        };
        this.setState({ graphs: { ...graphs, ...graph } });
      } else {
        graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
        const graph = {
          [idVertex2]: {
            [idVertex1]: cost
          },
          [idVertex1]: {
            [idVertex2]: cost
          }
        };
        this.setState({ graphs: { ...graphs, ...graph } });
      }
      return edgeExisted;
    } else {
      //v1 chua co nhung v2 da co
      console.log("v1 chua co nhung v2 da co ");
      if (graphs[idVertex2]) {
        graphs[idVertex2] = { ...graphs[idVertex2], [idVertex1]: cost };
        //them v1 vao graphs
        const graph = {
          [idVertex1]: {
            [idVertex2]: cost
          }
        };
        this.setState({ graphs: { ...graphs, ...graph } });
      } else {
        //ca 2 cung chua co
        console.log("ca 2 cung chua co");
        const graph = {
          [idVertex1]: {
            [idVertex2]: cost
          },
          [idVertex2]: {
            [idVertex1]: cost
          }
        };
        this.setState({ graphs: { ...graphs, ...graph } });
      }
    }
    return edgeExisted;
  }
  drawEdge(vertex1, vertex2) {
    console.log("draw");
    if (this.state.feature === "draw") {
      const edgeExisted = this.addVertexToGraphs(vertex1, vertex2);
      const x1 = vertex1.getAttributeNS(null, "cx");
      const y1 = vertex1.getAttributeNS(null, "cy");
      const x2 = vertex2.getAttributeNS(null, "cx");
      const y2 = vertex2.getAttributeNS(null, "cy");
      //check edge exist

      if (edgeExisted) {
        alert("Edges exist");
      } else {
        const node_path = document.getElementById("node-pathline");
        let edge = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        edge.setAttributeNS(null, "x1", x1);
        edge.setAttributeNS(null, "y1", y1);
        edge.setAttributeNS(null, "x2", x2);
        edge.setAttributeNS(null, "y2", y2);
        edge.setAttributeNS(null, "stroke", "red");
        edge.setAttributeNS(null, "stroke-width", "3");
        edge.setAttributeNS(null, "fill", "none");
        edge.setAttributeNS(null, "stroke-dasharray", "5,5");
        edge.addEventListener("click", () => {
          this.DeleteEgde(edge);
        });
        node_path.appendChild(edge);
        // SVGnodes.appendChild(g);
      }
    }
  }
  /**********************START wayFiding***********************/
  async LoadGraphsFile() {
    const el = await document.createElement("div");
    el.innerHTML = "<input type='file'/>";
    const fileInput = await el.firstChild;
    await fileInput.click();
    console.log(el);
    await fileInput.addEventListener("change", e => {
      console.log(".");
      if (fileInput.files[0].name.match(/\.(txt|json)$/)) {
        this.onFileGraphsChange(e);
      } else {
        alert(`File not supported, .txt or .json files only`);
      }
    });
  }
  onFileGraphsChange = e => {
    console.log("..");
    const reader = new FileReader();
    reader.onload = async e => {
      const graphsStr = await e.target.result;
      const graphsJson = JSON.parse(graphsStr);
      this.setState({
        loadedGraphs: graphsJson,
        route: new Graph({ ...graphsJson })
      });
      console.log(graphsJson);
    };
    reader.readAsText(e.target.files[0]);
  };
  findShortestPath(vertex1, vertex2) {
    //vertex1 is id of element's circle vertex1
    const path = this.state.route.path(vertex1, vertex2);
    return path;
  }
  drawShortestPath(vertex1, vertex2) {
    const pathArr = this.findShortestPath(vertex1, vertex2);
    console.log(pathArr);
    let X = [];
    let Y = [];
    if (!pathArr) {
      alert("Not found shotest path, check model graphs");
      return;
    }
    pathArr.forEach(vertexId => {
      X.push(document.getElementById(vertexId).attributes.cx.value);
      Y.push(document.getElementById(vertexId).attributes.cy.value);
    });
    let first_vertex = document.getElementById(pathArr[0]);
    first_vertex.setAttributeNS(null, "class", "highlight-circle");
    let final_vertex = document.getElementById(pathArr[pathArr.length - 1]);
    final_vertex.setAttributeNS(null, "class", "highlight-circle");
    const pinLogo = document.createElementNS( "http://www.w3.org/2000/svg","image")
    pinLogo.setAttributeNS('http://www.w3.org/1999/xlink','href',"./pin-logo.svg");
    pinLogo.setAttributeNS(null,"x",`${final_vertex.attributes.cx.value - 15}`);
    pinLogo.setAttributeNS(null,"y",`${final_vertex.attributes.cy.value - 30}`);
    pinLogo.setAttributeNS(null,"width",`30`);
    pinLogo.setAttributeNS(null,"height",`30`);
    pinLogo.setAttributeNS(null,"id","pin-logo");
    pinLogo.setAttributeNS(null,"background","transparent");
    let SVGnodes = document.getElementById("nodes");
    
    var NoAnimatedPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    let M = `M ${X[0]} ${Y[0]}`;
    for (let i = 1; i < X.length; i++) {
      M += `L ${X[i]} ${Y[i]} `;
    }
    NoAnimatedPath.setAttributeNS(null, "d", `${M}`);
    NoAnimatedPath.setAttributeNS(null, "stroke", "rgb(247, 199, 0)");
    NoAnimatedPath.setAttributeNS(null, "stroke-width", "3");
    NoAnimatedPath.setAttributeNS(null, "fill", "transparent");
    NoAnimatedPath.setAttributeNS(null, "stroke-dasharray", "10");
    NoAnimatedPath.setAttributeNS(null, "id", "noAnimation-path");
    SVGnodes.appendChild(NoAnimatedPath);

    var animatedPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    animatedPath.setAttributeNS(null, "d", `${M}`);
    animatedPath.setAttributeNS(null, "id", "animation-path");
    animatedPath.setAttributeNS(null, "stroke-width", "3");
    animatedPath.setAttributeNS(null, "fill", "transparent");

    SVGnodes.appendChild(animatedPath);
    SVGnodes.appendChild(pinLogo);
  }
  /********************END wayFiding*************************/

  handleMouseClick(e) {
    const clickTarget = e.target;
    if (this.state.feature === "draw") {
      if (clickTarget.nodeName === "circle") {
        if (!this.isDrawingEdge) {
          this.state.edgeVertex1 = clickTarget;
          this.isDrawingEdge = true;
        } else if (clickTarget !== this.state.edgeVertex1) {
          this.state.edgeVertex2 = clickTarget;
          this.drawEdge(this.state.edgeVertex1, this.state.edgeVertex2);
          // this.state.edgeVertex1 = null;
          // this.state.edgeVertex2 = null;
          this.setState({ edgeVertex1: null, edgeVertex2: null });
          this.isDrawingEdge = false;
        }
      }
    } else if (this.state.feature === "find") {		
      if (document.getElementById("animation-path") !== null) {
        let noAnimation_Path = document.getElementById("noAnimation-path");
        noAnimation_Path.parentElement.removeChild(noAnimation_Path);
        let animated_Path = document.getElementById("animation-path");
        animated_Path.parentElement.removeChild(animated_Path);
        let first_vertex = document.getElementById(this.state.vertex1);
        first_vertex.removeAttribute("class");
        let final_vertex = document.getElementById(this.state.vertex2);
        final_vertex.removeAttribute("class");
        let pin_logo = document.getElementById("pin-logo");
        pin_logo.parentElement.removeChild(pin_logo);
      }
      if (!this.isFindingPath) {
        document
          .getElementById("first-vertex")
          .setAttribute("value", e.target.id);
        // this.state.vertex1 = e.target.id;
        this.setState({ vertex1: e.target.id });
        this.isFindingPath = true;
      } else {
        if (e.target.id === this.state.vertex1) {
          alert("Vertex cannot connect it self");
          this.setState({ vertex1: "", vertex2: "" });
          this.isFindingPath = false;
          return;
        }
        document
          .getElementById("second-vertex")
          .setAttribute("value", e.target.id);
        // this.state.vertex2 = e.target.id;
        this.setState({ vertex2: e.target.id });
        this.drawShortestPath(this.state.vertex1, this.state.vertex2);
        this.isFindingPath = false;
        // this.setState({ vertex1: "", vertex2: "" });
      }

      // document.getElementById('first-vertex');
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

  OnDeleteEgde = () => {
    this.setState({ feature: "delete" });
  };
  DeleteEgde = edge => {
    console.log("ham` xoa");
    console.log(edge);
    if (this.state.feature === "delete") {
      edge.parentElement.removeChild(edge);
    }
  };
  OnWayFinding = () => {
	this.setState({ feature: "find" });
	const pathNodes = document.getElementsByTagName("circle");
	for (let i = 0; i < pathNodes.length; i++) {
	  if (pathNodes[i].id.startsWith("L4_PATH")) {
		pathNodes[i].setAttributeNS(null, "fill", "transparent");
		pathNodes[i].setAttributeNS(null, "stroke", "transparent");
	  }
	}
  };

  handleFileSelect = async e => {
    
    var element = document.createElement("div");
    element.innerHTML = '<input type="file">';
    var fileInput = element.firstChild;
    fileInput.click();
    await fileInput.addEventListener("change", async () => {
      var file = fileInput.files[0];
      if (file.name.match(/\.(txt|svg)$/)) {
        var reader = new FileReader();
        await reader.readAsText(file);
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
        <button onClick={this.handleFileSelect}>Load map</button>
        <button onClick={this.handleSaveGraphs}>Save graphs</button>
        <div>
          <input
            type="radio"
            id="draw"
            onChange={() => {
              this.OnDrawingEgde();
            }}
            name="chooseFeature"
          />
          DRAW <br />
          <input
            type="radio"
            id="delete"
            onChange={() => {
              this.OnDeleteEgde();
            }}
            name="chooseFeature"
          />
          DELETE <br />
          <input
            type="radio"
            id="way-Finding"
            onChange={() => {
              this.OnWayFinding();
            }}
            name="chooseFeature"
          />
          Way Finding <br />
          {this.state.feature === "find" ? (
            <div>
              <input type="text" id="first-vertex" />
              <span> </span>
              <input type="text" id="second-vertex" />
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => {
                    this.LoadGraphsFile();
                  }}
                >
                  Load Graphs File
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default App;
