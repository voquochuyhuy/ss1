import React from "react";
import RelationshipTable from "./components/RelationshipTable/RelationshipTable";
import "./App.css";
import _ from "lodash";
import Menu from "./components/menu";
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
            loadedGraphs: {},
            edgeVertex1: null,
            edgeVertex2: null,
            feature: "",
            route: null,
            currentNumberOfMap: [],
            svgId_FirstClick: "",
        };
        this.addClickEventForCircle = this.addClickEventForCircle.bind(this);
    }
    /********************VẼ CẠNH ******************** */
    OnDrawingEgde = () => {
        this.setState({ feature: "draw", vertex1: "", vertex2: "" });
        const pathNodes = document.getElementsByTagName("circle");
        for (let i = 0; i < pathNodes.length; i++) {
            if (pathNodes[i].id.includes("PATH")) {
                pathNodes[i].setAttributeNS(null, "fill", "rgb(101, 95, 84)");
                pathNodes[i].setAttributeNS(null, "stroke", "rgb(230, 231, 232)");
            }
        }
        if (document.getElementsByClassName("animation-path").length !== 0) {
            let noAnimation_Path = document.getElementsByClassName("noAnimation-path");
            for (let i = 0; i < noAnimation_Path.length; i++) {
                noAnimation_Path[i].parentElement.removeChild(noAnimation_Path[i]);
            }
            let animated_Path = document.getElementsByClassName("animation-path");
            for (let i = 0; i < animated_Path.length; i++) {
                animated_Path[i].parentElement.removeChild(animated_Path[i]);
            }
            let first_vertex = document.getElementById(this.state.vertex1);
            first_vertex.removeAttribute("class");
            let final_vertex = document.getElementById(this.state.vertex2);
            final_vertex.removeAttribute("class");
            let pin_logo = document.getElementById("pin-logo");
            pin_logo.parentElement.removeChild(pin_logo);
        }
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
            console.log(edgeEl);//bị null khi nhấn nút remove từ bảng
            console.log(edgeId);
            edgeEl.parentElement.removeChild(edgeEl);
        }
        removeVertexFromGraphs(vertex1Id, vertex2Id);
    };

    /********************CHỌN CHỨC NĂNG TÌM ĐƯỜNG ******************** */
    OnWayFinding = () => {
        this.setState({ feature: "find", vertex1: "", vertex2: "" });
        for (let i = 0; i < this.state.currentNumberOfMap.length; i++) {
            let floorId = this.state.currentNumberOfMap[i].name.substring(0, 2);
            let groupPathNode = document.getElementById(`node-pathline-${floorId}`);
            let clone = groupPathNode.cloneNode(false);
            groupPathNode.replaceWith(clone);
            let pathNodes = document.getElementsByTagName("circle");
            for (let y = 0; y < pathNodes.length; y++) {
                if (pathNodes[y].id.startsWith(`${floorId}_PATH`)) {
                    pathNodes[y].setAttributeNS(null, "fill", "transparent");
                    pathNodes[y].setAttributeNS(null, "stroke", "transparent");
                }
            }
        }
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

    drawEdgeFromGraphs = () => {
        const loadedGraphs = this.state.graphs;
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
            //hard code 0 nên k thể vẽ trên nhiều bảng
            // dựa vào item.node và item.neight mà vẽ
            if (item.node.substring(0, 2) === item.neighbor.substring(0, 2))
                this.drawEdge(item.node, item.neighbor, item.node.substring(0, 2));
        })
    }

    /**********************START wayFiding***********************/
    LoadGraphsFile = async () => {
        const el = await document.createElement("div");
        el.innerHTML = "<input type='file'/>";
        const fileInput = await el.firstChild;
        await fileInput.click();
        await fileInput.addEventListener("change", e => {
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

        /**vẽ path step by step khi user lên tầng trên hoặc xuống tầng dưới */
        const drawStepPath = (X, Y, floor_id) => {
            let SVGnodes = document.getElementById(floor_id).lastChild;
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
        /**
         * @param X array chứa tọa độ x
         * @param Y array chứa tọa độ y
         * @param floor_id chứa 2 kí tự đầu để xác định vẽ trên SVG nào
         * @description vẽ path khi user đi đến địa điểm trong tầng đó 
         * */
        const drawPath = (X, Y, floor_id) => {
            // console.log('X : ', X);
            // console.log('Y : ', Y);

            let SVGnodes = document.getElementById(`nodes-${floor_id}`);
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

            var animatedPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            animatedPath.setAttributeNS(null, "d", `${M}`);
            animatedPath.setAttributeNS(null, "class", "animation-path");
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
                drawStepPath(X, Y, floor_id);
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
            drawPath(X, Y, floor_id);
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
                        let floorId = fileInput.files[i].name.substring(0, 2);
                        div.firstChild.setAttributeNS(null, "id", `svg-${floorId}`);
                        let node_pathline = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "g"
                        );
                        node_pathline.setAttributeNS(null, "id", `node-pathline-${floorId}`);
                        let nodes = document.getElementById("nodes");
                        nodes.setAttribute("id", `nodes-${floorId}`);
                        nodes.parentElement.appendChild(node_pathline);
                        let node_pathline_clone = node_pathline.cloneNode(true);
                        let nodes_clone = nodes.cloneNode(true);
                        nodes.replaceWith(node_pathline_clone);
                        node_pathline.replaceWith(nodes_clone);
                        this.addClickEventForCircle(floorId);
                    }
                    else {
                        let div = document.createElement("div");
                        div.innerHTML = fileContents[i].trim();
                        let floorId = fileInput.files[i].name.substring(0, 2);
                        div.firstChild.setAttributeNS(null, "id", `svg-${floorId}`);
                        document.getElementById("list-svg").appendChild(div.firstChild);
                        let node_pathline = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "g"
                        );
                        node_pathline.setAttributeNS(null, "id", `node-pathline-${floorId}`);
                        let nodes = document.getElementById("nodes");
                        nodes.setAttribute("id", `nodes-${floorId}`);
                        nodes.parentElement.appendChild(node_pathline);
                        let node_pathline_clone = node_pathline.cloneNode(true);
                        let nodes_clone = nodes.cloneNode(true);
                        nodes.replaceWith(node_pathline_clone);
                        node_pathline.replaceWith(nodes_clone);
                        this.addClickEventForCircle(floorId);
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
                        let floorId = fileInput.files[k].name.substring(0, 2);
                        let divMenuOfMap = document.createElement("div");
                        divMenuOfMap.setAttribute("class", "menuOfMap");
                        document.getElementsByClassName("App")[0].appendChild(divMenuOfMap);
                        let radio = document.createElement("input");
                        radio.setAttribute("type", "radio");
                        radio.setAttribute("name", "radioGroup");
                        radio.setAttribute("id", `radio-${floorId}`);
                        radio.addEventListener("change", () => { this.scrollMap(floorId) });
                        let nameOfMap = document.createElement("span");
                        nameOfMap.innerHTML = `${fileInput.files[k].name}    `;
                        let button = document.createElement("button");
                        button.addEventListener("click", () => { this.DeleteMap(floorId, fileInput.files[k]) });
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
        let svg = document.getElementById(`nodes-${floorId}`);
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
        // console.log(this.state.currentNumberOfMap);
        let deleteFile;
        document.getElementById("list-svg").removeChild(document.getElementById(`svg-${floorId}`));
        let radioElement = document.getElementById(`radio-${floorId}`);
        document.getElementsByClassName("App")[0].removeChild(radioElement.parentElement);
        if (document.getElementsByTagName("svg").length === 0) {
            let list_svg = document.getElementById("list-svg");
            list_svg.parentElement.removeChild(list_svg);
        }
        // console.log(file.name);
        for (let i = 0; i < this.state.currentNumberOfMap.length; i++) {
            if (file.name === this.state.currentNumberOfMap[i].name) {
                deleteFile = i;
                break;
            }
        }
        var cloneState = [...this.state.currentNumberOfMap];
        cloneState.splice(deleteFile, 1);
        this.setState({ currentNumberOfMap: cloneState });
        // console.log(this.state.currentNumberOfMap);
    }
    scrollMap = (floorId) => {
        let svg = document.getElementById(`svg-${floorId}`);
        svg.scrollIntoView();
    }

    /********************START LOAD FILE ******************** */
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
                    <Menu
                        handleFileSelect={this.handleFileSelect}
                        handleSaveGraphs={this.handleSaveGraphs}
                        LoadGraphsFile={this.LoadGraphsFile}
                        drawEdgeFromGraphs={this.drawEdgeFromGraphs}
                        OnDrawingEgde={this.OnDrawingEgde}
                        OnDeleteEgde={this.OnDeleteEgde}
                        OnWayFinding={this.OnWayFinding}
                    />
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
