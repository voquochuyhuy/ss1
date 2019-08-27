import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
class RelationshipTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            data: [],
        };
        // this.renderEditable = this.renderEditable.bind(this);
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
            const doc = document.getElementById(node);
            const docTitle = document.getElementById('storetitle');
            const storeTitle = docTitle.children;
            const nodeId = doc.id.split('_NODE')[0];
            console.log('nodeids : ', nodeId);
            for (let i = 0; i < storeTitle.length; i++) {
                if (storeTitle[i].id.includes('_CODE') && storeTitle[i].id.includes(nodeId)) {
                    return storeTitle[i].firstChild.textContent;
                }
            }
        }
        const transformNeighbors = (object) => {
            return Object.keys(object).map(node => {
                const type = getType(node);
                const neighbor = {
                    id: node,
                    name: type === 'path' ? node : getName(node),
                    type: type,
                    cost: object[node]
                }
                return neighbor;
            })
        }
        const graphs = {
            "L4_PATH_70_NODE": {
                "youarehere_NODE": 27,
                "L4_PATH_69_NODE": 22,
                "L4_PATH_44_NODE": 18
            },
            "L4_PATH_69_NODE": {
                "L4_PATH_70_NODE": 22,
                "L4_PATH_68_NODE": 17,
                "L4_PATH_48_NODE": 21
            },
            "L4_PATH_68_NODE": {
                "L4_PATH_69_NODE": 17,
                "L4_PATH_48_NODE": 21,
                "L4_PATH_66_NODE": 29
            },
            "L4_PATH_48_NODE": {
                "L4_PATH_68_NODE": 21,
                "L4_PATH_69_NODE": 21,
                "L4_21B_NODE": 16,
                "L4_PATH_66_NODE": 42
            },
            "L4_21B_NODE": {
                "L4_PATH_48_NODE": 16
            },
            "L4_23_NODE": {
                "L4_PATH_52_NODE": 19,
                "L4_PATH_59_NODE": 22
            },
        }
        const graphsArray = Object.keys(graphs).map(node => {
            const type = getType(node);
            const relation = {
                node: {
                    id: node,
                    type: type,
                    name: type === 'path' ? node : getName(node)
                },
                neighbors: transformNeighbors(graphs[node])
            }
            return relation;
        });
        console.log('graphs', graphsArray);
        // return graphsArray;
        this.setState({ data: graphsArray });
    }
    render() {
        const styles = {
            backgroundColor: '#dadada',
            borderRadius: '2px'
        }
        const nameItems = [];
        const typeItems = [];
        const nodes = this.state.data
        for (let i = 0; i < nodes.length; i++) {
            if (!nameItems.includes(nodes[i].node.name))
                nameItems.push(<option key={i} value={nodes[i].node.id}>
                    {nodes[i].node.name}
                </option>);
            if (!typeItems.includes(nodes[i].node.type))
                typeItems.push(<option key={i} value={nodes[i].type}>
                    {nodes[i].node.type}
                </option>)
        }
        const changeProperty = (object, property) => {
            return <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const { data } = this.state;
                    if (object[`${property}`] !== e.target.innerHTML) {
                        object[`${property}`] = e.target.innerHTML;
                        this.setState({ data });
                    }
                    this.setState({ data });
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
                    // style={{ backgroundColor: "#fafafa" }}
                    // contentEditable={false}
                    // suppressContentEditableWarning
                    dangerouslySetInnerHTML={{
                        __html: node.name
                    }}
                />
            }
        }, {
            Header: 'Type',
            accessor: 'node.type',
            width: 200,
            Cell: props => {
                const { node } = props.original;
                return <div
                    style={{ backgroundColor: "#fafafa", justifyContent: "center" }}
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
            width: 200,
        },
        {
            id: 'cost',
            Header: 'Cost',
            accessor: d => 58,
            width: 100,
            Cell: props => {
                const { neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <div
                        style={{ backgroundColor: "#fafafa" }}
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
                const { neighbors } = props.original;
                return neighbors.map(neighbor => {
                    return <div>
                        <button style={styles} onClick={() => alert('Removed neighbor ' + neighbor.name)}>Remove</button>
                    </div>
                })
            },
            width: 100
        }
        ]
        return <div>
            <div style={{
                textAlign: 'right',
            }}>
                <button style={styles} >Add</button>
            </div>
            <ReactTable
                data={nodes}
                columns={columns}
                defaultPageSize={10}
                showPagination={true}
            />
        </div>

    }
}
export default RelationshipTable