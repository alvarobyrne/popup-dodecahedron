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
function paths2string(paths, scale) {
    var svgpath = "", i, j;
    if (!scale) scale = 1;
    for (i = 0; i < paths.length; i++) {
        for (j = 0; j < paths[i].length; j++) {
            if (!j) svgpath += "M";
            else svgpath += "L";
            svgpath += (paths[i][j].X / scale) + ", " + (paths[i][j].Y / scale);
        }
        svgpath += "Z";
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
    const popupGroup = document.createElementNS(SVG_NS, 'g');
    popupGroupMain.appendChild(popupGroup)
    const innerSideLengthPX = to_px(innerSideLengthMM);
    const radiusMM = innerSideLengthMM/Math.sin(beta);
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
    const pentagonPathString = paths2string([pointsInner,pointsOuter]);
    
    if(isShowingOriginals){
        const pentagonPathString = paths2string([pointsInner,pointsOuter]);
        
        const pentagon = document.createElementNS(SVG_NS, 'path');
        pentagon.classList.add('guide')
        pentagon.setAttribute('id', 'pentagon');
        pentagon.setAttribute('d', pentagonPathString)
        pentagon.setAttribute('fill', 'none')
        pentagon.setAttribute('stroke', 'black')
        popupGroup.appendChild(pentagon);
        
        const barString = paths2string(barsData);
        const bar = document.createElementNS(SVG_NS, 'path');
        bar.classList.add('guide')
        popupGroup.appendChild(bar);
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
    popupGroup.appendChild(pentaCross);
    const crossString = paths2string(solution_paths);
    pentaCross.setAttribute('d',crossString);
    pentaCross.setAttribute('fill','none');
    pentaCross.setAttribute('stroke','red');
    ////////////////////////////////
    const innerHole = document.createElementNS(SVG_NS, 'circle');
    popupGroup.appendChild(innerHole);
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
    popupGroup.appendChild(hingeGroup);
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
    halfSide-=airXPX;

    const t0 = hingeTransform + `translate(${+halfSide},${airYPX})`;
    const t1 = hingeTransform + `translate(${-halfSide},${airYPX})`;
    for (let index = 0; index < 5; index++) {
        const hingePair = document.createElementNS(SVG_NS, 'g');
        const clone0 = hingeGroup.cloneNode(true);
        const clone1 = hingeGroup.cloneNode(true);
        popupGroup.appendChild(hingePair);
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
    const hingePair = document.createElementNS(SVG_NS, 'g');
    const clone0 = hingeGroup.cloneNode(true);
    const clone1 = hingeGroup.cloneNode(true);
    sideFace.append(hingePair);
    hingePair.appendChild(clone0);
    hingePair.appendChild(clone1);
    clone0.setAttribute('transform',t0)
    clone1.setAttribute('transform',t1)
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
    const bottomFace = popupGroup.cloneNode(true);
    popupGroupMain.appendChild(bottomFace);
    bottomFace.setAttribute('transform',`translate(${0},${horizontalSeparationPX+20})`)

}