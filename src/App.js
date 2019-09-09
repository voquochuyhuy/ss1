import React from "react";
import RelationshipTable from "./components/RelationshipTable/RelationshipTable";
import "./App.css";
import _ from "lodash";
import SaveGraph from "./components/Menu/SaveGraph";
import LoadGraph from "./components/Menu/LoadGraph";
import WayFindRadioButton from "./components/Menu/WayFindRadioButton";
// import { from } from "array-flatten";
import DrawRadioButton from "./components/Menu/DrawRadioButton";
import DeleteRadioButton from "./components/Menu/DeleteRadioButton";
import { If } from "./Utils";
import LoadMap from "./components/Menu/LoadMap";
const Graph = require("node-dijkstra");
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vertex1: "",
            vertex2: "",
            graphs: {},
            feature: "",
            route: null,
            listIDOfMap: [],
            svgId_FirstClick: "",
        };
    }
    /******************** VẼ CẠNH - THÊM ĐỈNH CỦA CẠNH VỪA VẼ VÀO GRAPHS******************** */
    OnDrawingEgde = () => {
        this.setState({ feature: "draw", vertex1: "", vertex2: "" });
    };
    addVertexToGraphs=(vertex1, vertex2) =>{
        const  {graphs}  = this.state;
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
                this.setState({ graphs });//
            } else if (!graphs[idVertex2]) {
                console.log("ton tai v1 va ko ton tai v2");
                graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
                const graph = {
                    [idVertex2]: {
                        [idVertex1]: cost
                    }
                };
                this.setState({ graphs: { ...graphs, ...graph } });//
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
                this.setState({ graphs: { ...graphs, ...graph } });//
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
                this.setState({ graphs: { ...graphs, ...graph } });//
            }
        }
        return edgeExisted;
    }
    /********************XÓA CẠNH - XÓA ĐỈNH CỦA CẠNH VỪA XÓA TRONG GRAPHS ******************** */
    OnDeleteEgde = async () => {
        await this.setState({ feature: "delete" });
    };
    DeleteEgde = (edge, vertex1Id, vertex2Id) => {
        const removeVertexFromGraphs = (v1, v2) => {
            const  {graphs}  = this.state;
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
    findShortestPath(vertex1, vertex2 ,route) {
        //vertex1 is id of element's circle vertex1
        if (!route) return null;
        const path = route.path(vertex1, vertex2);
        return path;
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
    ListIdOfMap = (floorId)=>{
        this.setState({ listIDOfMap: [...this.state.listIDOfMap, floorId] });
    }
    render() {
        return (
            <div>
                <div className="App">
                    <LoadMap 
                        feature={this.state.feature} 
                        listIdOfMap={this.ListIdOfMap} 
                        DeleteEgde= {this.DeleteEgde}
                        addVertexToGraphs={this.addVertexToGraphs}
                        findShortestPath={this.findShortestPath}
                        route = {this.state.route} >
                    </LoadMap>
                    <LoadGraph onFileGraphsChange={this.onFileGraphsChange}></LoadGraph>
                    <SaveGraph data={this.state.graphs}></SaveGraph> 
                    <DrawRadioButton 
                        OnDrawingEgde={this.OnDrawingEgde} 
                        DeleteEgde= {this.DeleteEgde}
                        addVertexToGraphs={this.addVertexToGraphs}
                        graphs={this.state.graphs} 
                        feature={this.state.feature} 
                    />  
                    <DeleteRadioButton OnDeleteEgde={this.OnDeleteEgde}/>
                    <WayFindRadioButton feature={this.state.feature} listIDOfMap={this.state.listIDOfMap} OnWayFinding={this.OnWayFinding}/>                    
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
