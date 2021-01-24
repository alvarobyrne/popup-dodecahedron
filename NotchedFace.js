class NotchedFace{
    constructor(svg,sidesAmount,isSingleNotch){
        this.isDebugging = true;
        this.isDebugging = false;
        this.facesDomContainer = document.createElement('div');
        document.body.appendChild(this.facesDomContainer);
        this.svgFaces = document.createElementNS("http://www.w3.org/2000/svg",'g');
        this.svgFaces.classList.add('face')
        this.facesDomContainer.appendChild(this.svgFaces);
        this.singleFacesGroup = document.createElementNS("http://www.w3.org/2000/svg",'g')
        this.singleFacesGroup.classList.add("single-face")
        svg.appendChild(this.singleFacesGroup);
        svg.appendChild(this.svgFaces);
        this.facesGroup = document.createElementNS("http://www.w3.org/2000/svg",'g');
        this.facesGroup.classList.add("faces-group")
        this.svgFaces.appendChild(this.singleFacesGroup);
        this.svgFaces.appendChild(this.facesGroup);
        if(this.isDebugging&&false){
            this.debugRect = document.createElementNS("http://www.w3.org/2000/svg",'rect');
            this.debugRect.setAttribute('width',20)
            this.debugRect.setAttribute('height',20)
            this.facesGroup.appendChild(this.debugRect);
        }
        this.sidesAmount = sidesAmount;
        // 
        this.sideLength = 300;
        this.faceRadius = -1;
        this.facesAmount = 12;
        this.facesColumns = 4;
        this.sides=3;
        this.isSingleNotch = isSingleNotch;
    }
    setForm(sides,length){
        //order matters
        this.setSides(sides);
        this.setLength(length);
    }
    setLength(lengthInPixels){
        // this.sideLength = to_mm(lengthInPixels);
        this.sideLength = lengthInPixels;
        const l = this.sideLength;
        const degreePerRadian = Math.PI / 180;
        const theta = this.theta;
        const radius = 0.5*l / Math.sin(theta * degreePerRadian*0.5);
        this.faceRadius=radius;
    }
    setSides(n){
        this.sidesAmount=n;
        const sides = this.sidesAmount;
        const theta = 360 / sides;
        this.theta = theta;

    }
    update(s,gap) {
        const sides = this.sidesAmount;
        this.singleFacesGroup.innerHTML = ""
        const facePath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        const gr   = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        const radius = this.faceRadius;
        if(this.isDebugging){
            const circle   = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            this.singleFacesGroup.appendChild(circle);
            circle.setAttribute("fill","none")
            circle.setAttribute("stroke","black")
            circle.setAttribute("r",radius)
        }
        this.singleFacesGroup.appendChild(gr);
        gr.appendChild(facePath);
        // const l = to_mm(length);
        const notchD = this.notchD;//poorly created public variable
        const l = this.sideLength;
        // const dToVertex = to_mm(notchD );
        const dToVertex = notchD;
        // const g       = to_mm(gap)
        const g       = gap;
        const h0      = dToVertex;
        const gHalves = g   * 0.5;
        const h00     = h0  - gHalves;
        const h01     = h0  + gHalves;
        const h1      = l   - dToVertex;
        const h10     = h1  - gHalves;
        const h11     = h1  + gHalves;
        const midDist = h10 - h01;
        const endDist = l   - h11;
        // const depth   = to_mm(s);
        const depth   = s;
        facePath.setAttribute('stroke','red')
        facePath.setAttribute('stroke-width',1)
        facePath.setAttribute('fill','none');
        let modelPoints = [];
        let midLeft = l * 0.5 - gHalves;
        let midRight = l * 0.5 + gHalves;
        if(this.isSingleNotch){
            modelPoints = [
                {X:0,Y:0},
                {X:midLeft,Y:0},
                {X:midLeft,Y:depth},
                {X:midRight,Y:depth},
                {X:midRight,Y:0},
                {X:l,Y:0}
            ]
        }else{
            modelPoints = [
                {X:0,Y:0},
                {X:h00,Y:0},
                {X:h00,Y:depth},
                {X:h01,Y:depth},
                {X:h01,Y:0},
                {X:h10,Y:0},
                {X:h10,Y:depth},
                {X:h11,Y:depth},
                {X:h11,Y:0},
                {X:l,Y:0}
            ];
            const minSep = this.notchPrecompute(s, gap)/mmppx;
            console.log('minSep: ', minSep);
        }
        const theta = this.theta;
        const degreePerRadian = Math.PI / 180;
        const outerAngleOffset = 90 + 0.5 * theta;
        let data = []
        for (let index = 0; index < sides; index++) {
            const angleDegree = theta * index; //+ outerAngleOffset2;
            const angle       = angleDegree * degreePerRadian;
            const x           = Math.cos(angle) * radius;
            const y           = Math.sin(angle) * radius;
            const clonePoints = modelPoints
            .map(point => rotate2D(point,-angleDegree- outerAngleOffset))
            .map(point => [point.X+x,point.Y+y])
            clonePoints.shift()
            data = [...data,...clonePoints]
        }
        this.data=data;
        let sidePathString = arrayToPath(data);
        let cuts;
        if(this.isSingleNotch){
            const cut0 = {X:midLeft -0.5,Y:0}
            const cut1 = {X:midRight+0.5,Y:0}
            cuts  = [[cut0, cut1]];
        }else{
            const cuts0 = [{ X: h00-0.5, Y: 0 }, { X: h01+0.5, Y: 0 }];
            const cuts1 = [{ X: h10-0.5, Y: 0 }, { X: h11+0.5, Y: 0 }];
            cuts  = [cuts0, cuts1];
        }
        for (let i = 0; i < cuts.length; i++) {
            const element = cuts[i];
            for (let index = 0; index < 5; index++) {
                const angleDegree = theta * index; //+ outerAngleOffset2;
                const angle       = angleDegree * degreePerRadian;
                const x           = Math.cos(angle) * radius;
                const y           = Math.sin(angle) * radius;
                const clonePoints = element
                    .map(point => rotate2D(point,-angleDegree- outerAngleOffset))
                    .map(point => [point.X+x,point.Y+y])
                const s = arrayToPath(clonePoints);
                sidePathString+=s;
            }
        }
        facePath.setAttribute('d',sidePathString);
        return gr;
    }
    setNotch(value){
        this.notchD = value;
    }
    setPosition(x,y){
        this.singleFacesGroup.setAttribute('transform',`translate(${x},${y})`)
        // this.update()
    }
    notchPrecompute(s,gap){
        const a = Math.PI / this.sidesAmount;
        const minh = 2*s*Math.tan(a)// see notch-distance.svg at docs folder
        const gHalves = gap / 2;
        const actualMin = minh + gHalves;
        this.notchMin = actualMin;
        return actualMin
        contrlrNotchD.min(actualMin);
        contrlrNotchD.max(sideLength*0.5-gap);
        if(notchD-gHalves<minh){
            notchD=actualMin;
        }
        contrlrNotchD.updateDisplay();
    }
}
class NotchedSide{
    constructor(l,svg,isMirror,isSingleNotch){
        this.sideLength = l;
        this.svg = svg;
        this.isMirror = isMirror;
        this.isSingleNotch = isSingleNotch;
    }
    getData(a){
        let l = this.sideLength;
        let svg = this.svg; 
        var notchD = 40;
        var g = 10;
        var s = 20;
        const depth   = s;
        const gHalves = g   * 0.5;
        let modelPoints = [];
        let data = [];
        if(this.isSingleNotch){
            let midLeft = l * 0.5 - gHalves;
            let midRight = l * 0.5 + gHalves;
            modelPoints = [
                {X:0,Y:0},
                {X:midLeft,Y:0},
                {X:midLeft,Y:depth},
                {X:midRight,Y:depth},
                {X:midRight,Y:0},
                {X:l,Y:0}
            ]
            data=[modelPoints]
            if(this.isMirror){
                data = [modelPoints,
                    [{X:midLeft,Y:0},
                    {X:midLeft,Y:-depth},
                    {X:midRight,Y:-depth},
                    {X:midRight,Y:0},
                ]]
            }
        }else{
            const dToVertex = notchD;
            const h0      = dToVertex;
            const h00     = h0  - gHalves;
            const h01     = h0  + gHalves;
            const h1      = l   - dToVertex;
            const h10     = h1  - gHalves;
            const h11     = h1  + gHalves;
            modelPoints = [
                {X:0,Y:0},
                {X:h00,Y:0},
                {X:h00,Y:depth},
                {X:h01,Y:depth},
                {X:h01,Y:0},
                {X:h10,Y:0},
                {X:h10,Y:depth},
                {X:h11,Y:depth},
                {X:h11,Y:0},
                {X:l,Y:0}
            ];
            // const minSep = this.notchPrecompute(s, gap)/mmppx;
            // console.log('minSep: ', minSep);
            data = [modelPoints]
            if(this.isMirror){
                data = [modelPoints,
                [{X:h00,Y:0},
                    {X:h00,Y:-depth},
                    {X:h01,Y:-depth},
                    {X:h01,Y:0}
                ],
                [{X:h10,Y:0},
                    {X:h10,Y:-depth},
                    {X:h11,Y:-depth},
                    {X:h11,Y:0}]
                ]
            }
        }
        return data;
    }
}