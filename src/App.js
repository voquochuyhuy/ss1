import React from "react";
import RelationshipTable from "./components/RelationshipTable";
import "./App.css";
import _ from "lodash";
import pinLogo from "./pin-logo.png";
const Graph = require("node-dijkstra");
class App extends React.Component {
    isDrawingEdge = false;
    isFindingPath = false;
    vertices = null;
    componentDidMount() { }
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
            route: null,
            currentNumberOfMap: [],
            isDrawFromGraphs: false
        };
        this.addClickEventForCircle = this.addClickEventForCircle.bind(this);
    }
    OnDrawingEgde = () => {
        this.setState({ feature: "draw", vertex1: "", vertex2: "" });
        const pathNodes = document.getElementsByTagName("circle");
        for (let i = 0; i < pathNodes.length; i++) {
            if (pathNodes[i].id.startsWith("L4_PATH")) {
                pathNodes[i].setAttributeNS(null, "fill", "rgb(101, 95, 84)");
                pathNodes[i].setAttributeNS(null, "stroke", "rgb(230, 231, 232)");
            }
        }
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
    drawEdgeFromGraphs = () => {
        const { loadedGraphs } = this.state;
        console.log('drawEdgeFromGraphs called');
        const array = [];
        Object.keys(loadedGraphs).forEach(nodeId => {
            Object.keys(loadedGraphs[nodeId]).forEach(nodeNeighborId => {
                // this.drawEdge(node, nodeNeighbor, '0');
                if (_.findIndex(array, { 'node': nodeNeighborId, 'neighbor': nodeId }) === -1) {
                    array.push({ 'node': nodeId, 'neighbor': nodeNeighborId });
                }
            });
        });
        array.forEach(item => {
            this.drawEdge(item.node, item.neighbor, '0');
        })
        this.setState({ isDrawFromGraphs: true });
    }
    drawEdge = (vertex1, vertex2, i) => {
        // if (this.state.feature === "draw") {
        //check vertex1 and vertex2 là 1 HMTLElement hay 1 string
        //Nếu là string (id của 1 Element) thì vẽ dựa vào graphs có sẵn, k thì tạo graphs mới
        const node_path = document.getElementById(`node-pathline-${i}`);
        const draw = (v1, v2) => {
            const x1 = v1.getAttributeNS(null, "cx");
            const y1 = v1.getAttributeNS(null, "cy");
            const x2 = v2.getAttributeNS(null, "cx");
            const y2 = v2.getAttributeNS(null, "cy");
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
        }
        if (typeof vertex1 !== "string") {
            console.log('go to vertex element');
            const edgeExisted = this.addVertexToGraphs(vertex1, vertex2);
            edgeExisted ? alert('edge already exists') : draw(vertex1, vertex2);
        }
        else {
            console.log('go to vertex string : ', vertex1, vertex2);
            const vtx1 = document.getElementById(vertex1);
            const vtx2 = document.getElementById(vertex2);
            console.log('vtx1 : ', vtx1, 'vtx2 : ', vtx2);
            draw(vtx1, vtx2);
        }
        // }
    }
    /**********************START wayFiding***********************/
    async LoadGraphsFile() {
        const el = await document.createElement("div");
        el.innerHTML = "<input type='file'/>";
        const fileInput = await el.firstChild;
        await fileInput.click();
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
        const reader = new FileReader();
        reader.onload = async e => {
            const graphsStr = await e.target.result;
            const graphsJson = JSON.parse(graphsStr);
            this.setState({
                loadedGraphs: graphsJson,
                route: new Graph({ ...graphsJson })
            });
        };
        reader.readAsText(e.target.files[0]);
    };
    findShortestPath(vertex1, vertex2) {
        //vertex1 is id of element's circle vertex1
        const { route } = this.state;
        if (!route) return null;
        const path = route.path(vertex1, vertex2);
        return path;
    }
    drawShortestPath(vertex1, vertex2, node_path_id) {
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
        const pinLogo = document.createElementNS("http://www.w3.org/2000/svg", "image")
        pinLogo.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "./pin-logo.png");
        pinLogo.setAttributeNS(null, "x", `${final_vertex.attributes.cx.value - 15}`);
        pinLogo.setAttributeNS(null, "y", `${final_vertex.attributes.cy.value - 30}`);
        pinLogo.setAttributeNS(null, "width", `30`);
        pinLogo.setAttributeNS(null, "height", `30`);
        pinLogo.setAttributeNS(null, "id", "pin-logo");
        pinLogo.setAttributeNS(null, "background", "transparent");
        let SVGnodes = document.getElementById(`nodes-${node_path_id}`);

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

    handleMouseClick(e, node_path_id) {
        const clickTarget = e.target;
        if (this.state.feature === "draw") {
            if (clickTarget.nodeName === "circle") {
                if (!this.isDrawingEdge) {
                    this.setState({ edgeVertex1: clickTarget });
                    this.isDrawingEdge = true;
                } else if (clickTarget !== this.state.edgeVertex1) {
                    this.setState({ edgeVertex2: clickTarget });
                    this.drawEdge(this.state.edgeVertex1, this.state.edgeVertex2, node_path_id);
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
                this.setState({ vertex2: e.target.id });
                this.drawShortestPath(this.state.vertex1, this.state.vertex2, node_path_id);
                this.isFindingPath = false;
                // this.setState({ vertex1: "", vertex2: "" });
            }

            // document.getElementById('first-vertex');
        }
    }
    addClickEventForCircle = (node_path_id) => {
        let svg = document.getElementById(`nodes-${node_path_id}`);
        const vertices = svg.getElementsByTagName("circle");
        this.vertices = vertices;
        for (let i = 0; i < vertices.length; i++) {
            vertices[i].addEventListener("click", e => {
                this.handleMouseClick(e, node_path_id);
            });
        }
    };

    OnDeleteEgde = () => {
        this.setState({ feature: "delete" });
    };
    DeleteEgde = edge => {
        if (this.state.feature === "delete") {
            edge.parentElement.removeChild(edge);
        }
    };
    OnWayFinding = () => {
        this.setState({ feature: "find", vertex1: "", vertex2: "" });
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
        element.innerHTML = '<input type="file" multiple>';
        var fileInput = element.firstChild;
        fileInput.click();
        await fileInput.addEventListener("change", async () => {
            let promises = [];

            for (let file of fileInput.files) {
                let filePromise = new Promise(resolve => {
                    let reader = new FileReader();
                    reader.readAsText(file);
                    reader.onload = () => resolve(reader.result);
                });
                promises.push(filePromise);
            }

            Promise.all(promises).then(fileContents => {

                let i = 0;
                let mapsWasLoaded = '';
                for (let a = 0; a < this.state.currentNumberOfMap.length; a++) {
                    for (let b = 0; b < fileInput.files.length; b++) {
                        if (this.state.currentNumberOfMap[a].name === fileInput.files[b].name) {
                            i++;
                            mapsWasLoaded += `${fileInput.files[b].name}`;
                        }
                    }
                }
                if (i !== 0) {
                    alert(`These file was loaded and won't be load again : ${mapsWasLoaded}`);
                }

                for (i; i < fileContents.length; i++) {
                    if (document.getElementsByTagName("svg").length === 0) {
                        let div = document.createElement("div");
                        div.setAttribute("id", "list-svg");
                        div.innerHTML = fileContents[i].trim();
                        document.getElementsByClassName('App')[0].appendChild(div);
                        div.firstChild.setAttributeNS(null, "id", `svg-${i}`);
                        let node_pathline = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "g"
                        );
                        node_pathline.setAttributeNS(null, "id", `node-pathline-${this.state.currentNumberOfMap.length + i}`);
                        let nodes = document.getElementById("nodes");
                        nodes.setAttribute("id", `nodes-${this.state.currentNumberOfMap.length + i}`);
                        nodes.parentElement.appendChild(node_pathline);
                        let node_pathline_clone = node_pathline.cloneNode(true);
                        let nodes_clone = nodes.cloneNode(true);
                        nodes.replaceWith(node_pathline_clone);
                        node_pathline.replaceWith(nodes_clone);
                        this.addClickEventForCircle(this.state.currentNumberOfMap.length + i);
                    }
                    else {
                        let div = document.createElement("div");
                        div.innerHTML = fileContents[i].trim();
                        let listSVG = document.getElementsByTagName("svg");
                        let oldId = listSVG[listSVG.length - 1].getAttributeNS(null,"id");
                        let check = /\d+/;
                        let newId = parseInt(oldId.match(check));
                        console.log(oldId,newId);
                        div.firstChild.setAttributeNS(null,"id",`svg-${newId + 1}`);
                        document.getElementById("list-svg").appendChild(div.firstChild);
                        let node_pathline = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "g"
                        );
                        node_pathline.setAttributeNS(null, "id", `node-pathline-${newId + 1}`);
                        let nodes = document.getElementById("nodes");
                        nodes.setAttribute("id", `nodes-${newId + 1}`);
                        nodes.parentElement.appendChild(node_pathline);
                        let node_pathline_clone = node_pathline.cloneNode(true);
                        let nodes_clone = nodes.cloneNode(true);
                        nodes.replaceWith(node_pathline_clone);
                        node_pathline.replaceWith(nodes_clone);
                        this.addClickEventForCircle(newId + 1);
                    }
                    
                }
                // thêm radio button
                for (let k = 0; k < fileInput.files.length; k++) {
                    let check = 0;
                    for (let y = 0; y < this.state.currentNumberOfMap.length; y++) {
                        if (fileInput.files[k].name !== this.state.currentNumberOfMap[y].name) {
                            check++;
                        }
                    }
                    if (check === this.state.currentNumberOfMap.length) {
                        
                        if(document.getElementsByClassName("menuOfMap").length === 0 )
                        {
                            let divMenuOfMap = document.createElement("div");
                            divMenuOfMap.setAttribute("class","menuOfMap");
                            document.getElementsByClassName("App")[0].appendChild(divMenuOfMap);
                            let radio = document.createElement("input");
                            radio.setAttribute("type", "radio");
                            radio.setAttribute("name", "radioGroup");
                            radio.setAttribute("id",`radio-${k}`);
                            radio.addEventListener("change", () => { this.scrollMap(k) });
                            let nameOfMap = document.createElement("span");
                            nameOfMap.innerHTML= `${fileInput.files[k].name}    `;
                            let button = document.createElement("button");
                            button.addEventListener("click",()=>{this.DeleteMap(k,fileInput.files[k])});  
                            button.textContent = "Delete";
                            let space = document.createElement("span");
                            space.innerText = `     `;
                            divMenuOfMap.appendChild(radio);  
                            divMenuOfMap.appendChild(nameOfMap);
                            divMenuOfMap.appendChild(button);
                            divMenuOfMap.appendChild(space);
                            this.setState({ currentNumberOfMap: [...this.state.currentNumberOfMap, fileInput.files[k]] });
                        }
                        else{
                            let list_menu = document.getElementsByClassName("menuOfMap");
                            let lastMenu = list_menu[list_menu.length- 1];
                            let oldMenuInputId = lastMenu.firstChild.getAttributeNS(null,"id");
                            let checkCondition = /\d+/;
                            let newMenuInputId = parseInt(oldMenuInputId.match(checkCondition)) + 1;

                            let divMenuOfMap = document.createElement("div");
                            divMenuOfMap.setAttribute("class","menuOfMap");
                            document.getElementsByClassName("App")[0].appendChild(divMenuOfMap);
                            let radio = document.createElement("input");
                            radio.setAttribute("type", "radio");
                            radio.setAttribute("name", "radioGroup");
                            radio.setAttribute("id",`radio-${newMenuInputId}`);
                            radio.addEventListener("change", () => { this.scrollMap(newMenuInputId) });
                            let nameOfMap = document.createElement("span");
                            nameOfMap.innerHTML= `${fileInput.files[k].name}    `;
                            let button = document.createElement("button");
                            button.addEventListener("click",()=>{this.DeleteMap(newMenuInputId,fileInput.files[k])});  
                            button.textContent = "Delete";
                            let space = document.createElement("span");
                            space.innerText = `     `;
                            divMenuOfMap.appendChild(radio);  
                            divMenuOfMap.appendChild(nameOfMap);
                            divMenuOfMap.appendChild(button);
                            divMenuOfMap.appendChild(space);
                            this.setState({ currentNumberOfMap: [...this.state.currentNumberOfMap, fileInput.files[k]] });
                        }
                    }
                }
            });
        });
        console.log(this.state.currentNumberOfMap);
    };
    DeleteMap = (k,file)=>{
        console.log(this.state.currentNumberOfMap);
        let deleteFile ;
        document.getElementById("list-svg").removeChild(document.getElementById(`svg-${k}`));
        let radioElement = document.getElementById(`radio-${k}`);
        document.getElementsByClassName("App")[0].removeChild(radioElement.parentElement);
        if(document.getElementsByTagName("svg").length === 0)
        {
            let list_svg = document.getElementById("list-svg");
            list_svg.parentElement.removeChild(list_svg);
        }
        console.log(file.name);
        for(let i = 0;i<this.state.currentNumberOfMap.length;i++){
            if(file.name === this.state.currentNumberOfMap[i].name)
            {
                deleteFile = i;
                break;
            }
        }
        var cloneState = [...this.state.currentNumberOfMap];
        cloneState.splice(deleteFile,1);
        this.setState({currentNumberOfMap:cloneState});
        console.log(this.state.currentNumberOfMap);
    }
    scrollMap = (k) => {
        let svg = document.getElementById(`svg-${k}`);
        svg.scrollIntoView();
    }
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
            <div>
                <div className="App">
                    <div id="menu">
                        <button onClick={this.handleFileSelect}>Load map</button>
                        <button onClick={this.handleSaveGraphs}>Save graphs</button>
                        <div>
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
                        <div>
                            <input
                                type="radio"
                                id="draw"
                                onChange={() => {
                                    if (!this.state.isDrawFromGraphs) {
                                        this.drawEdgeFromGraphs();
                                        this.setState({ graphs: this.state.loadedGraphs });
                                    }
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
                            {
                                this.state.feature === 'find' ? (
                                    <div>
                                        <input type="text" id="first-vertex" />
                                        <span> </span>
                                        <input type="text" id="second-vertex" />
                                    </div>) : null
                            }
                        </div>
                    </div>
                </div>
                <div id="relationship-table">
                    {
                        this.state.feature === 'draw' ? (<RelationshipTable graphs={this.state.loadedGraphs} />) : null
                    }
                </div>
            </div>
        );
    }
}

export default App;
