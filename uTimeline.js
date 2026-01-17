class uTimeline {
    constructor(params={}){
        let defaults = {
            startTime: -4500000,
            endTime: 0,
            blocks: 1
        }
        this.params = {...defaults, ...params};

        this.startTime = this.params.startTime;
        this.endTime = this.params.startTime;
        this.blocks = this.params.blocks;
    }

    draw2d(divId="", params={}){
        let defaults = {
            width: 1000,
            height: 20
        }
        this.params2d = {...defaults, ...params};
        
        this.timeline2d = new svgTimeline(divId, this.params2d);
    
    }
}

class svgTimeline {
    constructor(divId="", params={}){
        let defaults = {
            width: 1000,
            height: 20, 
            fill: "lightblue",
            stroke: "red",
            "stroke-width": "2"
        }
        //this.params = {...defaults, ...params};
        this.parentElement = document.getElementById(divId);
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.element.setAttribute("width", "2000px")

        let bbAttributes = {...defaults, ...params};
        
        this.width = bbAttributes.width;
        this.height = bbAttributes.height;
        
        this.boundaryBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        setAttributes(this.boundaryBox, bbAttributes);
        this.element.appendChild(this.boundaryBox);

        console.log(this.element.getAttribute("width"));
        this.parentElement.appendChild(this.element);
        
    }
}
