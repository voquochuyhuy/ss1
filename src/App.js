import React from "react";
import RelationshipTable from "./components/RelationshipTable/RelationshipTable";
import "./App.css";
import _ from "lodash";
import SaveGraphButton from "./components/Menu/SaveGraphButton";
import LoadGraphButton from "./components/Menu/LoadGraphButton";
import WayFindRadioButton from "./components/Menu/WayFindRadioButton";
import DrawRadioButton from "./components/Menu/DrawRadioButton";
import DeleteRadioButton from "./components/Menu/DeleteRadioButton";
import { If, addVertexToGraphs, removeVertexFromGraphs, hideNodes, showNodes, hideEdges, showEdges, removeShortestPathEl } from "./utils";
import LoadSvgButton from "./components/Menu/LoadSvgButton.jsx";
import ListSVG from "./components/ListSVG";
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
            currentNumberOfMap: 0,
            listURLpathOfSVG: [],
        };
    }
    /******************** CHỌN VẼ CẠNH - THÊM ĐỈNH CỦA CẠNH VỪA VẼ VÀO GRAPHS ******************** */
    changeVertex = (vertex1, vertex2) => {
        this.setState({vertex1: vertex1, vertex2: vertex2});
    }
    OnDrawingEgde = () => {
        showNodes();
        showEdges();
        if (document.getElementsByClassName("animation-path").length !== 0) {
            const { vertex1, vertex2 } = this.state;
            removeShortestPathEl(vertex1, vertex2);
        };
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
        showEdges();
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
        showNodes(true);
        hideEdges();
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
    SetlistIdForMap = (floorId) => {
        this.setState({ listIdOfMap: [...this.state.listIdOfMap, floorId] });
    }
    getSvgContent = async (arrUrlSvg, startIndex) => {
        console.log(startIndex, "lastNumberOfMap-getSvgContent")
        this.setState({ startIndex: startIndex });
        for (let i = 0; i < arrUrlSvg.length; i++)
            await this.setState({ listURLpathOfSVG: [...this.state.listURLpathOfSVG, arrUrlSvg[i]] });
    }
    AdjustNumberOfMap = (index) => {
        console.log(index);
        var cloneState = [...this.state.listURLpathOfSVG];
        cloneState.splice(index, 1);
        this.setState({ listURLpathOfSVG: cloneState });
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
                        vertex1={this.state.vertex1}
                        vertex2={this.state.vertex2}
                    />
                    <DeleteRadioButton OnDeleteEgde={this.OnDeleteEgde} />
                    <WayFindRadioButton feature={this.state.feature} listIdOfMap={this.state.listIdOfMap} OnWayFinding={this.OnWayFinding} />
                    <ListSVG
                        route={this.state.route}
                        feature={this.state.feature}
                        listURLpathOfSVG={this.state.listURLpathOfSVG}
                        listIdOfMap={this.SetlistIdForMap}
                        startIndex={this.state.startIndex}
                        AdjustNumberOfMap={this.AdjustNumberOfMap}
                        addVertexToGraphs={this.addVertexToGraphs}
                        DeleteEgde={this.DeleteEgde}
                        changeVertex={this.changeVertex}
                    />

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