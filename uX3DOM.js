
console.log("x")

function setAttributes(elem, props){
    // console.log("props", props);
    for (const [prop, val] of Object.entries(props)){

        // console.log(prop, val)
        elem.setAttribute(prop, val);
        
    }
}

class ux3d {
    constructor(params={}){
        
        let defaults = {
            width: "400px",
            height: "500px"
        }

        this.params = {...defaults, ...params};

        this.elem = document.createElement("x3d");
        setAttributes(this.elem, this.params);
        this.elem.style.width = this.params.width;
        this.elem.style.height = this.params.height;

        this.scene = new uScene();

        this.elem.appendChild(this.scene.div);
        this.primitives = [];
        this.transforms = [];

    }

    add(obj){
        this.primitives.push(obj);
        //let transform = obj.transform;
        this.transforms.push(obj.transform);
        this.scene.div.appendChild(obj.assemble());
    }

    setNavigationMode(navMode){
        this.scene.setNavigationMode(navMode);
    }

    toOpenSCAD(scale = 10){
        console.log("exporting OpenSCAD format", this.transforms.length)
        let scadString = '';

        for (let i=0; i<this.primitives.length; i++){
            let primitive = this.primitives[i]
             //this.transforms[i];
            //console.log("primitive", primitive.constructor.name)

            
            
            if (primitive !== undefined && typeof primitive.toOpenSCAD === 'function'){
                let transform = this.primitives[i].transform;
                if (transform !== undefined && typeof transform.toOpenSCAD === 'function'){
                    scadString += transform.toOpenSCAD(scale);
                }
                
                scadString += primitive.toOpenSCAD(scale);
            }
        }
        console.log("OpenScad:", scadString);
    }
}

// Note: all objects added need an .assemble() method like box.assemble()

class uScene {
    constructor(params={}){
        let defaults = {
            DEF: "scene",
            description: "startPos",
            render: true,
            visible: true,
            bboxcenter: '0,0,0',
            bboxsize: "-1,-1,-1",
            bboxdisplay: false,
            bboxmargin: "0.01",
            bboxcolor:"1,1,0",
            pickmode:"idBuf",
            dopickpass: true,
            shadowobjectidmapping: ""
        }
        
        this.params = {...defaults, ...params};

        this.div = document.createElement("scene");
        setAttributes(this.div, this.params)

        // add navigation element
        this.navElem = new uNavigationInfo();
        //console.log("Nav:", this.navElem.div);
        this.div.appendChild(this.navElem.div);


    }

    setNavigationMode(navMode) {
        this.navElem.div.setAttribute("type", navMode);
    }

    addTo(id){
        outerDiv = document.getElementById(id);
        outerDiv.appendChild(this.div);
    }
}

class uNavigationInfo {
    constructor(params={}){
        let defaults = {
            type: "walk"
        }

        this.params = {...defaults, ...params};
        this.div = document.createElement("navigationInfo");
        setAttributes(this.div, this.params);
    }
}

class uShape {
    constructor(params={}){
        let defaults = {
            render: true,
            visible: true,
            bboxcenter: '0,0,0',
            bboxsize: "-1,-1,-1",
            bboxdisplay: false,
            bboxmargin: "0.01",
            bboxcolor:"1,1,0",
            ispickable: true,
            idoffset:"0"
        }

        this.params = {...defaults, ...params};

        this.div = document.createElement("shape");
        setAttributes(this.div, this.params)
        
    }

    addTo(id) {
        outerDiv = document.getElementById(id);
        outerDiv.appendChild(this.div);
    }
}


class uAppearance {
    constructor(params={}){
        let defaults = {
            sorttype:"auto",
            sortkey:"0",
            alphaclipthreshold:"0.1"
        }
        this.params = {...defaults, ...params};

        this.div = document.createElement("appearance");
        setAttributes(this.div, this.params);
        // this.material = new uMaterial();
        // this.div.appendChild(this.material.div);
    }

