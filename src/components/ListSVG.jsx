import React, { Component } from 'react'
import ReactSVG from 'react-svg';
export default class ListSVG extends Component {
    constructor(props){
        super(props);

    }
    render() {
        if(this.props.listURLpathOfSVG === undefined)
        return null
        return (
            <>
                {this.props.listURLpathOfSVG.map((value,index)=>(
                   <ReactSVG
                    src={value}>

                    </ReactSVG>
                ))
                }
            </>
        )
    }
}
