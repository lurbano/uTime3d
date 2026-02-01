function loadTimeline(str){
    
    //get data from string input
    let data = JSON.parse(str);

    let masterPeriod = data['periods'][0];
    for (let period of data.periods){
        if (period.id==="fullTime"){
            masterPeriod = period;
        }
    }
    
    let timeline =  new uTimeline({
        startTime: masterPeriod.startTime,
        endTime: masterPeriod.endTime,
        description: masterPeriod.description,
        controlElementId: data.params.controlElementId,
        draw2dElementId: data.params.draw2dElementId,
        draw2dMap: data.params.draw2dMap
    });

    //load periods
    for (let period of data.periods){
        if (period.id !== "fullTime"){
            timeline.addPeriod(period);
            // let p = timeline.periodsList[timeline.periodsList.length -1];
            // p.startTime = period.startTime;
            // p.endTime = period.endTime;
            // p.description = period.description;
            // p.id =period.id;
        }
    }

    //load events
    for (let event of data.events){

        timeline.addEvent(event);
        
    }

    return timeline;
}

class uTimeline {
    constructor(params={}){
        let defaults = {
            startTime: -4500000,
            endTime: 0,
            blocks: 1,
            controlElementId: "workArea",
            draw2dElementId: "area2d",
            draw2dMap: true,
            description: "",
            draw3dElementId: "x3Spot",
            draw3dMap: true,
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

        this.draw3dMap = this.params.draw3dMap;

        // initial, full time period
        this.fullTime = new timelinePeriod({
            startTime: this.startTime, 
            endTime: this.endTime, 
            description: this.description, 
            timeline: this, 
            id: "fullTime"});

        this.periodsList.push(this.fullTime);

        this.addControls(this.params.controlElementId);

        this.addTimelineInOutControls();

        if (this.draw2dMap) {
            this.add2dMap({
                divId: this.params.draw2dElementId,
            })
        }

        if (this.draw3dMap) {
            this.timeline3d = new timeline3dModel({
                timeline: this,
                divId: this.params.draw3dElementId
            })
        }

    }

    update3d(){
        this.timeline3d.update();
    }

    

    write(){
        let output = {
            periods: [],
            events: [],
            params: this.params
        };
        
        for (let period of this.periodsList){
            let p = {
                startTime: period.startTime,
                endTime: period.endTime,
                description: period.description,
                id: period.id
            }
            output.periods.push(p);
        }
        for (let event of this.eventsList){
            let e = {
                eventTime: event.eventTime,
                description: event.description
            }
            output.events.push(e);
        }
        
        return JSON.stringify(output);
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
            
            // Add bar to period
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
        console.log("controls id:", divId)
        this.controlsElement = document.getElementById(divId);
        this.controlsElement.innerHTML = "";
        
        this.epControlsElement = document.createElement("div");
        this.controlsElement.appendChild(this.epControlsElement)

        this.epControlsElement.style.display = "grid";
        this.epControlsElement.style.gridTemplateColumns = "50% 50%";
        this.epControlsElement.style.gap =  "5px";
        this.epControlsElement.style.borderBottom = '1px solid black';
        this.epControlsElement.style.marginBottom = '5px';

        // events panel
        this.eventsListArea = document.createElement("div");
        this.eventsListArea.innerHTML = "Events"
        this.addEventButton = document.createElement("input");
        this.addEventButton.setAttribute("type", "button");
        this.addEventButton.setAttribute("value", "Add Event");
        this.addEventButton.addEventListener("click", () => {
            this.addEvent({
                eventTime: this.startTime,
                description: ""
            })
        });

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

        this.epControlsElement.appendChild(this.periodsControlArea);
        this.epControlsElement.appendChild(this.eventsControlArea);
        
        // this.periodsControlArea.appendChild(this.fullTime.makeHtmlInputs());

        this.updateControls();

    }

    addTimelineInOutControls(){
        this.timelineArea = document.createElement('div');
        this.epControlsElement.after(this.timelineArea);

        let outputBlock = document.createElement("div")
        this.timelineStringArea = document.createElement("textarea");
        this.timelineStringArea.style.width = "90%";

        outputBlock.appendChild(this.timelineStringArea)
        outputBlock.style.width="100%";


        this.timelineOutputButton = document.createElement("input");
        this.timelineOutputButton.setAttribute("type", "button");
        this.timelineOutputButton.setAttribute("value", "Write Timeline");

        this.timelineReadButton = document.createElement("input");
        this.timelineReadButton.setAttribute("type", "button");
        this.timelineReadButton.setAttribute("value", "Read Timeline");

        this.timelineArea.appendChild(this.timelineOutputButton);
        this.timelineArea.appendChild(this.timelineReadButton);
        this.timelineArea.appendChild(outputBlock);

        this.timelineOutputButton.addEventListener("click", () => {
            let str = this.write();
            console.log(str);
            this.timelineStringArea.value = str;
        });

        this.timelineReadButton.addEventListener("click", () => {
            let inputString = this.timelineStringArea.value;
            this.timeline = loadTimeline(inputString);
        })

        

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

    addPeriod(params={}){
        let defaultParams = {
            startTime: this.startTime, 
            endTime: this.endTime, 
            description:"", 
            timeline: this,
            id: ""
        }
        params = {...defaultParams, ...params};
        
        
        let p = new timelinePeriod(params);
        this.periodsList.push(p);
        
        this.updateControls();
        this.update2dMap();
        this.update3d();

        
    }

    addEvent(params={}){
        let defaultParams = {
            eventTime: 0,
            description: "",
            timeline: this
        }
        params = {...defaultParams, ...params};
        
        //console.log("adding Event:", t);
        //let e = new timelineEvent(t, "", this);
        let e = new timelineEvent(params);
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

    update(params={}){
        let defaultParams = {
            newStartTime: false,
            newEndTime: false,
        }

        params = {...defaultParams, ...params};
        
        if (params.newStartTime !== false){
            this.startTime = params.newStartTime;
            this.totalTimePeriod = this.endTime - this.startTime;
            console.log("update startTime:", params);
        }
        if (params.newEndTime !== false){
            this.endTime = params.newEndTime;
            this.totalTimePeriod = this.endTime - this.startTime;
        }

        this.updateControls();
        this.update2dMap();
        this.update3d();
    }
}

class timelineEvent {
    // constructor(eventTime=0, description="", timeline){
    //     this.eventTime = eventTime;
    //     this.description = description;
    //     this.timeline = timeline;
    // }
    constructor(params={}){
        let defaultParams = {
            eventTime: 0,
            description: "",
            timeline: undefined
        }
        params = {...defaultParams, ...params};

        this.eventTime = params.eventTime;
        this.description = params.description;
        this.timeline = params.timeline;
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
    constructor(params={}) {
        let defaultParams = {
            startTime:-100, 
            endTime: 0, 
            description: "", 
            timeline: "", 
            id: ""
        }

        this.params = {...defaultParams, ...params};
        
        this.timeline = this.params.timeline;
        this.startTime = this.params.startTime;
        this.endTime = this.params.endTime;
        this.description = this.params.description;
        this.id = this.params.id;

        // for 3d panel
        this.panel = '';
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
            this.startTime = parseFloat(e.target.value);
            
            if (this.id === "fullTime") {
                this.timeline.update({
                    newStartTime: this.startTime
                });
            } else {
                this.timeline.update();
            }
            
        })

        this.endInput = document.createElement('input');
        this.endInput.setAttribute("type", "number");
        this.endInput.setAttribute("value", this.endTime);
        this.inputBlock.appendChild(this.endInput);
        this.endInput.addEventListener('change', (e) => {
            this.endTime = parseFloat(e.target.value);
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


// function makeHallTimeline(u3x){

//     u3x.addLight({
//         direction: "-1, -1, 0",
//         intensity: 0.5
//     })

//     //cube
//     floor = addBox(3.75,0.5,10.25);
//     floor.setColor(0, 0, 200);
//     u3x.add(floor);

//     leftwell = addBox(0.25,2.5,10.25);
//     leftwell.setColor(100,0,100);
//     leftwell.translate(-1.75,1.5,0);
//     u3x.add(leftwell);

//     // rightwell = addBox(0.25,2.5,10.25);
//     // rightwell.setColor(100,0,100);
//     // rightwell.translate(1.75,1.5,0);
//     // rightwell.setTransparency(0.6)
//     // u3x.add(rightwell);

//     // head-height downhall viewpoint
//     let view0 = new uViewpoint({
//         id:"startView",
//         description: "doorView",
//         orientation:"0,1,0,0.1",
//         position:"1, 1.5, 10",
//         fieldofview: "0.78540",
//         centerofrotation: "0,1.5,0",
//         znear:"-1",
//         zfar:"-1"
//     })
//     u3x.add(view0);
// }


class timeline3dModel{
    constructor(params={}){
        let defaults = {
            timeline: "",
            divId: "",
            hallHeight: 2.5,
            hallWidth: 3.75,
            wallWidth: 0.2,
            maxBarLength: 10, // hall length
            xOffset: -1.7, //left shift (-)
            yOffset: 1.5, //height
            panelHeight: 0.6,
            panelLength: 10,
            panelWidth: 0.1,
            //barHeight: 20,
            //barGap: 5,
            eventTagWidth: 20
        }
        this.params = {...defaults, ...params};

        this.element = document.getElementById(this.params.divId);
        this.element.style.border = '1px solid green'

        // ease of use variable names
        this.timeline = this.params.timeline;

        this.hallHeight = this.params.hallHeight;
        this.hallWidth = this.params.hallWidth;
        this.hallLength = this.params.panelLength + 1;

        //panel prameters
        this.panelLength = this.params.panelLength;
        this.panelHeight = this.params.panelHeight;
        this.panelHeight = this.params.panelHeight;
        this.panelWidth = this.params.panelWidth;
        this.panelElevation = 1.5; //height above floor
        this.panel_xOffset = -this.hallWidth/2+this.params.wallWidth;

        // ux3d instance
        this.u3dModel = new ux3d("x3Spot", {
            width: "100%",
            height: "100%"
        });

        //floor and wall
        this.floor = addBox(this.hallWidth,0.5,this.hallLength);
        this.floor.setColor(0, 0, 200);
        this.u3dModel.add(this.floor);

        this.leftWall = addBox(this.params.wallWidth,this.hallHeight, this.hallLength);
        this.leftWall.setColor(100,0,100);
        this.leftWall.translate(-1.75,1.5,0);
        this.u3dModel.add(this.leftWall);

        // View down hallway
        this.u3dModel.addViewpoint({
            id:"startView",
            description: "startView",
            orientation:"0,1,0,0.2",
            position:"1, 1.5, 12",
            fieldofview: "0.78540",
            centerofrotation: "-1,1.5,0",
            znear:"-1",
            zfar:"-1"
        }, true)
        
        // Perpendicular View
        this.u3dModel.addViewpoint({
            id:"PerpView",
            description: "PerpView",
            orientation:"0,1,0,1.57",
            position:`${this.panelLength*1.25}, 1.5, 0`,
            fieldofview: "0.78540",
            centerofrotation: "-2,1.5,0",
            znear:"-1",
            zfar:"-1"
        }, true)

        // add track lighting
        this.u3dModel.addLight({
            direction: "-1, -1, 0",
            intensity: 0.5
        })

        this.update();
    
    }

    update(){
        //delete old panels
        for (let [i, period] of this.timeline.periodsList.entries()) {
            
            if (period.panel){
                this.u3dModel.removeByIndex(period.panel.index);
            }

            this.addPanel(period)

            if (i !== 0) period.panel.setColor(100,0,0);
        }


    }

    // panelzOffset(period){

    // }

    addPanel(period){
        //console.log(xPos, zPos);

        

        let x = this.panel_xOffset;
        let y = this.panelElevation;

        let z = (this.panelLength/2) - this.scaleTime(this.timeline.totalTimePeriod + ( period.endTime + period.startTime)/2, this.panelLength);

        let dt = period.endTime - period.startTime;

        let panelLength = this.scaleTime(dt, this.panelLength);

        //offset main timeline a little
        if (period.id === "fullTime") x-=0.01;

        let panel = addBox(this.panelWidth, this.panelHeight, panelLength);
        panel.setColor(200,200,200);
        panel.translate(x,y, z);
        this.u3dModel.add(panel);

        period.panel = panel;
    }

    scaleTime(t, maxLength){
        let totalTime = this.timeline.totalTimePeriod;

        let factor = Math.abs(t)/totalTime;
        return maxLength * factor;
    }


}

// class panel3d {
//     constructor(params={}){
//         let defaults = {
//             panelWidth: 0.1,
//             panelHeight: 0.6,
//             panelLength: 0.9,
//             position: [0, 0, 0],
//             color: [200,200,150]
//         }
//         this.params = {...defaults, ...params};

//         this.box = addBox(this.params.panelWidth, this.params.panelHeight, this.params.panelLength);
//     }
// }