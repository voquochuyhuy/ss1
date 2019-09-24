import React from 'react'
import { If, drawShortestPath, removeShortestPathEl } from "../../Utils";
import { useState } from 'react';


const PathStep = ({ step, index }) => {
    // console.log("step:", step.join("=>").toString());

    return (
        <p id="node-pathline-list" style={{ whiteSpace: "nowrap", overflow: "auto", }}>
            {`Step ${index} : ${step[0].join("=>").toString()}`}
        </p>
    )
}
const VertextureComponent = (props) => {

    const _drawShorestPath = () => {
        let shortestPath = document.getElementsByClassName("noAnimation-path");
        let isExist = shortestPath.length;
        if(isExist === 1)
        {
            if(props.vertex1 !== "" && props.vertex2 !== "")
            {
                removeShortestPathEl(props.vertex1,props.vertex2);
                props.resetVertex();
            }  
            else if(oldVertex1 !== "" && oldVertex2 !== "")
                removeShortestPathEl(oldVertex1,oldVertex2);
        }
       
        let vertexInput1 = document.getElementById("first-vertex").value;
        let vertexInput2 = document.getElementById("second-vertex").value;
        if(vertexInput1.length === 0 && vertexInput2.length === 0)
        {
           alert(`Can not find shortest path`);
           return;
        }
        let pathArr = drawShortestPath(vertexInput1, vertexInput2, props.route);       
        if (pathArr === undefined || null)
            return;
        var result = Object.keys(pathArr).map(function (key) {
            return [pathArr[key]];
        });
        let pElement = document.getElementById("node-pathline-list")
        pElement.innerText = result.toString();
       
        setOldVertex1(vertexInput1);
        setOldVertex2(vertexInput2);
    }
    const [vertex1, setInputVertex1] = useState('');
    const [vertex2, setInputVertex2] = useState('');
    const [oldVertex1,setOldVertex1] = useState('');
    const [oldVertex2,setOldVertex2] = useState('');

    if (props.pathArr === undefined || null)
        return;
    var result = Object.keys(props.pathArr).map(function (key) {
        return [props.pathArr[key]];
    });

    return (
        <div>
            <input type="text" id="first-vertex" onChange={e => {

                setInputVertex1(e.target.value);

            }} />
            <span>  </span>
            <input type="text" id="second-vertex" onChange={e => {

                setInputVertex2(e.target.value);

            }} />
            <span>  </span>
            <button onClick={_drawShorestPath}>Find</button> <br />
            
            {
                // props !== {} ? <p id="node-pathline-list" style={{ whiteSpace: "nowrap", overflow: "auto", }}>{result.join("=>")}</p> : null
                props.pathArr !== {} ? result.map((step, index) => {
                    return  <><p>List of path</p>
                    <PathStep key={index} step={step} index={index + 1} /></>
                    
                }) : null
            }
        </div>)
}
class WayFindRadioButton extends React.Component {
    constructor(props) {
        super(props);
        this.OnWayFinding = this.OnWayFinding.bind(this)
    }
    OnWayFinding = () => {
        console.log("OnWayFinding");
        this.props.OnWayFinding();

    };
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.pathArr !== nextProps.pathArr)
            return true;
        return this.props.feature !== nextProps.feature  
   }
   render (){
    const condition = this.props.feature === 'find';
    const { pathArr, route, changeVertex, vertex2, vertex1,resetVertex } = this.props;
    return (
        <>
            <input type="radio" id="way-Finding" onChange={this.OnWayFinding} name="chooseFeature" />Way Finding <br />
            <If condition={condition} component={VertextureComponent} props={{ pathArr: pathArr, route: route, changeVertex: changeVertex, vertex1: vertex1, vertex2: vertex2,resetVertex:resetVertex }} />

        </>
    )
   }
   

    
}
export default WayFindRadioButton;