    addTo(id) {
        outerDiv = document.getElementById(id);
        outerDiv.appendChild(this.div);
    }

    appendChild(uObj){
        this.div.appendChild(uObj.div);
    }
}

class uMaterial {
    constructor(params={}){
        let defaults = {
            diffusecolor:"1 0 0",
            ambientintensity:"0.2",
            emissivecolor:"0 0 0",
            shininess: "0.2",
            specularcolor: "0,0,0",
            transparency:"0"
        }
        this.params = {...defaults, ...params};

        this.div = document.createElement("material");
        setAttributes(this.div, this.params);
    }

    addTo(id) {
        outerDiv = document.getElementById(id);
        outerDiv.appendChild(this.div);
    }
}

class uPrimitive {
    constructor(params={}, primitiveType="box"){
        let defaults = {}
        this.params = {...defaults, ...params};

        this.div = document.createElement(primitiveType);
        setAttributes(this.div, this.params);
        this.shape = new uShape();
        this.appearance = new uAppearance();
        this.material = new uMaterial();

        //everything is embeded in transform
        this.transform = new uTransform();
    }

    assemble(){
        this.appearance.div.appendChild(this.material.div);
        this.shape.div.appendChild(this.appearance.div);
        this.shape.div.appendChild(this.div);

        this.transform.appendChild(this.shape);

        return this.transform.div;
    }

    addProximitySensor(size=5){
        this.proximitySensor = new uProximitySensor();
        this.proximitySensor.setSize(size);
        this.transform.div.appendChild(this.proximitySensor.div);
        // console.log('prox1',  size, func)
        // if (func !== undefined) {
        //     console.log("send")
        //     this.proximitySensor.addEventListener(event=event, func=func)
        // }
        
    }

    setColor(r, g, b){
        r = r/255;
        g = g/255;
        b = b/255;
        this.material.div.setAttribute("diffusecolor", `${r} ${g} ${b}`);
    }

    setEmissiveColor(r, g, b){
        r = r/255;
        g = g/255;
        b = b/255;
        this.material.div.setAttribute("emissiveColor", `${r} ${g} ${b}`);
    }

    translate(x, y, z){
        //this.transform.div.setAttribute("translation", `${x} ${y} ${z}`);
        this.transform.translate(x,y,z);
    }

    rotateAxisAngle(x=0, y=0, z=0, t=0){
        t = t * Math.PI/180
        this.transform.div.setAttribute("rotation", `${x} ${y} ${z} ${t}`);
    }

    rotateX(t=0){
        t = t * Math.PI/180
        
        this.transform.div.setAttribute("rotation", `0 1 0 ${t}`);
    }
    rotateY(t=0){
        t = t * Math.PI/180
        this.transform.div.setAttribute("rotation", `0 0 1 ${t}`);
    }
    rotateZ(t=0){
        t = t * Math.PI/180
        this.transform.div.setAttribute("rotation", `1 0 0 ${t}`);
    }

    rotate(rx=0, ry=0, rz=0){ // angles in degrees for rotation about x-axis, y-axis, and z-axis
        let r = eulerToAxisAngle(rx, ry, rz); 
        let angle = r.angle * 180 / Math.PI;
        let axis = r.axis;
        this.rotateAxisAngle(axis.x, axis.y, axis.z, angle)
    }

    addTexture(fname){
        let div = document.createElement("ImageTexture");
        div.setAttribute("url", fname);
        this.appearance.div.appendChild(div);
    }

    // addVideo(fname){
    //     let div = document.createElement("MovieTexture");
    //     div.setAttribute("url", fname);
    //     this.appearance.div.appendChild(div);
    // }

    addVideo(fname){
        this.video = new uMovieTexture({
            url: fname
        })

        this.appearance.appendChild(this.video);
    }

    isVisible(){
        return this.transform.isVisible();
    }

    addSound(fname){
        this.sound = new uSound({
            url: fname
        })
        this.transform.appendChild(this.sound);
    }

