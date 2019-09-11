import React from "react";
import RelationshipTable from "./components/RelationshipTable/RelationshipTable";
import "./App.css";
import _ from "lodash";
import SaveGraphButton from "./components/Menu/SaveGraphButton";
import LoadGraphButton from "./components/Menu/LoadGraphButton";
import WayFindRadioButton from "./components/Menu/WayFindRadioButton";
import DrawRadioButton from "./components/Menu/DrawRadioButton";
import DeleteRadioButton from "./components/Menu/DeleteRadioButton";
import { If, drawEdge, addVertexToGraphs, drawShortestPath, removeVertexFromGraphs } from "./utils";
import LoadSvgButton from "./components/Menu/LoadSvgButton.jsx";
import ListSVG from "./components/ListSVG";
import MenuOfMap from "./components/Menu/MenuOfMap";
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
            graphs: {},
            feature: "",
            route: null,
            listIdOfMap: [],
            svgId_FirstClick: "",
            svgContents: [],
            currentNumberOfMap: [],
        };
    }
    /******************** CHỌN VẼ CẠNH - THÊM ĐỈNH CỦA CẠNH VỪA VẼ VÀO GRAPHS ******************** */
    OnDrawingEgde = () => {
        this.setState({ feature: "draw", vertex1: "", vertex2: "" });
    };
    onChangeGraphs = (graphs) => {
        this.setState({ graphs: graphs });
    }
    addVertexToGraphs = (vertex1, vertex2) => {
        const edgeExisted = addVertexToGraphs(vertex1, vertex2, this.state.graphs, this.onChangeGraphs);
        return edgeExisted;
    }
    /******************** CHỌN XÓA CẠNH - XÓA ĐỈNH CỦA CẠNH VỪA XÓA TRONG GRAPHS ******************** */
    OnDeleteEgde = () => {
        this.setState({ feature: "delete" });
    };
    DeleteEgde = (edge, vertex1Id, vertex2Id) => {
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
        removeVertexFromGraphs(vertex1Id, vertex2Id, this.state.graphs, this.onChangeGraphs);
    };
    /********************CHỌN CHỨC NĂNG TÌM ĐƯỜNG ******************** */
    OnWayFinding = () => {
        this.setState({ feature: "find", vertex1: "", vertex2: "" });
    };

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
    /*lưu ID của những map đã load */
    ListIdOfMap = (floorId) => {
        this.setState({ listIdOfMap: [...this.state.listIdOfMap, floorId] });
    }
    getSvgContent = (svgContents) => {
        for (let i = 0; i < svgContents.length; i++) {
            let div = document.createElement("div");
            div.innerHTML = svgContents[i].trim();
            // get floor id
            let floorId = div.firstChild.getElementById("background").parentElement.attributes.id.value;

            // check svg existed on page
            // and Add new svg element into dom
            const isSvgExisted = document.getElementsByTagName("svg").length !== 0
            if (isSvgExisted) {
                div.firstChild.setAttributeNS(null, "id", `svg-${floorId}`);
                document.getElementById("list-svg").appendChild(div.firstChild);
            }
            else {
                div.setAttribute("id", "list-svg");
                div.firstChild.setAttributeNS(null, "id", `svg-${floorId}`);
                document.getElementsByClassName('App')[0].appendChild(div);
            }
            let node_pathline = document.createElementNS("http://www.w3.org/2000/svg", "g");
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
            nameOfMap.innerHTML = `${floorId}`;
            let button = document.createElement("button");
            button.addEventListener("click", () => { this.DeleteMap(floorId) });
            button.textContent = "Delete";
            let space = document.createElement("span");
            space.innerText = `     `;
            divMenuOfMap.appendChild(radio);
            divMenuOfMap.appendChild(nameOfMap);
            divMenuOfMap.appendChild(button);
            divMenuOfMap.appendChild(space);

            this.setState({ currentNumberOfMap: [...this.state.currentNumberOfMap, floorId] });
            this.ListIdOfMap(floorId);
        }
        // this.setState({ listURLpathOfSVG: [...this.state.listURLpathOfSVG, svgContents] });
        // console.log(svgContents);
    }
    // /*ADD SỰ KIỆN CHO CÁC NODE */
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
    /*XỬ LÍ SỰ KIÊN KHI CLICK TRÊN SVG, DRAW EGDE- DRAW SHORTEST PATH */
    handleMouseClick(e, floorId) {
        const clickTarget = e.target;
        if (this.state.feature === "draw") {
            if (clickTarget.nodeName === "circle") {
                if (!this.isDrawingEdge) {
                    this.setState({ edgeVertex1: clickTarget });
                    this.isDrawingEdge = true;
                } else if (clickTarget !== this.state.edgeVertex1) {
                    this.setState({ edgeVertex2: clickTarget });
                    drawEdge(this.state.edgeVertex1, this.state.edgeVertex2, floorId, this.DeleteEgde, this.addVertexToGraphs);
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
                drawShortestPath(this.state.vertex1, this.state.vertex2, this.state.route);
                this.isFindingPath = false;
            }
        }
    }


    /*MENU CHO MAP KHI LOAD MAP LÊN */
    DeleteMap = (floorId) => {
        let deleteFile;
        document.getElementById("list-svg").removeChild(document.getElementById(`svg-${floorId}`));
        let radioElement = document.getElementById(`radio-${floorId}`);
        document.getElementsByClassName("App")[0].removeChild(radioElement.parentElement);
        if (document.getElementsByTagName("svg").length === 0) {
            let list_svg = document.getElementById("list-svg");
            list_svg.parentElement.removeChild(list_svg);
        }
        for (let i = 0; i < this.state.currentNumberOfMap.length; i++) {
            if (floorId === this.state.currentNumberOfMap[i]) {
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
    render() {
        return (
            <div>
                <div className="App">
                    <LoadSvgButton onLoadFinish={this.getSvgContent} />
                    <LoadGraphButton onFileGraphsChange={this.onFileGraphsChange}></LoadGraphButton>
                    <SaveGraphButton data={this.state.graphs}></SaveGraphButton>
                    <DrawRadioButton
                        OnDrawingEgde={this.OnDrawingEgde}
                        DeleteEgde={this.DeleteEgde}
                        addVertexToGraphs={this.addVertexToGraphs}
                        graphs={this.state.graphs}
                        feature={this.state.feature}
                    />
                    <DeleteRadioButton OnDeleteEgde={this.OnDeleteEgde} />
                    <WayFindRadioButton feature={this.state.feature} listIdOfMap={this.state.listIdOfMap} OnWayFinding={this.OnWayFinding} />
                </div>
                <div id="relationship-table">
                    <If
                        condition={this.state.feature === 'draw'}
                        component={RelationshipTable}
                        props={{
                            removeRelationship: (removedObj) => this.onRemoveFromChild(removedObj),
                            graphs: this.state.graphs
                        }}
                    />
                </div>
            </div>
        );
    }
}
export default App;