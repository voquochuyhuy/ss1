import React, { Component } from 'react';
// import _ from "lodash";
import Files from 'react-files';
class LoadSvgButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numberOfMap: 0,
            startIndex: 0,
        }
    }
    // handleLoadSvgClick = async e => {
    //     const svgLoaderElement = await this.renderFormLoader();
    //     if (!svgLoaderElement) return ;
    //     console.log(svgLoaderElement)
    //     svgLoaderElement.addEventListener("change", async () => {
    //         const svgPromiseArr = await this.loadSvg(svgLoaderElement.files)
    //         Promise.all(svgPromiseArr).then(svgContents => this.props.onLoadFinish(svgContents))
    //     })
    // } 

    // renderFormLoader = () => {  
    //     var element = document.createElement("div");
    //     element.innerHTML = '<input type="file" multiple>';
    //     var fileInput = element.firstChild;
    //     fileInput.click()   
    //     return fileInput;
    // }

    // loadSvg = (files) => {
    //     let promises = [];
    //     for (let file of files) {
    //         let filePromise = new Promise(resolve => {
    //             let reader = new FileReader();
    //             reader.readAsText(file);
    //             reader.onload = () => resolve(reader.result);
    //         });
    //         promises.push(filePromise);
    //     }
    //     return promises
    // }

    setStateAsync(state) {
        return new Promise((resolve) => {
          this.setState(state, resolve)
        });
    }
    onFilesChange = async (files) => {
        // let {numberOfMap,startIndex} = this.state;
        const arrUrlSvg = [];
        for (let i = this.state.numberOfMap; i < files.length; i++) {
            arrUrlSvg.push(files[i].preview.url);
        }   
        await this.setStateAsync({ startIndex: this.state.numberOfMap });
        await this.setStateAsync({ numberOfMap: files.length });

        this.props.onLoadFinish(arrUrlSvg,this.state.startIndex);
    }

    onFilesError = () => {

    }
    shouldComponentUpdate(nextState){
        
        return false;
    }
    render() {
        console.log("LoadSvgButton");
        return <Files
            className='files-dropzone'
            onChange={this.onFilesChange}
            onError={this.onFilesError}
            accepts={[".svg"]}
            multiple
            // maxFiles={3}
            maxFileSize={10000000}
            minFileSize={0}
            clickable
        >
            Drop files here or click to upload
        </Files>
    }


    //  return <button onClick={handleLoadSvgClick}>Load Map</button>   
}
export default LoadSvgButton
