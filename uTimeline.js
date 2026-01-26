class uTimeline {
    constructor(params={}){
        let defaults = {
            startTime: -4500000,
            endTime: 0,
            blocks: 1,
            controlElementId: "",
            draw2dElementId: "",
            draw2dMap: true,
        }
        this.params = {...defaults, ...params};

        this.startTime = this.params.startTime;
        this.endTime = this.params.endTime;
        this.totalTimePeriod = this.endTime - this.startTime;

        this.description = this.params.description;
        this.blocks = this.params.blocks;
        this.eventsList = [];
        this.periodsList = [];

        this.draw2dMap = this.params.draw2dMap;

        // initial, full time period
        this.fullTime = new timelinePeriod(this.startTime, this.endTime, this.description, this);
        this.periodsList.push(this.fullTime);

        this.addControls(this.params.controlElementId);

        if (this.draw2dMap) {
            this.add2dMap({
                divId: this.params.draw2dElementId,
            })
        }

    }

    add2dMap(params={}){
        let defaults = {
            divId: "",
            maxBarLength: 800,
            xOffset: 20,
            yOffset: 20, 
            barHeight: 20,
            barGap: 5,
            eventTagWidth: 20,
        }
        this.params_2d = {...defaults, ...params};

        console.log(this.params_2d.divId)
        this.map2dElement = document.getElementById(this.params_2d.divId);
        this.map2dElement.style.position = 'relative';
        this.map2dElement.style.height = "200px";
        this.map2dElement.style.border = '1px solid green'

        this.map2dPeriodElement = document.createElement('div');
        this.map2dPeriodElement.style.backgroundColor = 'lightSalmon'
        this.map2dPeriodElement.style.border = "3px inset pink"
        this.map2dPeriodElement.style.position = 'absolute';
        this.map2dPeriodElement.style.height = '100px';
        this.map2dPeriodElement.style.width = "100%"
        this.map2dPeriodElement.style.top = '0';
        this.map2dPeriodElement.style.left = '0';
        
        this.map2dElement.appendChild(this.map2dPeriodElement);

        this.map2dEventElement = document.createElement('div');
        this.map2dEventElement.style.backgroundColor = 'lightgreen'
        this.map2dEventElement.style.border = "3px inset pink"
        this.map2dEventElement.style.position = 'absolute';
        this.map2dEventElement.style.height = '100px';
        this.map2dEventElement.style.width = "100%"
        this.map2dEventElement.style.top = '100px';
        this.map2dEventElement.style.left = '0';
        
        this.map2dElement.appendChild(this.map2dEventElement);

        this.update2dMap();
        
    }

    update2dMap(){
        this.map2dPeriodElement.innerHTML = "";
        let np = -1;
        for (let period of this.periodsList) {
            np++;
            let pDiv = document.createElement('div');
            pDiv.style.backgroundColor = "khaki";
            pDiv.style.border = '1px solid black';
            pDiv.style.borderRadius = '2px';
            pDiv.style.fontSize = `${this.params_2d.barHeight * 0.6}px`
            pDiv.style.height = `${this.params_2d.barHeight}px`; //this.params_2d.barHeight;
            let barLength=this.scaleTime(period.endTime-period.startTime, this.params_2d.maxBarLength);
            pDiv.style.width = `${barLength}px`;
            // pDiv.setAttribute("height", this.params_2d.barHeight);
            // pDiv.setAttribute("width", "100px");
            period.bar = pDiv;
            period.bar.innerHTML = period.description;
            period.bar.style.position = "absolute";
            let x = this.xOffset_2d(period.startTime, this.params_2d.maxBarLength)
            period.bar.style.left = `${x}px`;
            let y =  this.params_2d.yOffset + np * (this.params_2d.barHeight+this.params_2d.barGap);
            period.bar.style.top = `${y}px`;
            this.map2dPeriodElement.appendChild(period.bar);
        }

        // events
        let w = this.params_2d.eventTagWidth;
        this.map2dEventElement.innerHTML = '';
        for (let event of this.eventsList) {
            
            let eDiv = document.createElement('div');
            eDiv.style.width = `${w}px`;
            eDiv.style.height = `${w}px`;
            eDiv.style.border = '1px solid black';
            eDiv.style.borderBottom = 'none';
            eDiv.style.borderRadius = '2px';
            eDiv.style.position = 'absolute';
            let x = this.xOffset_2d(event.eventTime, this.params_2d.maxBarLength) - w/2;

            eDiv.style.left = `${x}px`;
            eDiv.style.top = '5px';

            //label
            let label = document.createElement('div')
            eDiv.appendChild(label)
            label.innerHTML = event.description;
            label.style.writingMode = 'vertical-rl'
            //label.style.textOrientation = 'upright'
            //label.style.transform = 'rotate(90deg)'
            label.style.whiteSpace = 'nowrap'
            label.style.fontSize = `${w * 0.6}px`
            //label.style.textAlign = 'center'
            label.style.position = 'absolute'
            label.style.marginTop = "5px"

            event.tag = eDiv;
            this.map2dEventElement.appendChild(event.tag);
        }
    }

    scaleTime(t, maxLength){
        let factor = Math.abs(t)/this.totalTimePeriod;
        // console.log("scale", t, this.startTime, factor, Math.abs(t-this.startTime))
        return maxLength * factor;
    }

    xOffset_2d(t, maxLength){
        return this.params_2d.xOffset + this.scaleTime(t-this.startTime, maxLength);
    }


    addControls(divId=""){
        //console.log(divId)
        this.controlsElement = document.getElementById(divId);
        

        this.controlsElement.style.display = "grid";
        this.controlsElement.style.gridTemplateColumns = "50% 50%";
        this.controlsElement.style.gap =  "5px";

        // events panel
        this.eventsListArea = document.createElement("div");
        this.eventsListArea.innerHTML = "Events"
        this.addEventButton = document.createElement("input");
        this.addEventButton.setAttribute("type", "button");
        this.addEventButton.setAttribute("value", "Add Event");
        this.addEventButton.addEventListener("click", () => {this.addEvent(this.startTime)});

        this.eventsControlArea = document.createElement("div")
        this.eventsControlArea.innerHTML = "Events"
        this.eventsControlArea.appendChild(this.addEventButton);
        this.eventsControlArea.appendChild(this.eventsListArea);
        
        //periods panel
        this.periodsListArea = document.createElement("div");
        this.addPeriodButton = document.createElement("input");
        this.addPeriodButton.setAttribute("type", "button");
        this.addPeriodButton.setAttribute("value", "Add Period");
        this.addPeriodButton.addEventListener("click", () => {this.addPeriod()});

        // periodsControlArea: div for period controls
        this.periodsControlArea = document.createElement("div")
        this.periodsControlArea.innerHTML = "Periods"
        this.periodsControlArea.appendChild(this.addPeriodButton);
        this.periodsControlArea.appendChild(this.periodsListArea);

        this.controlsElement.appendChild(this.periodsControlArea);
        this.controlsElement.appendChild(this.eventsControlArea);
        
        // this.periodsControlArea.appendChild(this.fullTime.makeHtmlInputs());

        this.updateControls();

    }

    updateControls(){
        this.periodsListArea.innerHTML = '';
        for (let period of this.periodsList) {
            this.periodsListArea.appendChild(period.makeHtmlInputs());
        }
        
        this.eventsListArea.innerHTML = '';
        for (let event of this.eventsList) {
            
            this.eventsListArea.appendChild(event.makeHtmlInputs());
        }
    }

    addPeriod(){
        
        let p = new timelinePeriod(this.startTime, this.endTime, "", this);
        this.periodsList.push(p);
        
        this.updateControls();
        this.update2dMap();

        
    }

    addEvent(t){
        console.log("adding Event:", t);
        let e = new timelineEvent(t, "", this);
        this.eventsList.push(e);

        this.updateControls();
        this.update2dMap();

    }

    // draw2d(params={}, svgParams={}){
    //     //params["startTime"] = this.startTime;
    //     //params["endTime"] = this.endTime;
    //     params["timeline"] = this;

    //     this.timeline2d = new svgTimeline(params, svgParams);
    //     // console.log(this.periodsList)
    //     this.timeline2d.drawPeriods();
    // }

    // draw2dDiv(params={}){

        
    // }

    update(){
        //this.timeline2d.drawPeriods();
        //console.log("updating timeline")
        this.updateControls();
        this.update2dMap();
    }
}

