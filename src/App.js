import React from "react";
import RelationshipTable from "./components/RelationshipTable/RelationshipTable";
import "./App.css";
import _ from "lodash";
import SaveGraphButton from "./components/Menu/SaveGraphButton";
import LoadGraphButton from "./components/Menu/LoadGraphButton";
import WayFindRadioButton from "./components/Menu/WayFindRadioButton";
import DrawRadioButton from "./components/Menu/DrawRadioButton";
import DeleteRadioButton from "./components/Menu/DeleteRadioButton";
import { If, addVertexToGraphs, removeVertexFromGraphs, showNodes, hideEdges, showEdges, removeShortestPathEl } from "./Utils";
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
            svgId_FirstClick: "",
            svgContents: [],
            currentNumberOfMap: 0,
            listURLpathOfSVG: [],
            isLoading: false
        };
    }
    /******************** CHỌN VẼ CẠNH - THÊM ĐỈNH CỦA CẠNH VỪA VẼ VÀO GRAPHS ******************** */
    changeVertex = (vertex1, vertex2) => {
        this.setState({ vertex1: vertex1, vertex2: vertex2 });
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
        }
    }
    setStateAsync(state) {
        return new Promise((resolve) => {
          this.setState(state, resolve)
        });
    }
    getSvgContent = async (arrUrlSvg, startIndex) => {
        this.setState({ startIndex: startIndex });
        for (let i = 0; i < arrUrlSvg.length; i++)
             this.setStateAsync({ listURLpathOfSVG: [...this.state.listURLpathOfSVG, arrUrlSvg[i]] });
        this.setState({ isLoading: true });
    }
    AdjustNumberOfMap =async (index) => {
        
        var cloneState = [...this.state.listURLpathOfSVG];
        cloneState.splice(index, 1);
        await this.setStateAsync({isLoading: false});
        await this.setStateAsync({ listURLpathOfSVG: cloneState  });
        
    }
    render() {
        const {graphs,feature,vertex1,vertex2,listURLpathOfSVG,isLoading,route,startIndex} = this.state
        return (
            <div>
                <div className="App">
                    <LoadSvgButton onLoadFinish={this.getSvgContent} />
                    <LoadGraphButton onFileGraphsChange={this.onFileGraphsChange}></LoadGraphButton>
                    <SaveGraphButton data={graphs}></SaveGraphButton>
                    <DrawRadioButton
                        OnDrawingEgde={this.OnDrawingEgde}
                        DeleteEgde={this.DeleteEgde}
                        addVertexToGraphs={this.addVertexToGraphs}
                        graphs={graphs}
                        feature={feature}
                        vertex1={vertex1}
                        vertex2={vertex2}
                    />
                    <DeleteRadioButton OnDeleteEgde={this.OnDeleteEgde} />
                    <WayFindRadioButton feature={feature}  OnWayFinding={this.OnWayFinding} />
                    <ListSVG
                        route={route}
                        feature={feature}
                        listURLpathOfSVG={listURLpathOfSVG}
                        startIndex={startIndex}
                        AdjustNumberOfMap={this.AdjustNumberOfMap}
                        addVertexToGraphs={this.addVertexToGraphs}
                        DeleteEgde={this.DeleteEgde}
                        changeVertex={this.changeVertex}
                        isLoading={isLoading}
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