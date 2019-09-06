"use strict";
import React, { Component } from 'react'
import { If } from '../../Utils';
import { VertexFinding, MenuButton, MenuRadioButton } from './Utils';
export default class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feature: ""
        }
    }
    render() {
        return (
            <div id="menu">
                <MenuButton
                    handleFileSelect={this.props.handleFileSelect}
                    handleSaveGraphs={this.props.handleSaveGraphs}
                    LoadGraphsFile={this.props.LoadGraphsFile}
                />
                <MenuRadioButton onFeature={this.onFeature} />
                <If condition={this.state.feature === 'find'} component={VertexFinding} />
            </div>
        )
    }
    onFeature = (feature) => {
        switch (feature) {
            case "draw": {
                this.setState({ feature: "" });
                this.props.drawEdgeFromGraphs();
                this.props.OnDrawingEgde();
                break;
            }
            case "delete": {
                this.setState({ feature: "" });
                this.props.OnDeleteEgde();
                break;
            }
            case "way-findings": {
                this.setState({ feature: "find" });
                this.props.OnWayFinding();
                break;
            }
            default:
                break;
        }
    }
}