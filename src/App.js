import React from "react";
import "./App.css";
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
      edgeVertex2: null
    };
    this.addClickEventForCircle = this.addClickEventForCircle.bind(this);
  }
  drawEdge(vertex1, vertex2) {
	  const {graphs}  = this.state
    // const elLine = document.getElementById('node-pathline');
    // const edges = elLine.getElementsByTagName("line");
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
	
	// graphs.forEach()
	if (graphs[idVertex1]){
		graphs[idVertex1] = {...graphs[idVertex1], [idVertex2]: cost}
		this.setState({ graphs });
	}else {
		const graph = {
			[idVertex1]: {
				[idVertex2]: cost
			}
		};
		this.setState({ graphs: {...graphs, ...graph }});
	}


    //check edge exist
    const edges = document.getElementsByTagName("line");
    let edgeExist = false;
	if(graphs[idVertex2] && graphs[idVertex2][idVertex1]){ 
		edgeExist = true
	}
    if (edgeExist) {
      alert("Edges exist");
    } else {
      // let SVGnodes = document.getElementById("nodes");
      // const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      // g.setAttributeNS(null, "id", "node-pathline");
      const node_path = document.getElementById('node-pathline');
      let edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
      edge.setAttributeNS(null, "x1", x1);
      edge.setAttributeNS(null, "y1", y1);
      edge.setAttributeNS(null, "x2", x2);
      edge.setAttributeNS(null, "y2", y2);
      edge.setAttributeNS(null, "stroke", "red");
      edge.setAttributeNS(null, "stroke-width", "3");
      edge.setAttributeNS(null, "fill", "none");
      edge.setAttributeNS(null, "stroke-dasharray", "5,5");
      node_path.appendChild(edge);
      // SVGnodes.appendChild(g);
    }
  }
  handleMouseClick(e) {
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
  addClickEventForCircle = () => {
    const vertices = document.getElementsByTagName("circle");
    this.vertices = vertices;
    for (let i = 0; i < this.vertices.length; i++) {
      vertices[i].addEventListener("click", e => {
        this.handleMouseClick(e);
      });
    }
  };

  testEffect = () => {};
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
          const node_pathline = document.createElementNS("http://www.w3.org/2000/svg", "g");
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
          const nodes = document.getElementById('nodes');
          nodes.parentElement.appendChild(node_pathline);

          const node_pathline_clone = node_pathline.cloneNode(true);
          const nodes_clone = nodes.cloneNode(true);
          console.log(nodes_clone);
          nodes.replaceWith(node_pathline_clone);
          node_pathline.replaceWith(nodes_clone);
          this.addClickEventForCircle();
          // this.testEffect();
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
      </div>
    );
  }
}

export default App;
