import React from 'react';
import './App.css';
import {PathLine} from "react-svg-pathline";
import ReactDOMServer from 'react-dom/server';
class App extends React.Component {
  componentDidMount(){
    let x =  document.getElementsByTagName("circle");
       console.log(x);
  }
  constructor(props) {
    super(props);
    this.state = {
      first_point: {},
      second_point:{},
      path :[],
      count_to_draw:0
    };
    this.addClickEventForCircle = this.addClickEventForCircle.bind(this);
  }
  
  addClickEventForCircle=()=>{
    let x =  document.getElementsByTagName("circle");
       console.log(x);
       for(let i = 0;i<x.length;i++){
           x[i].addEventListener("click",()=>{
               console.log(x[i].attributes.cx);
               if(this.state.count_to_draw %2 === 0 )
                { 
                    this.state.first_point.x = x[i].attributes.cx.value;
                    this.state.first_point.y = x[i].attributes.cy.value;
                    this.setState({count_to_draw:this.state.count_to_draw + 1});
                    return;
                }
                if(this.state.count_to_draw %2 === 1)
                {
                    this.state.second_point.x = x[i].attributes.cx.value;
                    this.state.second_point.y = x[i].attributes.cy.value;
                    this.setState({count_to_draw:this.state.count_to_draw + 1});
                    const distance_x = this.state.first_point.x - this.state.second_point.x;
                    const distance_y = this.state.first_point.y - this.state.second_point.y;
                    const distance = Math.sqrt(distance_x*distance_x + distance_y*distance_y);
                    let relationship = [
                        this.state.first_point.x,
                        this.state.first_point.y,
                        this.state.second_point.x,
                        this.state.second_point.y,
                        distance
                    ] ;
                    
                    this.setState({ path: [...this.state.path, relationship] });

                    let SVGnodes = document.getElementById("nodes");
                    console.log(SVGnodes);
          
                    var path = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    path.setAttributeNS(null, "x1", `${this.state.first_point.x} `);
                    path.setAttributeNS(null, "y1", `${this.state.first_point.y} `);
                    path.setAttributeNS(null, "x2", `${this.state.second_point.x} `);
                    path.setAttributeNS(null, "y2", `${this.state.second_point.y} `);
                    path.setAttributeNS(null, "stroke", "red");
                    path.setAttributeNS(null, "stroke-width",  "3");
                    path.setAttributeNS(null, "fill", "none");
                    path.setAttributeNS(null, "stroke-dasharray", "5,5");
                    console.log(path);
     
    
                    SVGnodes.appendChild(path);
                    return;
                } 
            })
       }
  }

  testEffect = ()=>{

  }
  handleFileSelect = (e) => {  
    var element = document.createElement('div');
    element.innerHTML = '<input type="file">';
    var fileInput = element.firstChild;

    fileInput.addEventListener('change', () =>{
        var file = fileInput.files[0];

        if (file.name.match(/\.(txt|svg)$/)) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async()=> {
                const result = await reader.result;
                
                if(document.getElementsByTagName("svg").length === 0)
                {  
                  const div = document.createElement('div');
                  div.innerHTML = result.trim();
                  document.body.appendChild(div);

                }
                else{ 
                  let oldSVG = document.getElementsByTagName("svg")[0].parentElement;  
                  const newSVG = document.createElement('div');
                  newSVG.innerHTML = result.trim();    
                  oldSVG.parentElement.replaceChild(newSVG,oldSVG);
                }
                this.addClickEventForCircle();
                // this.testEffect();
            };
      
        } else {
            alert("File not supported, .txt or .svg files only");
        }
    });
    
    fileInput.click();
  }
  
  render() {
    return(
    <div className="App">  
      <button onClick={this.handleFileSelect}>button</button>
    </div>
    )
  }
}

export default App;