    getAttribute(attrib){
        return this.div.getAttribute(attrib);
    }

    parse_X3DOM_vector(attrib, scale=1){
        let str = this.div.getAttribute(attrib);
        return parse_X3DOM_vector(str, scale);
    }

}

function parse_X3DOM_vector(str, scale=1){
    let dims = str.split(/[\s,]+/);
    for (let i = 0; i < dims.length; i++){
        dims[i] = parseFloat(dims[i])*scale;
    }
    return dims;
}

function X3DOM_to_OpenSCAD_vector(div, attrib, scale){
    let str = div.getAttribute(attrib);
    let dims = parse_X3DOM_vector(str, scale);
    let OpenSCAD_str = `(${dims[0]},${dims[1]},${dims[2]})`;
    return OpenSCAD_str;
}



class uSound {
    constructor(params={}) {
        let defaults = {
            enabled: "false"
        }
        this.params = {...defaults, ...params};
        this.div = document.createElement("sound");

        this.audioclip = new uAudioclip({
            url: this.params.url
        })
        this.appendChild(this.audioclip);
    }

    appendChild(uObj){
        this.div.appendChild(uObj.div);
    }

    play(){
        this.stop();
        this.audioclip.div.setAttribute('enabled', "true")
        //this.audioclip.div.play();
    }

    stop(){
        this.audioclip.div.setAttribute("enabled", "false");
    }

    setClickListener(uObj){ // play when uObj is clicked
        uObj.div.addEventListener("click", () => {
            console.log("playing sound")
            this.play();
        });
    }
}

class uAudioclip {
    constructor(params={}) {
        let defaults = {
            loop: 'false',
            enabled: 'false'
        }
        this.params = {...defaults, ...params};
        this.div = document.createElement("audioclip");

        setAttributes(this.div, this.params );
        
    }
}

class uMovieTexture{
    constructor(params={}){
        let defaults = {

        }
        this.params = {...defaults, ...params};
        this.div = document.createElement("MovieTexture");
        setAttributes(this.div, this.params);

    }

    play(){
        const video = this.div._x3domNode._video;
        video.currentTime = 0; // optional rewind
        video.play();
    }
    stop(){
        const video = this.div._x3domNode._video;
        video.pause();
    }

    setClickListener(uObj){ // play when uObj is clicked
        uObj.div.addEventListener("click", () => {
            this.play();
        });
    }
}

class uTransform{
    constructor(params={}){
        let defaults ={
            translation: "0 0 0",
            render: true,
            visible: true,
            bboxcenter: "0 0 0",
            bboxmargin: "0.01",
            bboxcolor: "1,1,0",
            center: "0,0,0",
            rotation: "0,0,0,0",
            scale:"1,1,1",
            scaleorientation: "0,0,0,0"
        }
        this.params = {...defaults, ...params};

        this.div = document.createElement("transform");
        setAttributes(this.div, this.params);

    }

    toOpenSCAD(scale){

        let v = X3DOM_to_OpenSCAD_vector(this.div, 'translation', scale);
        let scadStr = `\ntranslate${v})`
        
        return scadStr;

    }

    parse_X3DOM_vector(attrib, scale=1){
        let str = this.div.getAttribute(attrib);
        return parse_X3DOM_vector(str, scale);
    }

    appendChild(uObj){
        this.div.appendChild(uObj.div);
    }

    translate(x,y,z){
        this.div.setAttribute("translation", `${x} ${y} ${z}`);
    }

    isVisible(){
        return this.div.getAttribute("render") === "true" ? true : false;
    }

    hide(){
        this.div.setAttribute("render",'false');
    }

    show(){
        this.div.setAttribute("render",'true');
    }
}


