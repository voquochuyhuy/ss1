import React, { Component } from 'react'
import ReactSVG from 'react-inlinesvg';
// import _ from 'lodash';
import { drawEdge, drawShortestPath, removeShortestPathEl } from "../Utils";
// import { isFulfilled } from 'q';
export default class ListSVG extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listIdOfMap: [],
            listURLpathOfSVG: [],
            vertex1: "",
            vertex2: "",
            numDeleted:0
        }
    }
    shouldComponentUpdate
    handleSVG = async (src, hasCache) => {
        
        let index = this.props.startIndex;
        let listsvg = document.getElementsByTagName("svg");
        
        let notFinishLoad = listsvg.length < this.props.listURLpathOfSVG.length;

        if (notFinishLoad === true) {
            return;
        }
        if(this.props.isLoading === false)
        { 
           
            for (let i = index ; i < this.state.listURLpathOfSVG.length; i++) {

                let floorId = listsvg[i].getElementById("background").parentElement.attributes.id.value;
                let nodes = listsvg[i].getElementById("node");
                if (nodes) {
                    listsvg[i].setAttribute("id", `svg-${floorId}`);
                    this.createNode_Pathline(listsvg[i],floorId);          
                    this.addClickEventForCircle(floorId);
                }
                
            }
            return;
        }
        for (let i = index - this.state.numDeleted; i < this.state.listURLpathOfSVG.length; i++) {
            let floorId = listsvg[i].getElementById("background").parentElement.attributes.id.value;
            listsvg[i].setAttribute("id", `svg-${floorId}`);
            
            this.createNode_Pathline(listsvg[i],floorId);
            
            this.addClickEventForCircle(floorId);

            this.addMenuForMap(floorId);

            await this.setStateAsync({ listIdOfMap: [...this.state.listIdOfMap, floorId] });
        }
    }
    addClickEventForCircle = (floorId) => {
        let svg = document.getElementById(`node-${floorId}`);
        const vertices = svg.getElementsByTagName("circle");
        const circlesYAH = document.querySelectorAll("circle[id*='YAH']");

        // this.vertices = vertices;
        for (let i = 0; i < vertices.length; i++) {
            vertices[i].addEventListener("click", e => {
                this.handleMouseClick(e, floorId);
            });
            vertices[i].setAttribute("style", "cursor: pointer;");
        }
        for (let i = 0; i < circlesYAH.length; i++) {
            if (circlesYAH[i].id) {
                circlesYAH[i].addEventListener("click", e => {
                    this.handleMouseClick(e, floorId);
                });
            }
            circlesYAH[i].setAttribute("style", "cursor: pointer;");
        }
    };
    addMenuForMap = (floorId)=>{
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
    }
    createNode_Pathline = (svgElement,floorId)=>{
       
        let node_pathline = document.createElementNS("http://www.w3.org/2000/svg", "g");
        node_pathline.setAttributeNS(null, "id", `node-pathline-${floorId}`);

        let nodes = svgElement.getElementById("node");
        // if (!nodes) {
        //     alert("No nodes found");
        //     return;
        // }
        nodes.setAttribute("id", `node-${floorId}`);
        nodes.parentElement.appendChild(node_pathline);
        let node_pathline_clone = node_pathline.cloneNode(true);
        let nodes_clone = nodes.cloneNode(true);
        nodes.replaceWith(node_pathline_clone);
        node_pathline.replaceWith(nodes_clone);
    }
    /*XỬ LÍ SỰ KIÊN KHI CLICK TRÊN SVG, DRAW EGDE- DRAW SHORTEST PATH */
    handleMouseClick(e, floorId) {
        const clickTarget = e.target;
        if (this.props.feature === "draw") {
            if (clickTarget.nodeName === "circle" || clickTarget.nodeName === "ellipse") {
                if (!this.isDrawingEdge) {
                    this.setState({ edgeVertex1: clickTarget });
                    this.isDrawingEdge = true;
                } else if (clickTarget !== this.state.edgeVertex1) {
                    this.setState({ edgeVertex2: clickTarget });
                    drawEdge(this.state.edgeVertex1, this.state.edgeVertex2, floorId, this.props.DeleteEgde, this.props.addVertexToGraphs);
                    this.setState({ edgeVertex1: null, edgeVertex2: null });
                    this.isDrawingEdge = false;
                }
            }
        } else if (this.props.feature === "find") {
            if (document.getElementsByClassName("animation-path").length !== 0) {
                removeShortestPathEl(this.state.vertex1, this.state.vertex2);
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
                // this.drawShortestPath(this.state.vertex1, this.state.vertex2, this.props.route);
                this.props.changeVertex(this.state.vertex1, this.state.vertex2);
                drawShortestPath(this.state.vertex1, this.state.vertex2, this.props.route)
                this.isFindingPath = false;
            }
        }
    }
    /*MENU CHO MAP KHI LOAD MAP LÊN */
    DeleteMap = (floorId) => {
        //remove HTMLElement
        // document.getElementById("list-svg").removeChild(document.getElementById(`svg-${floorId}`));
        let radioElement = document.getElementById(`radio-${floorId}`);
        document.getElementsByClassName("App")[0].removeChild(radioElement.parentElement);
        // if (document.getElementsByTagName("svg").length === 0) {
        //     let list_svg = document.getElementById("list-svg");
        //     list_svg.parentElement.removeChild(list_svg);
        // }
        //remove file
        let deleteFileIndex;
        const {  listIdOfMap } = this.state;
        // const tempArrayId = listIdOfMap;
        // const removed = _.remove(tempArrayId, id => id === floorId);
        // console.log('removed id : ', removed);
        // this.setState({ listIdOfMap: tempArrayId });

        for (let i = 0; i < listIdOfMap.length; i++) {
            if (listIdOfMap[i] === floorId) {
                deleteFileIndex = i;
                break;
            }
        }
        console.log(deleteFileIndex);
        var cloneState = [...listIdOfMap];
        cloneState.splice(deleteFileIndex, 1);
        this.setState({ listIdOfMap: cloneState });
        this.setState({numDeleted : this.state.numDeleted + 1})
        this.props.AdjustNumberOfMap(deleteFileIndex);

    }
    scrollMap = (floorId) => {
        let svg = document.getElementById(`svg-${floorId}`);
        svg.scrollIntoView();
    }
    componentWillReceiveProps(newProps) {
        this.setState({ listURLpathOfSVG: newProps.listURLpathOfSVG });
    }
    setStateAsync(state) {
        return new Promise((resolve) => {
          this.setState(state, resolve)
        });
    }
    render() {
        const { listURLpathOfSVG } = this.props;
        return (
            <div id="list-svg">
                {listURLpathOfSVG ? this.state.listURLpathOfSVG.map((value, i) => (
                    <ReactSVG
                        src={value}
                        onLoad={(src, hasCache) => this.handleSVG(src, hasCache)}
                        preProcessor={code => code}
                        cacheRequests={false}
                    />
                )) : null}
            </div>
        )
    }
}
