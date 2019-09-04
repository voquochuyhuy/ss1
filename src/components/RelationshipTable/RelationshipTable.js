import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';
import matchSorter from 'match-sorter';
import equal from 'deep-equal';
import { getNameOfNode, getTypeOfNode, transformNeighborsOfNode } from './Utils'
import 'react-table/react-table.css';
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
        this.transformGraphs(graphs);
    }
    componentDidUpdate(prevProps) {
        if (!equal(prevProps.graphs, this.props.graphs)) {
            console.log('2 graphs khac nhau, re-render');
            this.transformGraphs(this.props.graphs);
        }
    }
    transformGraphs(graphs) {
        const graphsArray = Object.keys(graphs).map(node => {
            const type = getTypeOfNode(node);
            const relation = {
                node: {
                    id: node,
                    type: type,
                    name: type === 'path' || type === 'facility' ? node : getNameOfNode(node)
                },
                neighbors: transformNeighborsOfNode(graphs[node])
            }
            return relation;
        });
        this.setState({ data: graphsArray });
    }
    handleRemoveNeighbor = (node, neighbor) => {
        const { data } = this.state;
        for (let i = 0; i < data.length; i++) {
            if (data[i].node === node && data[i].neighbors.includes(neighbor)) {
                const nodeRemoved = _.remove(data[i].neighbors, neighbor);
                console.log(node.id,nodeRemoved[0].id);
                this.props.removeRelationship({ node: node.id, neighbor: nodeRemoved[0].id })
            }
        }
        this.setState({ data });
    }
    handleSave = () => {
        const serializeData = (data) => {
            let graphs = {};
            data.forEach(items => {
                const arrayNeighbor = items.neighbors.map(neighbor => {
                    return [[neighbor.id], neighbor.cost]
                });
                const nb = arrayNeighbor.reduce((prev, curr) => { prev[curr[0]] = curr[1]; return prev; }, {})
                const item = {
                    [items.node.id]: {
                        ...nb
                    }
                };
                graphs = { ...graphs, ...item }
            });
            console.log('result save : ', graphs);
            return graphs;
        }
        const a = document.createElement("a");
        document.body.appendChild(a);
        const { data } = this.state;
        const serializedData = serializeData(data)
        const fileName = "graphs.json";
        const json = JSON.stringify(serializedData);
        const blob = new Blob([json], { type: "octet/stream" });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
    render() {
        const styles = {
            backgroundColor: '#dadada',
            borderRadius: '2px'
        }
        const CellEditable = (props) => {
            const { node, neighbor, propertyToEdit } = props;
            const handleButtonAdd = () => {
                let counter = this.state.count++;
                const { data } = this.state;
                data.map(item => {
                    if (item.node === node) {
                        const newNeighbor = {
                            id: 'new-neighbor-' + counter,
                            name: 'new Neighbor ' + counter,
                            type: 'path',
                            cost: 1
                        }
                        item.neighbors.push(newNeighbor);;
                    }
                })
                this.setState({ data });
            }
            const CellEdit = (props) => {
                const { neighbor, propertyToEdit } = props;
                return (<div
                    style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                        const { data } = this.state;
                        if (neighbor[`${propertyToEdit}`] !== e.target.innerHTML) {
                            if (propertyToEdit === 'cost')
                                neighbor[`${propertyToEdit}`] = Number(e.target.innerHTML);
                            else neighbor[`${propertyToEdit}`] = e.target.innerHTML;
                            this.setState({ data });
                        }
                    }}
                    dangerouslySetInnerHTML={{
                        __html: neighbor[`${propertyToEdit}`]
                    }}
                />)
            }
            return (
                <div>
                    {propertyToEdit === 'id' ? (<button style={{ float: 'right' }} onClick={() => handleButtonAdd()} >+</button>) : null}
                    <CellEdit neighbor={neighbor} propertyToEdit={propertyToEdit} />
                </div>
            )
        }
        const Cell = (props) => {
            const { node, property } = props;
            return (
                <div
                    style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
                    dangerouslySetInnerHTML={{
                        __html: node[property]
                    }}
                />
            )
        }
        const columns = [{
            Header: 'Node',
            id: 'node-root',
            Cell: props => <Cell node={props.original.node} property='name' />,
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["node-root"] }),
            filterAll: true
        }, {
            Header: 'Type',
            accessor: 'node.type',
            id: 'node-type',
            width: 150,
            Cell: props => <Cell node={props.original.node} property='type' />,
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["node-type"] }),
            filterAll: true
        }, {
            id: 'neighbors',
            Header: 'Neighbors',
            accessor: d => d.neighbors.map(neighbor => neighbor.id),
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <CellEditable node={node} neighbor={neighbor} propertyToEdit='id' />
                })
            },
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["neighbors"] }),
            filterAll: true
        }, {
            Header: props => <span>Type</span>,
            id: 'nb-type',
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <CellEditable node={node} neighbor={neighbor} propertyToEdit='type' />;
                })
            },
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["nb-type"] }),
            filterAll: true,
            width: 150,
        },
        {
            id: 'cost',
            Header: 'Cost',
            width: 100,
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <CellEditable node={node} neighbor={neighbor} propertyToEdit='cost' />
                })
            },
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["cost"] }),
            filterAll: true,
        },
        {
            Header: 'Action',
            id: 'action',
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <div>
                        <button style={styles} onClick={() => this.handleRemoveNeighbor(node, neighbor)}>Remove</button>
                    </div>
                })
            },
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["action"] }),
            filterAll: true,
            width: 150
        }];
        return <div>
            <div style={{ textAlign: 'right' }}>
                <button style={styles} onClick={() => alert("This feature will be available in next version")}>Add</button>
                <button style={styles} onClick={() => this.handleSave()} >Save</button>
            </div>
            <ReactTable
                filterable
                defaultFilterMethod={(filter, row) =>
                    String(row[filter.id]) === filter.value}
                data={this.state.data}
                columns={columns}
                defaultPageSize={5}
                showPagination={true}
                className="-striped -highlight"
            />
        </div>
    }
}
export default RelationshipTable