class uAxes {
    constructor(params={}){
        this.axes = new uTransform();
        // this.group = document.createElement("group");
        // this.axes.div.appendChild(this.group);

        this.xAxis = addLine([[0,0,0], [1,0,0]]);
        this.xAxis.setEmissiveColor(255,0,0);
        this.yAxis = addLine([[0,0,0], [0,1,0]]);
        this.yAxis.setEmissiveColor(0,255,0);
        this.zAxis = addLine([[0,0,0], [0,0,1]]);
        this.zAxis.setEmissiveColor(0,0,255);

        this.axes.div.appendChild(this.xAxis.assemble());
        this.axes.div.appendChild(this.yAxis.assemble());
        this.axes.div.appendChild(this.zAxis.assemble());
    }

    assemble(){
        return this.axes.div;
    }

    translate(x,y,z){
        this.axes.translate(x,y,z);
    }

    switchVisibility(){
        let vis = this.axes.isVisible();
        console.log(vis);

        if (this.axes.isVisible()){
            this.axes.hide();
        } else {
            this.axes.show();
        }
    }

}


function addLine(pts){
    txt = '';
    for (pt of pts){
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];

        txt += `${x},${y},${z} `
    }
    
    coords = new uCoordinate({
        point: txt
    })
    
    line = new uLine();
    
    line.addCoords(coords)
    line.setVertexCount(pts.length);

    
    return line;
}

class uGroup extends uPrimitive{
    constructor(params={}){
        let defaults = {};
        params = {...defaults, ...params};

        super(params, "group");
    }

    appendChild(uObj){
        this.div.appendChild(uObj.div);
    }
}

class uLine extends uPrimitive{
    constructor(params={}){
        let defaults = {
            solid: true,
            ccw: true,
            usegeocache:"true",
            hashelpercolors: false
        }
        params = {...defaults, ...params};

        super(params, "lineset");
        
    }

    addCoords(uCoord){
        this.coords = uCoord;
        this.div.appendChild(uCoord.div);
    }
    setVertexCount(n){
        this.div.setAttribute("vertexCount", n);
    }
}

class uCoordinate {
    constructor(params={}){
        let defaults = {
            point: "0 0 0  1 0 0"
        }
        this.params = {...defaults, ...params};

        this.div = document.createElement("coordinate");
        setAttributes(this.div, this.params);
        
    }
}

function addBox(x=1,y=1,z=1){
    return new uBox({
        size: `${x} ${y} ${z}`
    })
}

class uBox extends uPrimitive{
    constructor(params={}){
        let defaults = {
            solid: true,
            ccw: true,
            usegeocache:"true",
            size: "2,2,2",
            hashelpercolors: false
        }
        params = {...defaults, ...params};

        super(params, "box");
        
    }

    toOpenSCAD(scale){
        let scadStr = "";

        //let dims = this.parse_X3DOM_vector("position", scale);

        let dims = this.parse_X3DOM_vector("size", scale);
        scadStr += `\n cube(${dims[0]},${dims[1]},${dims[2]});`

        return scadStr;

    }
}



class uSphere extends uPrimitive{
    constructor(params={}){
        let defaults = {
            solid: true,
            ccw: true,
            usegeocache:"true",
            lit: true,
            radius: 1.41,
            subdivision: "24,24"
        }
        params = {...defaults, ...params};

        super(params, "sphere");
    }

    toOpenSCAD(scale){
        let scadStr = "";

        //let dims = this.parse_X3DOM_vector("position", scale);

        let r = parseFloat(this.div.getAttribute("radius")) * scale;
        scadStr += `\n sphere( r = ${r});`

        return scadStr;

    }

}

class uCone extends uPrimitive{
    constructor(params={}){
        let defaults = {
            solid: true,
            ccw: true,
            usegeocache:"true",
            lit: true,
            bottomRadius: 1.5,
            top:true,
            subdivision: "32",
            height: 1
        }
        params = {...defaults, ...params};

        super(params, "cone");
    }

