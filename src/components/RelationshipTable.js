import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';
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
            removed: []
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
    handleCreateNeighbor = (node, newNeighbor) => {

    }
    handleSave = () => {
        const serializeData = (data) => {
            let graphs = {};
            const array = [];
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
                graphs = {...graphs,...item}
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
        const changeProperty = (object, property) => {
            return <div
                style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const { data } = this.state;
                    if (object[`${property}`] !== e.target.innerHTML) {
                        object[`${property}`] = e.target.innerHTML;
                        this.setState({ data });
                    }
                }}
                dangerouslySetInnerHTML={{
                    __html: object[`${property}`]
                }}
            />
        }
        const columns = [{
            Header: 'Node',
            Cell: props => {
                const { node } = props.original;
                return <div
                    dangerouslySetInnerHTML={{
                        __html: node.name
                    }}
                />
            }
        }, {
            Header: 'Type',
            accessor: 'node.type',
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
            }
        }, {
            id: 'neighbors',
            Header: 'Neighbors',
            accessor: d => d.neighbors.map(neighbor => neighbor.name),
            Cell: props => {
                const { neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return changeProperty(neighbor, 'name')
                })
            }
        }, {
            Header: props => <span>Type</span>,
            // accessor: 'neighbors.type',
            Cell: props => {
                const { neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return changeProperty(neighbor, 'type')
                })
            },
            width: 150,
        },
        {
            id: 'cost',
            Header: 'Cost',
            // accessor: d => 58,
            width: 100,
            Cell: props => {
                const { neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <div
                        style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
                        contentEditable={false}
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{
                            __html: neighbor.cost
                        }}
                    />
                })
            }
        },
        {
            Header: 'Action',
            Cell: props => {
                const { node, neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <div>
                        <button style={styles} onClick={() => this.handleRemoveNeighbor(node, neighbor)}>Remove</button>
                    </div>
                })
            },
            width: 150
        }
        ]
        return <div>
            <div style={{
                textAlign: 'right',
            }}>
                <button style={styles} >Add</button>
                <button style={styles} onClick={() => this.handleSave()} >Save</button>
            </div>
            <ReactTable
                data={this.state.data}
                columns={columns}
                defaultPageSize={10}
                showPagination={true}
                className="-striped -highlight"
            />
        </div>

    }
}
export default RelationshipTable