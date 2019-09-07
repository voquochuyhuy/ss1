import React from "react";
import RelationshipTable from "./components/RelationshipTable/RelationshipTable";
import "./App.css";
import _ from "lodash";
import SaveGraph from "./components/SaveGraph";
import LoadGraph from "./components/LoadGraph";
import WayFindRadioButton from "./components/WayFindRadioButton";
import { from } from "array-flatten";
import DrawRadioButton from "./components/DrawRadioButton";
import DeleteRadioButton from "./components/DeleteRadioButton";
const Graph = require("node-dijkstra");
class App extends React.Component {
    isDrawingEdge = false;
    isFindingPath = false;
    vertices = null;
    constructor(props) {
        super(props);
        this.state = {
            vertex1: "",
            vertex2: "",
            edges: [],
            graphs: {},
            edgeVertex1: null,
            edgeVertex2: null,
            feature: "",
            route: null,
            currentNumberOfMap: [],
            listIDOfMap: [],
            svgId_FirstClick: "",
        };
    }
    /********************VẼ CẠNH ******************** */
    OnDrawingEgde = () => {
        this.setState({ feature: "draw", vertex1: "", vertex2: "" });
    };
    drawEdge = (vertex1, vertex2, floorId) => {
        // if (this.state.feature === "draw") {
        //check vertex1 and vertex2 là 1 HMTLElement hay 1 string
        //Nếu là string (id của 1 Element) thì vẽ dựa vào graphs có sẵn, k thì tạo graphs mới
        const node_path = document.getElementById(`node-pathline-${floorId}`);
        const draw = (v1, v2) => {
            const x1 = v1.getAttributeNS(null, "cx");
            const y1 = v1.getAttributeNS(null, "cy");
            const x2 = v2.getAttributeNS(null, "cx");
            const y2 = v2.getAttributeNS(null, "cy");
            let edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
            edge.setAttributeNS(null, "id", `${v1.id}:${v2.id}`);
            edge.setAttributeNS(null, "x1", x1);
            edge.setAttributeNS(null, "y1", y1);
            edge.setAttributeNS(null, "x2", x2);
            edge.setAttributeNS(null, "y2", y2);
            edge.setAttributeNS(null, "stroke", "red");
            edge.setAttributeNS(null, "stroke-width", "3");
            edge.setAttributeNS(null, "fill", "none");
            edge.setAttributeNS(null, "stroke-dasharray", "5,5");
            edge.setAttributeNS(null, "style", "cursor: pointer;");
            edge.addEventListener("click", () => {
                this.DeleteEgde(edge, v1.id, v2.id);
            });
            node_path.appendChild(edge);
        }
        if (typeof vertex1 !== "string") {
            const edgeExisted = this.addVertexToGraphs(vertex1, vertex2);
            edgeExisted ? alert('edge already existed') : draw(vertex1, vertex2);
        }
        else {
            const vtx1 = document.getElementById(vertex1);
            const vtx2 = document.getElementById(vertex2);
            if (vtx1 && vtx2)
                draw(vtx1, vtx2);
        }
        // }
    }

    /********************XÓA CẠNH ******************** */
    OnDeleteEgde = () => {
        this.setState({ feature: "delete" });
    };
    DeleteEgde = (edge, vertex1Id, vertex2Id) => {
        const removeVertexFromGraphs = (v1, v2) => {
            const { graphs } = this.state;
            if (_.has(graphs, [v1, v2]) && _.has(graphs, [v2, v1])) {
                delete graphs[v1][v2];
                delete graphs[v2][v1];
                this.setState({ graphs });
            }
        }
        if (this.state.feature === "delete" && typeof edge !== "string") {
            edge.parentElement.removeChild(edge);
        }
        else if (typeof edge === "string") {
            const edgeId = edge;
            let edgeEl = document.getElementById(edgeId);
            if (!edgeEl) {
                const tryEdgeId = edgeId.split(':').reverse().join(':');
                edgeEl = document.getElementById(tryEdgeId);
            }
            edgeEl.parentElement.removeChild(edgeEl);
        }
        removeVertexFromGraphs(vertex1Id, vertex2Id);
    };