class timelineEvent {
    constructor(eventTime=0, description="", timeline){
        this.eventTime = eventTime;
        this.description = description;
        this.timeline = timeline;
    }

    makeHtmlInputs(){
        this.inputBlock = document.createElement("div");
        this.inputBlock.style.width = "95%";
        this.inputBlock.style.backgroundColor = "lightGreen";
        this.inputBlock.style.padding = "2px";
        this.inputBlock.style.border = "3px outset red"
        this.inputBlock.style.marginTop = "3px"

        this.eventTimeInput = document.createElement('input');
        this.eventTimeInput.setAttribute("type", "number");
        this.eventTimeInput.setAttribute("value", this.eventTime);
        this.inputBlock.appendChild(this.eventTimeInput);
        this.eventTimeInput.addEventListener('change', (e) => {
            this.eventTime = e.target.value;
            this.timeline.update();
        })

        this.descInput = document.createElement('input');
        this.descInput.setAttribute("type", "text");
        this.descInput.setAttribute("value", this.description);
        this.inputBlock.appendChild(this.descInput);
        this.descInput.addEventListener("change", (e) => {
            this.description = e.target.value;
            this.timeline.update();
        } )

        this.delButton = document.createElement("input");
        this.delButton.setAttribute('type', "button");
        this.delButton.setAttribute('value', "-");
        this.inputBlock.appendChild(this.delButton);

        return this.inputBlock;
    }
}

class timelinePeriod {
    constructor(startTime, endTime, description, timeline){
        this.timeline = timeline;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
    }
    makeHtmlBar(){

    }
    makeHtmlInputs(){
        this.inputBlock = document.createElement("div");
        this.inputBlock.style.width = "95%";
        this.inputBlock.style.backgroundColor = "lightSalmon";
        this.inputBlock.style.padding = "2px";
        this.inputBlock.style.border = "3px outset red"
        this.inputBlock.style.marginTop = "3px"

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
        this.descInput.addEventListener("change", (e) => {
            this.description = e.target.value;
            this.timeline.update();
        } )

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

// class divTimeline {
//     constructor(divId="", params={}){
//         let defaults = {
//             width: 1000,
//             height: 20, 
//             fill: "lightblue",
//             stroke: "red",
//             "stroke-width": "2"
//         }
//         //this.params = {...defaults, ...params};
//         this.parentElement = document.getElementById(divId);
//         this.element = document.createElement('div');

//         this.parentElement.appendChild(this.element);
//     }
// }
