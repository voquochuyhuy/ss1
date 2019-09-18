import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';
import equals from 'deep-equal';
import { handleSaveRelationship, serializeGraphsToData, deserializeDataToGraphs } from "../../Utils";
import COLUMNS from './Columns';
import 'react-table/react-table.css';

function ButtonFeature({ handleAddRelationship, handleSaveRelationship }) {
    const styles = {
        backgroundColor: '#dadada',
        borderRadius: '2px'
    }
    return (
        <div style={{ textAlign: 'right' }}>
            <button style={styles} onClick={() => handleAddRelationship()}>Add</button>
            <button style={styles} onClick={() => handleSaveRelationship()} >Save</button>
        </div>
    )
}
class RelationshipTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], /**example data = [
                {
                    node:{
                        id: 'L4_21B_NODE',
                        type:'store',
                        name:'L4-21B'
                    },
                    neighbors:[
                        {
                            id: 'L4_20_NODE',
                            type:'store',
                            name:'L4-20'
                        },
                        {
                            ...
                        }
                    ]
                },
                {...}
            ] 
            */
            removed: [],
            count: 0,
            graphs: {}
        };
    }
    componentDidMount() {
        const { graphs } = this.props;
        const graphArr = serializeGraphsToData(graphs);
        this.setState({ graphs: graphs, data: graphArr });
    }
    static getDerivedStateFromProps(nextProps, currentState) {
        // console.log("getDerivedStateFromProps : nextProps ", nextProps);
        // console.log("getDerivedStateFromProps : currentState ", currentState);

        if (!equals(nextProps.graphs, currentState.graphs)) {
            const { graphs } = nextProps;
            const graphsArray = serializeGraphsToData(graphs);
            return {
                data: graphsArray,
                graphs: graphs
            }
        }
        return null;
    }
    handleRemoveNeighbor = (node, neighbor) => {
        const { data } = this.state;
        data.forEach(item => {
            //tìm node để xóa neighbor & tìm neighbor để xóa node 
            if (item.node === node || item.node.id === neighbor.id) {
                const nodeRemoved = _.remove(item.neighbors, nb => nb === neighbor || nb.id === node.id);
                // console.log('removed node and neighbor: ', nodeRemoved);
                if (_.isEmpty(item.neighbors)) {
                    const itemRemoved = _.remove(data, nodeNoNeighbor => nodeNoNeighbor.node.id === item.node.id);
                    // console.log('item removed: ', itemRemoved);
                }
                if (!nodeRemoved[0]) {
                    alert("Not found neighbor of node has id : " + node.id);
                    return;
                }
                this.props.removeRelationship({ node: node.id, neighbor: nodeRemoved[0].id });
            }
        });
    };
    handleAddRelationship = () => {
        alert("This feature will be available in next version");
    }
    onChangeData = (data) => {
        const graphs = deserializeDataToGraphs(data);
        this.setState({ data, graphs });
        this.props.onChangeGraphs(graphs);
        // this.props.onChangeData();
    }
    getColumns = () => {
        const columns = [
            {
                ...COLUMNS.Node
            },
            {
                ...COLUMNS.Type
            },
            {
                ...COLUMNS.Neighbors(this.state.data, this.onChangeData)
            },
            {
                ...COLUMNS.NeighborsType(this.state.data, this.onChangeData)
            },
            {
                ...COLUMNS.Cost(this.state.data, this.onChangeData)
            },
            {
                ...COLUMNS.Action(this.handleRemoveNeighbor)
            }
        ];
        return columns;
    }
    render() {
        return <div>
            <ButtonFeature
                handleSaveRelationship={() => handleSaveRelationship(this.state.data, "data")}
                handleAddRelationship={() => this.handleAddRelationship()}
            />
            <ReactTable
                filterable
                defaultFilterMethod={(filter, row) =>
                    String(row[filter.id]) === filter.value}
                data={this.state.data}
                columns={this.getColumns()}
                defaultPageSize={5}
                showPagination={true}
                className="-striped -highlight"
            />
        </div>
    }
}
export default RelationshipTable