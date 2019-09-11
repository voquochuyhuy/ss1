import React, { Component } from 'react'
import _ from "lodash";
import Files from 'react-files'
  const LoadSvgButton = (props) => { 
    const  handleLoadSvgClick = async e => {
        const svgLoaderElement = await renderFormLoader();
        if (!svgLoaderElement) return ;
        console.log(svgLoaderElement)
        svgLoaderElement.addEventListener("change", async () => {
            const svgPromiseArr = await loadSvg(svgLoaderElement.files)
            Promise.all(svgPromiseArr).then(svgContents => props.onLoadFinish(svgContents))
        })
    } 

    const renderFormLoader = () => {  
        var element = document.createElement("div");
        element.innerHTML = '<input type="file" multiple>';
        var fileInput = element.firstChild;
        fileInput.click()   
        return fileInput;
    }

    const loadSvg = (files) => {
        let promises = [];
        for (let file of files) {
            let filePromise = new Promise(resolve => {
                let reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => resolve(reader.result);
            });
            promises.push(filePromise);
        }
        return promises
    }

    const onFilesChange = (files)=>{
       
        console.log(files);
        let arrUrlSvg = [];
        for(let i= 0;i<files.length ;i++)
        {    
            arrUrlSvg.push(files[i]);
        }
            
         return   props.onLoadFinish(arrUrlSvg)
    }

    const onFilesError = ()=>{

    }
    return <Files
            className='files-dropzone'
            onChange={onFilesChange}
            onError={onFilesError}
            accepts={[".svg"]}
            multiple
            maxFiles={3}
            maxFileSize={10000000}
            minFileSize={0}
            clickable
        >
            Drop files here or click to upload
        </Files>
}
export default LoadSvgButton
