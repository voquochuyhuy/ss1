import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';
import matchSorter from 'match-sorter';
import 'react-table/react-table.css'
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
            count: 0
        };
    }
    componentDidMount() {
        this.computeItems();
    }
    computeItems() {
        const getType = (node) => {
            const doc = document.getElementById(node);
            const parentElement = doc.parentElement;
            let type = '';
            if (parentElement.id.includes('store'))
                type = 'store';
            else if (parentElement.id.includes('facility'))
                type = 'facility';
            else type = 'path';
            return type;
        }
        const getName = (node) => {
            const doc = document.getElementById(node); //node = L4_29_NODE
            const docTitle = document.getElementById('storetitle');
            const storeTitle = docTitle.children;
            const nodeId = doc.id.split('_NODE')[0];//nodeis = L4_29
            if (nodeId.includes('YAH') || nodeId === 'youarehere')
                return nodeId;
            for (let i = 0; i < storeTitle.length; i++) {
                if (storeTitle[i].id.includes('_CODE') && storeTitle[i].id.includes(nodeId.split('_')[1])) { //includes '29'
                    return storeTitle[i].firstChild.textContent;
                }
            }
        }
        const transformNeighbors = (object) => {
            return Object.keys(object).map(node => {
                const type = getType(node);
                const neighbor = {
                    id: node,
                    name: type === 'path' || type === 'facility' ? node : getName(node),
                    type: type,
                    cost: object[node]
                }
                return neighbor;
            })
        }
        const { graphs } = this.props;
        const graphsArray = Object.keys(graphs).map(node => {
            const type = getType(node);
            const relation = {
                node: {
                    id: node,
                    type: type,
                    name: type === 'path' || type === 'facility' ? node : getName(node)
                },
                neighbors: transformNeighbors(graphs[node])
            }
            return relation;
        });
        this.setState({ data: graphsArray });
    }
    handleRemoveNeighbor = (node, neighbor) => {
        const { data, removed } = this.state;
        for (let i = 0; i < data.length; i++) {
            if (data[i].node === node && data[i].neighbors.includes(neighbor)) {
                const nodeRemoved = _.remove(data[i].neighbors, neighbor);
                removed.push({ node: node, neighbors: [...nodeRemoved] })
                this.setState({ removed })
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
                // array.push(item);
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
        const changeProperty = (node, neighbor, property) => {
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
            return (
                <div>
                    {property === 'id' ? (<button style={{ float: 'right' }} onClick={() => handleButtonAdd()} >+</button>) : null}
                    <div
                        style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                            const { data } = this.state;
                            if (neighbor[`${property}`] !== e.target.innerHTML) {
                                if (property === 'cost')
                                    neighbor[`${property}`] = Number(e.target.innerHTML);
                                else neighbor[`${property}`] = e.target.innerHTML;
                                this.setState({ data });
                            }
                        }}
                        dangerouslySetInnerHTML={{
                            __html: neighbor[`${property}`]
                        }}
                    />
                </div>
            )
        }
        const columns = [{
            Header: 'Node',
            id: 'node-root',
            Cell: props => {
                const { node } = props.original;
                return <div
                    dangerouslySetInnerHTML={{
                        __html: node.name
                    }}
                />
            },
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["node-root"] }),
            filterAll: true
        }, {
            Header: 'Type',
            accessor: 'node.type',
            id: 'node-type',
            width: 150,
            Cell: props => {
                const { node } = props.original;
                return <div
                    style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
                    contentEditable={false}
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{
                        __html: node.type
                    }}
                />
            },
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["node-type"] }),
            filterAll: true
        }, {
            id: 'neighbors',
            Header: 'Neighbors',
            accessor: d => d.neighbors.map(neighbor => neighbor.id),
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return changeProperty(node, neighbor, 'id')
                })
            },
            filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["neighbors"] }),
            filterAll: true
        }, {
            Header: props => <span>Type</span>,
            // accessor: 'neighbors.type',
            id: 'nb-type',
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return changeProperty(node, neighbor, 'type')
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
            // accessor: d => 58,
            width: 100,
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return changeProperty(node, neighbor, 'cost')
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
        }
        ]
        return <div>
            <div style={{
                textAlign: 'right',
            }}>
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