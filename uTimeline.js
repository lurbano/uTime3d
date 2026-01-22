class uTimeline {
    constructor(params={}){
        let defaults = {
            startTime: -4500000,
            endTime: 0,
            blocks: 1
        }
        this.params = {...defaults, ...params};

        this.startTime = this.params.startTime;
        this.endTime = this.params.endTime;
        this.description = this.params.description;
        this.blocks = this.params.blocks;
        this.eventsList = [];
        this.periodsList = [];

        this.fullTime = new timelinePeriod(this.startTime, this.endTime, this.description, this);
        this.periodsList.push(this.fullTime);

    }

    addControls(divId=""){
        //console.log(divId)
        this.controlsElement = document.getElementById(divId);
        

        this.controlsElement.style.display = "grid";
        this.controlsElement.style.gridTemplateColumns = "50% 50%";
        this.controlsElement.style.gap =  "5px";

        this.eventsListArea = document.createElement("div");
        this.eventsListArea.innerHTML = "Events"

        this.periodsArea = document.createElement("div")
        this.periodsListArea = document.createElement("div");
        this.addPeriodButton = document.createElement("input");
        this.addPeriodButton.setAttribute("type", "button");
        this.addPeriodButton.setAttribute("value", "Add Period");
        this.addPeriodButton.addEventListener("click", () => {this.addPeriod()});
        this.periodsArea.innerHTML = "Periods"
        this.periodsArea.appendChild(this.addPeriodButton);
        this.periodsArea.appendChild(this.periodsListArea);

        this.controlsElement.appendChild(this.periodsArea);
        this.controlsElement.appendChild(this.eventsListArea);
        
        // console.log(this.controlsElement);

        //startTime input
        // let startEvent = new timelineEvent(-1000, "StartTime");
        // let endEvent = new timelineEvent(0, "End Time");

        // full period
        //this.periodsListArea.appendChild(fullTime.makeHtmlInputs());
        

    }

    addPeriod(){
        
        console.log("adding Period")
        let p = new timelinePeriod(this.startTime, this.endTime, "", this);
        this.periodsList.push(p);
        this.timeline2d.drawPeriods();
        
    }

    draw2d(params={}, svgParams={}){
        //params["startTime"] = this.startTime;
        //params["endTime"] = this.endTime;
        params["timeline"] = this;

        this.timeline2d = new svgTimeline(params, svgParams);
        // console.log(this.periodsList)
        this.timeline2d.drawPeriods();
    }

    update(){
        this.timeline2d.drawPeriods();
    }
}

class timelineEvent {
    constructor(eventTime, description){

    }
}

class timelinePeriod {
    constructor(startTime, endTime, description, timeline){
        this.timeline = timeline;
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
        this.startInput.addEventListener('change', (e) => {
            this.startTime = e.target.value;
            this.timeline.update();
        })

        this.endInput = document.createElement('input');
        this.endInput.setAttribute("type", "number");
        this.endInput.setAttribute("value", this.endTime);
        this.inputBlock.appendChild(this.endInput);
        this.endInput.addEventListener('change', (e) => {
            this.endTime = e.target.value;
            this.timeline.update();
        })

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
    constructor(params={}, svgParams={}, barAttributes={}){
        let defaultParams = {
            divId: "",
            timeline: undefined, //a uTimeline instance
            maxBarLength: 800,
            xOffset: 20,
            yOffset: 20, 
            barHeight: 20,
            barGap: 5,
            
        }
        let defaultSvgParams = {
            width: 1000,
            height: 100,
            //"background-color": "lightblue",
            fill: "lightblue",
            stroke: "green",
            "stroke-width": "2"
        }
        let defaultBarAttributes = {
            height: 20,
            fill: "blue"
        }
        
        this.params = {...defaultParams, ...params};
        this.svgParams = {...defaultSvgParams, ...svgParams};
        this.barAttributes = {...defaultBarAttributes, ...barAttributes};
        
        this.timeline = this.params.timeline;

        this.maxBarLength = this.params.maxBarLength;
        this.startTime = this.timeline.startTime;
        this.endTime = this.timeline.endTime;
        this.totalTimePeriod = this.endTime - this.startTime;

        //console.log("this.svgParams", this.svgParams)
        //console.log(this.params.divId)
        this.parentElement = document.getElementById(this.params.divId);
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        setAttributes(this.element, this.svgParams)
        //console.log("element:", this.element)

        this.parentElement.appendChild(this.element);
        //background box
        //this.makeBackground()
        
    }

    makeBackground(){
        this.background = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        let backgroundParams = {
            width: this.element.getAttribute("width"),
            height: this.element.getAttribute("height"),
            fill: this.element.getAttribute('fill'),
        }
        setAttributes(this.background, backgroundParams)
        this.element.appendChild(this.background);
    }

    drawPeriods(){ 
        this.element.innerHTML = '';
        this.timeline.periodsListArea.innerHTML = "";
        this.makeBackground();
        let periods=this.timeline.periodsList;
        //periods is a list of timelinePeriods
        let np = -1;
        for (let period of periods) {
            console.log('period:', np)
            np++;
            let attributes = this.barAttributes;
            let yPos =  this.params.yOffset + np * (this.params.barHeight+this.params.barGap);
            attributes['y'] = yPos;
            attributes['width'] = this.scaleTime(period.startTime - period.endTime);
            attributes['x'] = this.xOffset(period.startTime);
            period.bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            setAttributes(period.bar, attributes);
            this.element.appendChild(period.bar);

            

            // add label
            period.label = document.createElement("text");
            let textAttributes = {
                x: this.maxBarLength+this.params.xOffset,
                y: 40, //yPos,
                "text-anchor": "start",
                //'dominant-baseline': "middle",
                'font-size': 10,
                fill: "black"
            }   
            setAttributes(period.label, textAttributes)
            period.label.innerText = period.description;
            //console.log("label:", period.label)
            //this.element.appendChild(period.label);

            this.timeline.periodsListArea.appendChild(period.makeHtmlInputs());


        }
    }

    scaleTime(t){
        let factor = Math.abs(t)/this.totalTimePeriod;
        // console.log("scale", t, this.startTime, factor, Math.abs(t-this.startTime))
        return this.maxBarLength * factor;
    }

    xOffset(t){
        return this.params.xOffset + this.scaleTime(t-this.startTime);
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