    toOpenSCAD(scale){
        let scadStr = "";

        //let dims = this.parse_X3DOM_vector("position", scale);

        let r = parseFloat(this.div.getAttribute("bottomRadius")) * scale;
        let h = parseFloat(this.div.getAttribute("height")) * scale;
        scadStr += `\n cylinder( r1 = ${r}, r2 = 0, h = ${h});`

        return scadStr;

    }

}

class uCylinder extends uPrimitive{
    constructor(params={}){
        let defaults = {
            solid: true,
            ccw: true,
            usegeocache:"true",
            lit: true,
            radius: 1,
            height: 2,
            top:true,
            bottom:true,
            side:true,
            subdivision: "32"
        }
        params = {...defaults, ...params};

        super(params, "cylinder");
    }

    toOpenSCAD(scale){
        let scadStr = "";

        //let dims = this.parse_X3DOM_vector("position", scale);

        let r = parseFloat(this.div.getAttribute("radius")) * scale;
        let h = parseFloat(this.div.getAttribute("height")) * scale;
        scadStr += `\n cylinder( r = ${r}, h = ${h});`

        return scadStr;

    }

}

class uProximitySensor{
    constructor(params={}){
        let defaults = {
            size: '5 5 5'
        }
        this.params = {...defaults, ...params};
        this.div = document.createElement('proximitysensor');
        setAttributes(this.div, this.params);
    }

    setSize(size){
        this.div.setAttribute("size", `${size} ${size} ${size}`)
    }

    addEventListener(event="isActive", func=undefined){
        console.log('prox', event, func)
        if (func !== undefined) {
            console.log('adding proximity sensor event')
            this.div.addEventListener(event, func);
        }
    }
}


class uViewpoint{
    constructor(params={}){
        let defaults = {
            //bind: false,
            description: 'none',
            position: "0. 0. 10.",
            orientation: "0. 0. 0. 0.",
            centerOfRotation: "0. 0. 0.",
            fieldOfView:"0.78540"
        }
        this.params = {...defaults, ...params};
        this.div = document.createElement('viewpoint');
        setAttributes(this.div, this.params);
        //this.div.setAttribute("id", "viewpointTest");
        this.description = this.params.description;
    }

    assemble(){
        return this.div;
    }

    bind(){
        
        this.div.setAttribute('set_bind','true');
    }

    addButton(targetDiv){
        this.button = document.createElement('input');
        let attribs = {
            type: 'button',
            value: this.description
        }
        setAttributes(this.button, attribs);
        this.button.addEventListener("click", () => {
            this.bind();
        })
        targetDiv.appendChild(this.button);
    }
}

// class veiwPointControler{
//     constructor(){
//         this.viewpoints = [];
//     }

//     addButtons
// }



function eulerToAxisAngle(rx, ry, rz) {
    //adapted from chatGPT

  rx = rx * Math.PI/180;
  ry = ry * Math.PI/180;
  rz = rz * Math.PI/180;
  // Step 1: compute rotation matrix from Euler angles (X → Y → Z)
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);

  // Rotation matrix R = Rz * Ry * Rx
  const m00 = cz * cy;
  const m01 = cz * sy * sx - sz * cx;
  const m02 = cz * sy * cx + sz * sx;

  const m10 = sz * cy;
  const m11 = sz * sy * sx + cz * cx;
  const m12 = sz * sy * cx - cz * sx;

  const m20 = -sy;
  const m21 = cy * sx;
  const m22 = cy * cx;

  // Step 2: extract axis-angle from rotation matrix
  const trace = m00 + m11 + m22;
  let angle = Math.acos(Math.min(1, Math.max(-1, (trace - 1) / 2)));

  // If angle is very small, return a default axis
  if (angle < 1e-6) {
    return {
      angle: 0,
      axis: { x: 1, y: 0, z: 0 }
    };
  }

  const denom = 2 * Math.sin(angle);

  const x = (m21 - m12) / denom;
  const y = (m02 - m20) / denom;
  const z = (m10 - m01) / denom;

  return {
    angle,
    axis: { x, y, z }
  };
}