    /********************CHỌN CHỨC NĂNG TÌM ĐƯỜNG ******************** */
    OnWayFinding = () => {
        this.setState({ feature: "find", vertex1: "", vertex2: "" });
    };

    /**
     * @description add two vertex to graphs
     * @return edgeExisted : if exist edge between them, return false, otherwise, null
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

    /**********************START wayFiding***********************/
    onFileGraphsChange = e => {
        const reader = new FileReader();
        reader.onload = async e => {
            const graphsStr = await e.target.result;
            const graphsJson = JSON.parse(graphsStr);
            this.setState({
                graphs: graphsJson,
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
        if (!pathArr) {
            alert("Not found shortest path, check model graphs");
            return;
        }
        const step = _.groupBy(pathArr, (vertexId) => {
            return vertexId.substring(0, 2);
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


        const draw = (X, Y, SVGnodes) => {
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
            NoAnimatedPath.setAttributeNS(null, "class", "noAnimation-path");
            SVGnodes.appendChild(NoAnimatedPath);

            var animatedPath = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );
            animatedPath.setAttributeNS(null, "d", `${M}`);
            animatedPath.setAttributeNS(null, "class", "animation-path");//
            animatedPath.setAttributeNS(null, "stroke-width", "3");
            animatedPath.setAttributeNS(null, "fill", "transparent");
            SVGnodes.appendChild(animatedPath);
            SVGnodes.appendChild(pinLogo);
        }

        console.log(step, _.size(step));
        if (_.size(step) !== 1) {
            _.forEach(step, (verticesGroup) => {
                // console.log('verticesGroup : ', verticesGroup);
                let floor_id = verticesGroup[0].substring(0, 2);
                let X = [];
                let Y = [];
                for (let i = 0; i < verticesGroup.length; i++) {
                    const vtx = verticesGroup[i];

                    X.push(document.getElementById(vtx).attributes.cx.value);
                    Y.push(document.getElementById(vtx).attributes.cy.value);
                };
                let SVGnodes = document.getElementById(floor_id).lastChild;
                draw(X, Y, SVGnodes);
            });
        }
        else {
            const verticesGroup = _.reduce(step, (firstGroup) => firstGroup);
            let floor_id = verticesGroup[0].substring(0, 2);
            let X = [];
            let Y = [];
            for (let i = 0; i < verticesGroup.length; i++) {
                const vtx = verticesGroup[i];
                X.push(document.getElementById(vtx).attributes.cx.value);
                Y.push(document.getElementById(vtx).attributes.cy.value);

            }
            console.log(floor_id);
            let SVGnodes = document.getElementById(`node-${floor_id}`);
            console.log(SVGnodes);
            draw(X, Y, SVGnodes);
        }
    }
    /********************END wayFiding*************************/


    /********************START LOAD FILE ******************** */
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
                let check = 0;
                let mapsWasLoaded = '';
                for (let a = 0; a < this.state.currentNumberOfMap.length; a++) {

                    for (let b = 0; b < fileInput.files.length; b++) {
                        if (this.state.currentNumberOfMap[a].name === fileInput.files[b].name) {
                            i++;
                            check++;
                            mapsWasLoaded += `${fileInput.files[b].name}`;
                        }
                    }
                }
                if (i !== 0) {
                    alert(`These file was loaded and won't be load again : ${mapsWasLoaded}`);
                }
                for (i; i < fileContents.length; i++) {
                    let div = document.createElement("div");
                    div.innerHTML = fileContents[i].trim();
                    let floorId = div.firstChild.getElementById("background").parentElement.attributes.id.value;
                    if (document.getElementsByTagName("svg").length === 0) {
                        div.setAttribute("id", "list-svg");
                        div.firstChild.setAttributeNS(null, "id", `svg-${floorId}`);
                        document.getElementsByClassName('App')[0].appendChild(div);
                    }
                    else {
                        div.firstChild.setAttributeNS(null, "id", `svg-${floorId}`);
                        document.getElementById("list-svg").appendChild(div.firstChild);
                    }
                    let node_pathline = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "g"
                    );
                    node_pathline.setAttributeNS(null, "id", `node-pathline-${floorId}`);
                    let nodes = document.getElementById("nodes");
                    if (!nodes) {
                        alert("Map don't have any elements node");
                        return;
                    }
                    nodes.setAttribute("id", `node-${floorId}`);
                    nodes.parentElement.appendChild(node_pathline);
                    let node_pathline_clone = node_pathline.cloneNode(true);
                    let nodes_clone = nodes.cloneNode(true);
                    nodes.replaceWith(node_pathline_clone);
                    node_pathline.replaceWith(nodes_clone);
                    this.addClickEventForCircle(floorId);

                    let divMenuOfMap = document.createElement("div");
                    divMenuOfMap.setAttribute("class", "menuOfMap");
                    document.getElementsByClassName("App")[0].appendChild(divMenuOfMap);
                    let radio = document.createElement("input");
                    radio.setAttribute("type", "radio");
                    radio.setAttribute("name", "radioGroup");
                    radio.setAttribute("id", `radio-${floorId}`);
                    radio.addEventListener("change", () => { this.scrollMap(floorId) });
                    let nameOfMap = document.createElement("span");
                    nameOfMap.innerHTML = `${fileInput.files[i - check].name}    `;
                    let button = document.createElement("button");
                    let indexOfFile = i - check;
                    button.addEventListener("click", () => { this.DeleteMap(floorId, fileInput.files[indexOfFile]) });
                    button.textContent = "Delete";
                    let space = document.createElement("span");
                    space.innerText = `     `;
                    divMenuOfMap.appendChild(radio);
                    divMenuOfMap.appendChild(nameOfMap);
                    divMenuOfMap.appendChild(button);
                    divMenuOfMap.appendChild(space);
                    this.setState({ currentNumberOfMap: [...this.state.currentNumberOfMap, fileInput.files[indexOfFile]] });
                    this.setState({ listIDOfMap: [...this.state.listIDOfMap, floorId] });
                }
                // thêm radio button

            });
        });
    };
    handleMouseClick(e, floorId) {
        const clickTarget = e.target;
        if (this.state.feature === "draw") {
            if (clickTarget.nodeName === "circle") {
                if (!this.isDrawingEdge) {
                    this.setState({ edgeVertex1: clickTarget });
                    this.isDrawingEdge = true;
                } else if (clickTarget !== this.state.edgeVertex1) {
                    this.setState({ edgeVertex2: clickTarget });
                    this.drawEdge(this.state.edgeVertex1, this.state.edgeVertex2, floorId);
                    this.setState({ edgeVertex1: null, edgeVertex2: null });
                    this.isDrawingEdge = false;
                }
            }
        } else if (this.state.feature === "find") {
            if (document.getElementsByClassName("animation-path").length !== 0) {
                let noAnimation_Path = document.getElementsByClassName("noAnimation-path");
                for (let i = 0; i < noAnimation_Path.length; i++) {
                    noAnimation_Path[i].parentElement.removeChild(noAnimation_Path[i]);
                }
                let animated_Path = document.getElementsByClassName("animation-path");
                for (let i = 0; i < animated_Path.length; i++) {
                    // chưa xóa đường dẫn khi vẽ đường ngắn nhất trên nhiều map
                    // do dính chung parentElement
                    animated_Path[i].parentElement.removeChild(animated_Path[i]);
                }
                let first_vertex = document.getElementById(this.state.vertex1);
                first_vertex.removeAttribute("class");
                let final_vertex = document.getElementById(this.state.vertex2);
                final_vertex.removeAttribute("class");
                if (document.getElementById("pin-logo") !== null) {
                    let pin_logo = document.getElementById("pin-logo");
                    pin_logo.parentElement.removeChild(pin_logo);
                }
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
                this.drawShortestPath(this.state.vertex1, this.state.vertex2, floorId);
                this.isFindingPath = false;
            }
        }
    }
    addClickEventForCircle = (floorId) => {
        let svg = document.getElementById(`node-${floorId}`);
        const vertices = svg.getElementsByTagName("circle");
        this.vertices = vertices;
        for (let i = 0; i < vertices.length; i++) {
            vertices[i].addEventListener("click", e => {
                this.handleMouseClick(e, floorId);
            });
            vertices[i].setAttribute("style", "cursor: pointer;")
        }
    };
    /********************END LOAD FILE ******************** */


    /********************XÓA MAP ĐÃ LOAD - SCROLL ĐẾN MAP ĐÓ ******************** */
    DeleteMap = (floorId, file) => {
        let deleteFile;
        document.getElementById("list-svg").removeChild(document.getElementById(`svg-${floorId}`));
        let radioElement = document.getElementById(`radio-${floorId}`);
        document.getElementsByClassName("App")[0].removeChild(radioElement.parentElement);
        if (document.getElementsByTagName("svg").length === 0) {
            let list_svg = document.getElementById("list-svg");
            list_svg.parentElement.removeChild(list_svg);
        }
        for (let i = 0; i < this.state.currentNumberOfMap.length; i++) {
            if (file.name === this.state.currentNumberOfMap[i].name) {
                deleteFile = i;
                break;
            }
        }
        var cloneState = [...this.state.currentNumberOfMap];
        cloneState.splice(deleteFile, 1);
        this.setState({ currentNumberOfMap: cloneState });
    }
    scrollMap = (floorId) => {
        let svg = document.getElementById(`svg-${floorId}`);
        svg.scrollIntoView();
    }
    /********************START LOAD FILE ******************** */ 

    /********************REMOVE ONCLICK IN RELATIONSHIP TABLE******************** */
    onRemoveFromChild = (removedObj) => {
        const { graphs } = this.state;
        const { node, neighbor } = removedObj;
        if ((_.has(graphs, [node, neighbor]) && _.has(graphs, [neighbor, node]))) {
            this.DeleteEgde(`${node}:${neighbor}`, node, neighbor);
            delete graphs[node][neighbor];
            delete graphs[neighbor][node];
            if (_.isEmpty(graphs[node])) {
                delete graphs[node];
            }
            if (_.isEmpty(graphs[neighbor])) {
                delete graphs[neighbor];
            }
            this.setState({ graphs });
        }
    }
    render() {
        return (
            <div>
                <div className="App">            
                    <button onClick={this.handleFileSelect}>Load map</button>
                    <LoadGraph onFileGraphsChange={this.onFileGraphsChange}></LoadGraph>
                    <SaveGraph data={this.state.graphs}></SaveGraph>
                    
                    <DrawRadioButton OnDrawingEgde={this.OnDrawingEgde} graphs={this.state.graphs} drawEdge={this.drawEdge}/>  
                    <DeleteRadioButton OnDeleteEgde={this.OnDeleteEgde}/>
                    <WayFindRadioButton feature={this.state.feature} listIDOfMap={this.state.listIDOfMap} OnWayFinding={this.OnWayFinding}/>
                                      
                </div>
                <div id="relationship-table">
                    {
                        this.state.feature === 'draw' ? (<RelationshipTable removeRelationship={(removedObj) => this.onRemoveFromChild(removedObj)} graphs={this.state.graphs} />) : null
                    }
                </div>
            </div>
        );
    }
}
export default App;
