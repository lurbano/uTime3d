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

    addControls(divId=""){
        console.log(divId)
        this.controlsElement = document.getElementById(divId);
        this.eventsList = [];
        this.periodsList = [];

        this.controlsElement.setAttribute("display", 'grid');
        this.controlsElement.setAttribute("grid-template-columns", "1fr 1fr");
        this.controlsElement.setAttribute("gap", "5px");

        this.eventsListArea = document.createElement("div");
        this.periodsListArea = document.createElement("div");

        this.controlsElement.appendChild(this.eventsListArea);
        this.controlsElement.appendChild(this.periodsListArea);

        console.log(this.controlsElement);

        //startTime input
        // let startEvent = new timelineEvent(-1000, "StartTime");
        // let endEvent = new timelineEvent(0, "End Time");

        // full period
        let fullTime = new timelinePeriod(-4.5, 0, "Earth History");
        this.periodsListArea.appendChild(fullTime.makeHtmlInputs());
        this.periodsList.push(fullTime);


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

class timelineEvent {
    constructor(eventTime, description){

    }
}

class timelinePeriod {
    constructor(startTime, endTime, description){
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
    }
    makeHtmlInputs(){
        this.inputBlock = document.createElement("div");
        this.inputBlock.style.width = "95%";
        this.inputBlock.style.backgroundColor = "lightSalmon";
        this.inputBlock.style.padding = "2px";

        this.startInput = document.createElement('input');
        this.startInput.setAttribute("type", "number");
        this.startInput.setAttribute("value", this.startTime);
        this.inputBlock.appendChild(this.startInput);

        this.endInput = document.createElement('input');
        this.endInput.setAttribute("type", "number");
        this.endInput.setAttribute("value", this.endTime);
        this.inputBlock.appendChild(this.endInput);

        this.descInput = document.createElement('input');
        this.descInput.setAttribute("type", "text");
        this.descInput.setAttribute("value", this.description);
        this.inputBlock.appendChild(this.descInput);

        this.delButton = document.createElement("input");
        this.delButton.setAttribute('type', "button");
        this.delButton.setAttribute('value', "-");
        this.inputBlock.appendChild(this.delButton);

        return this.inputBlock;
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

    drawPeriod(){
        
    }
}

class divTimeline {
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
        this.element = document.createElement('div');

        this.parentElement.appendChild(this.element);
    }
}
