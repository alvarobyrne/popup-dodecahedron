function rotate2D(vector, angle) {
    var theta = angle * Math.PI / 180; // radians
    var matrix = [
        Math.cos(theta), Math.sin(theta),
        -Math.sin(theta), Math.cos(theta)
    ];
    return {

        X: matrix[0] * vector.X + matrix[1] * vector.Y,
        Y: matrix[2] * vector.X + matrix[3] * vector.Y
    }
}
function paths2string(paths, isClosing=true,scale) {
    var svgpath = "", i, j;
    if (!scale) scale = 1;
    for (i = 0; i < paths.length; i++) {
        for (j = 0; j < paths[i].length; j++) {
            if (!j) svgpath += "M";
            else svgpath += "L";
            svgpath += (paths[i][j].X / scale) + ", " + (paths[i][j].Y / scale);
        }
        if(isClosing)svgpath += "Z";
    }
    if (svgpath == "") svgpath = "M0,0";
    return svgpath;
}
function translate(vector, translation) {
    return {
        X: translation.X + vector.X,
        Y: translation.Y + vector.Y
    }
}
function scale(vector, factor) {
    return {
        X: factor * vector.X,
        Y: factor * vector.Y
    }
}
function getPolygonPointsSide(sides,sideSize, factor = 1) {
    const output = [];
    const alpha = Math.PI * 2 / sides;
    const beta = alpha / 2;
    const radius = sideSize / (2 * Math.sin(beta));
    return getPolygonPointsRadius(sides,radius, factor )
}
function getPolygonPointsRadius(sides,radius, factor = 1) {
    const output = [];
    const alpha = Math.PI * 2 / sides;
    for (let i = 0; i < sides; i++) {
        const angle = factor * i * alpha;
        const X = radius * Math.cos(angle);
        const Y = radius * Math.sin(angle);
        output.push({ X, Y })

    }
    return output;
}
function update() {
    cpr.Clear();
    popupGroupMain.innerHTML = "";
    const topFaceGroup = document.createElementNS(SVG_NS, 'g');
    popupGroupMain.appendChild(topFaceGroup)
    const innerSideLengthPX = to_px(innerSideLengthMM);
    const radiusMM = innerSideLengthMM/Math.sin(beta);
    polygonRadiusMM = radiusMM.toFixed(2);
    const radiusPX = to_px(radiusMM);
    const innerRadiusPX = to_px(innerRadiusMM);
    const outerSidePx = to_px(innerSideLengthMM + thicknessMM * tanBeta);
    const thicknessDiagonalMM = thicknessMM * tanBeta;
    const thicknessDiagonalPX = to_px(thicknessDiagonalMM);
    const polygonHeightMM = innerSideLengthMM / (2 * Math.tan(beta)) + thicknessMM*0.5;
    const polygonHeightPX = to_px(polygonHeightMM);
    let horizontalSeparationPX = radiusPX + polygonHeightPX + thicknessDiagonalPX+10;
    horizontalSeparationPX = radiusPX  + thicknessDiagonalPX+5;
    ///////////////////////////////
    const pointsInner = getPolygonPointsSide(SIDES_5,innerSideLengthPX,-1);
    const pointsOuter = getPolygonPointsSide(SIDES_5,outerSidePx);
    let subj_paths= [pointsInner,pointsOuter]
    cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);  // true means closed path
    ///////////////////////////////
    let singleBarData = [
        { X: 0, Y: crossThicknessMM },
        { X: polygonHeightMM, Y: crossThicknessMM },
        { X: polygonHeightMM, Y: 0 },
        { X: 0, Y: 0 }
    ]
    singleBarData = singleBarData.map((v) => {
        return translate(v, { X: 0, Y: -crossThicknessMM * 0.5 })
    }).map((v) => {
        return scale(v, mmppx)
    })
    const barsData = [];
    for (let index = 0; index < SIDES_5; index++) {
        
        const bar_data = singleBarData.map((v) => {
            return rotate2D(v, index * 360 / SIDES_5 + 36)
        })
        barsData.push(bar_data)
    }
    var pentagonSidesPoints;
    if(isNotchedFace){
        pentagonSidesPoints = [pointsOuter]
    }else{
        pentagonSidesPoints = [pointsInner,pointsOuter]
    }
    const pentagonPathString = paths2string(pentagonSidesPoints);
    
    if(isShowingOriginals){
        const pentagonPathString = paths2string([pointsInner,pointsOuter]);
        
        const pentagon = document.createElementNS(SVG_NS, 'path');
        pentagon.classList.add('guide')
        pentagon.setAttribute('id', 'pentagon');
        pentagon.setAttribute('d', pentagonPathString)
        pentagon.setAttribute('fill', 'none')
        pentagon.setAttribute('stroke', 'black')
        topFaceGroup.appendChild(pentagon);
        
        const barString = paths2string(barsData);
        const bar = document.createElementNS(SVG_NS, 'path');
        bar.classList.add('guide')
        topFaceGroup.appendChild(bar);
        bar.setAttribute('d',barString);
        bar.setAttribute('fill','none');
        bar.setAttribute('stroke','black');
    }
    const pointsInnerRadius = getPolygonPointsRadius(amountPointsInner,innerRadiusPX,-1);
    cpr.AddPaths(barsData, ClipperLib.PolyType.ptClip, true);
    cpr.AddPaths([pointsInnerRadius], ClipperLib.PolyType.ptClip, true);
    let clipType;
    clipType = ClipperLib.ClipType.ctIntersection;
    clipType = ClipperLib.ClipType.ctDifference;
    clipType = ClipperLib.ClipType.ctXor;
    clipType = ClipperLib.ClipType.ctUnion;
    const subjFillType = ClipperLib.PolyFillType.pftNonZero;
    const clipFillType = ClipperLib.PolyFillType.pftNonZero;
    var succeeded = cpr.Execute(clipType, solution_paths,subjFillType , clipFillType);
    const pentaCross = document.createElementNS(SVG_NS, 'path');
    topFaceGroup.appendChild(pentaCross);
    const crossString = paths2string(solution_paths);
    pentaCross.setAttribute('d',crossString);
    pentaCross.setAttribute('fill','none');
    pentaCross.setAttribute('stroke','red');
    ////////////////////////////////
    const innerHole = document.createElementNS(SVG_NS, 'circle');
    topFaceGroup.appendChild(innerHole);
    innerHole.setAttribute('cx',0)
    innerHole.setAttribute('cy',0)
    innerHole.setAttribute('fill','none')
    innerHole.setAttribute('stroke','red')
    const innerHoleRadiusPX = to_px(innerHoleRadiusMM);
    innerHole.setAttribute('r',innerHoleRadiusPX);
    
    
    const hingeHeightPX = to_px(hingeHeightMM);
    const hingeWidthPX = to_px(hingeWidthMM);
    const hingeHoleRadiusPX = to_px(hingeHoleRadiusMM);
    const hingeHoleSeparationPX = to_px(hingeHoleSeparationMM);
    const hingeHoleAirYPX = to_px(hingeHoleAirYMM);
    const hingeGroup = document.createElementNS(SVG_NS, 'g');
    const hingeTransform = `rotate(90) translate(${-hingeWidthPX * 0.5},${-hingeHeightPX * 0.5})`;
    hingeGroup.setAttribute('transform',hingeTransform)
    const hingeRect = document.createElementNS(SVG_NS, 'rect');
    topFaceGroup.appendChild(hingeGroup);
    hingeGroup.appendChild(hingeRect);
    hingeRect.classList.add('guide')
    hingeRect.setAttribute('x',0)
    hingeRect.setAttribute('y',0)
    hingeRect.setAttribute('fill','none')
    hingeRect.setAttribute('stroke','blue')
    hingeRect.setAttribute('width',hingeWidthPX)
    hingeRect.setAttribute('height',hingeHeightPX)
    const hingeHole0 = document.createElementNS(SVG_NS, 'circle');
    const hingeHole1 = document.createElementNS(SVG_NS, 'circle');
    hingeGroup.appendChild(hingeHole0);
    hingeGroup.appendChild(hingeHole1);
    hingeHole0.setAttribute('fill','none')
    hingeHole0.setAttribute('stroke','red')
    hingeHole1.setAttribute('fill','none')
    hingeHole1.setAttribute('stroke','red')
    hingeHole1.setAttribute('r',hingeHoleRadiusPX);
    hingeHole0.setAttribute('r',hingeHoleRadiusPX);
    hingeHole0.setAttribute('cx',hingeWidthPX*0.5 - hingeHoleSeparationPX * 0.5)
    hingeHole1.setAttribute('cx',hingeWidthPX*0.5 + hingeHoleSeparationPX * 0.5)
    hingeHole0.setAttribute('cy',hingeHeightPX*0.5+hingeHoleAirYPX)
    hingeHole1.setAttribute('cy',hingeHeightPX*0.5+hingeHoleAirYPX)
    let halfSide = innerSideLengthPX * 0.5;
    const airXPX = to_px(thicknessMM * Math.tan(beta)+hingeAirXMM)
    const airYPX = to_px(hingeAirYMM)
    const airSideYPX = to_px(hingeAirSidesYMM)
    halfSide-=airXPX;

    const t0 = hingeTransform + `translate(${+halfSide},${airYPX})`;
    const t1 = hingeTransform + `translate(${-halfSide},${airYPX})`;
    const t1Sides = hingeTransform + `translate(${-halfSide},${airSideYPX})`;
    const t0Sides = hingeTransform + `translate(${+halfSide},${airSideYPX})`;
    for (let index = 0; index < 5; index++) {
        const hingePair = document.createElementNS(SVG_NS, 'g');
        const clone0 = hingeGroup.cloneNode(true);
        const clone1 = hingeGroup.cloneNode(true);
        topFaceGroup.appendChild(hingePair);
        hingePair.appendChild(clone0);
        hingePair.appendChild(clone1);
        clone0.setAttribute('transform',t0)
        clone1.setAttribute('transform',t1)
        hingePair.setAttribute('transform',`rotate(${360/SIDES_5*index}) translate(${-polygonHeightPX},0)`)
    }
    const sideFaces = document.createElementNS(SVG_NS, 'g');
    const sideFace = document.createElementNS(SVG_NS, 'g');
    const pentagon = document.createElementNS(SVG_NS, 'path');
    pentagon.setAttribute('id', 'pentagon');
    pentagon.setAttribute('d', pentagonPathString)
    pentagon.setAttribute('fill', 'none')
    pentagon.setAttribute('stroke', 'red')
    sideFaces.setAttribute('transform',`translate(${horizontalSeparationPX},${0})`)
    popupGroupMain.appendChild(sideFaces);
    sideFaces.appendChild(sideFace);
    sideFace.appendChild(pentagon);
    //////////////////////////////////
    const centerCircle = document.createElementNS(SVG_NS, 'circle');
    sideFace.appendChild(centerCircle);
    centerCircle.setAttribute('fill','none')
    centerCircle.setAttribute('stroke','black')
    centerCircle.setAttribute('cx',0)
    centerCircle.setAttribute('cy',0)
    centerCircle.setAttribute('r',to_px(0.5))
    centerCircle.classList.add('guide')
    //////////////////////////////////
    let springHolePositionPX = to_px(springHolePositionMM);
    const springHole1 = document.createElementNS(SVG_NS, 'rect');
    sideFace.appendChild(springHole1);
    springHole1.setAttribute('fill','none')
    springHole1.setAttribute('stroke','red')
    springHole1.setAttribute('y',to_px(-3))
    springHole1.setAttribute('x',to_px(-1))
    springHole1.setAttribute('height',to_px(6))
    springHole1.setAttribute('width',to_px(2))
    springHole1.setAttribute('transform',`rotate(36) translate(${polygonHeightPX},${-springHolePositionPX})`)
    const springHole2 = document.createElementNS(SVG_NS, 'rect');
    sideFace.appendChild(springHole2);
    springHole2.setAttribute('fill','none')
    springHole2.setAttribute('stroke','red')
    springHole2.setAttribute('y',to_px(-3))
    springHole2.setAttribute('x',to_px(-1))
    springHole2.setAttribute('height',to_px(6))
    springHole2.setAttribute('width',to_px(2))
    springHole2.setAttribute('transform',`rotate(-36) translate(${polygonHeightPX},${springHolePositionPX})`)
    //////////////////////////////////
    if(isNotchedFace){

        const notchedFace = new NotchedFace(popupGroupMain, 5, isSingleNotch);
        let notchDepthPX= to_px(notchDepthMM)
        let notchSeparationPX= to_px(notchSeparationMM)
        let materialWidthPX= to_px(materialWidthMM)
        notchedFace.setNotch(notchSeparationPX)
        notchedFace.setForm(5,innerSideLengthPX)
        notchedFace.update(notchDepthPX,materialWidthPX)
        // notchedFace.setPosition(horizontalSeparationPX,0)
        sideFace.appendChild(notchedFace.singleFacesGroup);
    }else{

    }
    //////////////////////////////////
    const hingePair = document.createElementNS(SVG_NS, 'g');
    const clone0 = hingeGroup.cloneNode(true);
    const clone1 = hingeGroup.cloneNode(true);
    sideFace.append(hingePair);
    hingePair.appendChild(clone0);
    hingePair.appendChild(clone1);
    clone0.setAttribute('transform',t0Sides)
    clone1.setAttribute('transform',t1Sides)
    //////////////////////////////////
    hingePair.setAttribute('transform',` translate(${-polygonHeightPX},0)`)
    for (let index = 0; index < 9; index++) {
        const clone = sideFace.cloneNode(true);
        clone.setAttribute('transform',`translate(${horizontalSeparationPX*(index+1)},0)`)
        sideFaces.appendChild(clone)
    }
    //////////////////////////////////
    hingeGroup.remove();
    //////////////////////////////////
    const bottomFaceGroup = topFaceGroup.cloneNode(true);
    popupGroupMain.appendChild(bottomFaceGroup);
    bottomFaceGroup.setAttribute('transform',`translate(${0},${horizontalSeparationPX+20})`);
    let attachmentRadiusPX= to_px(attachmentRadiusMM)
    for (let index = 0; index < 5; index++) {
        const attachmentHole = document.createElementNS(SVG_NS, 'circle');
        bottomFaceGroup.appendChild(attachmentHole);
        attachmentHole.setAttribute('fill','none')
        attachmentHole.setAttribute('stroke','red')
        attachmentHole.setAttribute('cx',0)
        attachmentHole.setAttribute('cy',0)
        attachmentHole.setAttribute('r',to_px(1.5))
        attachmentHole.setAttribute('transform',`rotate(${36+72*index}) translate(${attachmentRadiusPX})`)
    }
}
function arrayToPath(points,isClosed=true){
    let dString = ["M "+points[0][0]+" "+points[0][1]];
    for (let index = 1; index < points.length; index++) {
        const point = points[index];
        const pointString = "L " + point[0] + " " + point[1];
        dString.push(pointString)
    }
    if(isClosed) dString = dString.join(" ")+" Z";
    return dString
}
function arrayToPath2(points,isClosed=true){
    let dString = ["M "+points[0].X+" "+points[0].Y];
    for (let index = 1; index < points.length; index++) {
        const point = points[index];
        const pointString = "L " + point.X + " " + point.Y;
        dString.push(pointString)
    }
    if(isClosed) dString = dString.join(" ")+" Z";
    return dString
}