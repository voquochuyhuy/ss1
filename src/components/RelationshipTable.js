import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
class RelationshipTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            data: [],
        }
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
            // console.log('nodeids : ', nodeId);
            for (let i = 0; i < storeTitle.length; i++) {
                if (storeTitle[i].id.includes(nodeId)) {
                    return storeTitle[i].firstChild.textContent;
                }
            }
        }
        const transformNeighbors = (object) => {
            return Object.keys(object).map(node => {
                const type = getType(node);
                const neighbor = {
                    id: node,
                    name: type === 'path' ? 'path' : getName(node),
                    type: type
                }
                return neighbor;
            })
        }
        const graphs = {
            "youarehere_NODE": {
                "L4_PATH_70_NODE": 27,
                "L4_PATH_43_NODE": 27,
                "L4_PATH_10_NODE": 71,
                "L4_PATH_45_NODE": 53,
                "L4_24_NODE": 66
            },
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
        }
        const graphsArray = Object.keys(graphs).map(node => {
            const type = getType(node);
            const relation = {
                node: {
                    id: node,
                    type: type,
                    name: type === 'path' ? 'path' : getName(node)
                },
                neighbors: transformNeighbors(graphs[node])
            }
            return relation;
        });
        // console.log('graphs', graphsArray);
        return graphsArray;
    }
    render() {
        const styles = {
            backgroundColor: '#dadada',
            borderRadius: '2px'
        }
        const nameItems = [];
        const typeItems = [];
        // const { nodes } = this.props;
        const nodes = this.computeItems()
        for (let i = 0; i < nodes.length; i++) {
            nameItems.push(<option key={i} value={nodes[i].node.id}>
                {nodes[i].node.name}
            </option>);
            typeItems.push(<option key={i} value={nodes[i].type}>
                {nodes[i].node.type}
            </option>)
        }
        const data = this.computeItems();
        const columns = [{
            Header: 'Node',
            Cell: row => (
                <div>
                    <select style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#dadada',
                        borderRadius: '3px',
                    }}>
                        {nameItems}
                    </select>
                </div>
            )
        }, {
            Header: 'Type',
            accessor: 'node.type',
            width: 200,
            Cell: props => (
                <div>
                    <select style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#dadada',
                        borderRadius: '3px',
                    }}>
                        {typeItems}
                    </select>
                </div>
            ) // Custom cell components!
        }, {
            id: 'neighbors', // Required because our accessor is not a string
            Header: 'Neighbors',
            accessor: d => d.neighbors.map(neighbor => neighbor.name),//d.friend.name // Custom value accessors!
            Cell: props => (
                <div>
                    <select style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#dadada',
                        borderRadius: '3px',
                    }}>
                        {nameItems}
                    </select>
                </div>
            )
        }, {
            Header: props => <span>Type</span>, // Custom header components!
            // accessor: 'friend.age'
            accessor: 'neighbors.type',
            Cell: props => (
                <div>
                    <select style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#dadada',
                        borderRadius: '3px',
                    }}>
                        {typeItems}
                    </select>
                </div>
            ),
            width: 200,
        },
        {
            id: 'cost',
            Header: 'Cost',
            accessor: d => 58,
            width: 100
        },
        {
            Header: 'Action',
            Cell: row => (
                <div>
                    <button style={styles} onClick={() => alert('Save')}>Save</button>
                    <button style={styles} onClick={() => alert('Delete')}>Delete</button>
                </div>
            ),
            width: 100
        }
        ]
        return <div>
            <ReactTable
                data={data}
                columns={columns}
                defaultPageSize={2}
                showPagination={false}
            />
            <div style={{
                textAlign: 'right',
            }}>
                <button style={styles} >Add</button>
            </div>
        </div>

    }
}
export default RelationshipTable