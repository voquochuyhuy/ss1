import React from 'react'
import { If, drawShortestPath, removeShortestPathEl } from "../../Utils";
import { useState } from 'react';
const VertextureComponent = (props) => {
    
    const _drawShorestPath = ()=>{
        console.log(oldVertex1,oldVertex2);
        console.log(props.vertex1,props.vertex1);
        if(oldVertex1 !== "" && oldVertex2 !== "")
            removeShortestPathEl(oldVertex1,oldVertex2)
        else if(props.vertex1!== "" && props.vertex2 !== "")   
            removeShortestPathEl(props.vertex1,props.vertex2)    

        let pathArr = drawShortestPath(vertex1,vertex2,props.route);
        if(pathArr === undefined || null)
            return ;
        var result = Object.keys(pathArr).map(function(key) {
            return [pathArr[key]];
          });
        let pElement = document.getElementById("node-pathline-list")
        pElement.innerText = result.toString();
        setOldVertex1(vertex1);
        setOldVertex2(vertex2);
        props.changeVertex(vertex1,vertex2);
    }
    const [vertex1, setInputVertex1] = useState(''); 
    const [vertex2, setInputVertex2] = useState(''); 
    const [oldVertex1, setOldVertex1] = useState(''); 
    const [oldVertex2, setOldVertex2] = useState(''); 
   
    if(props.pathArr === undefined || null)
        return;
    var result = Object.keys(props.pathArr).map(function(key) {
        return [ props.pathArr[key]];
      });
    return (
        <div>
            <input type="text" id="first-vertex" onChange={e => {
                setInputVertex1(e.target.value);
    
            }}/>
            <span>  </span>
            <input type="text" id="second-vertex" onChange={e => {
                setInputVertex2(e.target.value);
                
            }}/>
            <span>  </span>
            <button onClick={_drawShorestPath}>Find</button> <br/>
            <p>List of path</p>
            {
               props !== {} ? <p id ="node-pathline-list">{result.toString()}</p> : null
            }
        </div>)
}
export default class WayFindRadioButton extends React.Component {
    constructor(props){
        super(props);
        this.state= {
            idVertex1:"",
            idVertex2 :""
        }
    }
     OnWayFinding = () => {
        this.props.OnWayFinding();

    };
    render()
    {
        const condition = this.props.feature === 'find';
        const {pathArr,route,changeVertex,vertex2,vertex1} = this.props;
        return (
            <>
                <input type="radio" id="way-Finding" onChange={() => { this.OnWayFinding() }} name="chooseFeature" />Way Finding <br />
                <If condition={condition} component={VertextureComponent} props={{pathArr:pathArr,route:route,changeVertex:changeVertex,vertex1:vertex1,vertex2:vertex2}}/>
                
            </>
        )
    }
    
}
