const chokidar = require('chokidar');
chokidar.watch(['index.html'
    , 'main.js'
    , 'app.js'
]).on('change', () => { location.reload(); });
const SVG_NS = "http://www.w3.org/2000/svg";
var svg = document.createElementNS(SVG_NS, 'svg');

svg.setAttribute('xmlns', SVG_NS)
svg.setAttribute('id', 'svg')
svg.setAttribute('width', '600')
svg.setAttribute('height', '600')
document.body.appendChild(svg)
const ClipperLib = require('js-clipper');
console.log('ClipperLib: ', ClipperLib);
const cpr = new ClipperLib.Clipper();
console.log('cpr: ', cpr);

const popupGroupMain = document.createElementNS(SVG_NS, 'g');
popupGroupMain.setAttribute('id', 'pop-up')
const SIDES_5 = 5;
const alpha = Math.PI * 2 / SIDES_5;
const beta = alpha / 2;
const tanBeta = 2 * Math.tan(beta);

const mmppx = 3.7796;
function to_px(value) {
    return mmppx * value
}
var innerSideLengthMM = 53;
var thicknessMM = 7;
var crossThicknessMM = 5;
// pentagonPathString = pentagonPathStringInner;
// pentagonPathString = pentagonPathStringInner + pentagonPathStringOuter;
// pentagonPathString 
svg.appendChild(popupGroupMain)
const originX = 200;
const originY = 200;
popupGroupMain.setAttribute('transform', `translate(${originX},${originY})`)
const gui = new dat.GUI();
gui.add(this,'preExportSVG')
gui.add(this,'revertPreExportSVG')
gui.add({
    f: () => {
        preExportSVG();
        exportSVG();
    }
}, 'f').name('exportSVG');
let guides;
function preExportSVG(params) {
    guides = document.querySelectorAll(".guide");
    guides.forEach(element => {
        element.style.display="none";
    });
}
function revertPreExportSVG(params) {
    if(!guides)return;
    guides.forEach(element => {
        element.style.removeProperty("display");
    });

}
gui.add({
    f: () => {
        location.href = "clipper-example.html"
    }
}, 'f').name("clipper-example.html")
gui.width = 400;
var solution_paths = new ClipperLib.Paths();
var isShowingOriginals;
isShowingOriginals = false;
isShowingOriginals = true;
var innerRadiusMM = 10;
var innerHoleRadiusMM = 1.5;
var amountPointsInner = 10;
var hingeWidthMM = 25.4 / 2;
var hingeHeightMM = (hingeWidthMM-2) / 2;
console.log('hingeHeightMM: ', hingeHeightMM);
var hingeHoleSeparationMM = 8;
var hingeHoleRadiusMM = 1.1;
var hingeAirXMM = 1.5;
var hingeAirYMM = 0.8;//-(thicknessMM-hingeWidthMM)*0.5;
var hingeHoleAirYMM = 0;
update()


// console.log('barString: ', barString);

// cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);  // true means closed path
gui.add(this, 'innerSideLengthMM', 0, 60, 0.5).onChange(update)
gui.add(this, 'crossThicknessMM', 1, 60, 0.5).onChange(update)
gui.add(this, 'thicknessMM', hingeHeightMM, 60, 0.5).onChange(update)
gui.add(this, 'isShowingOriginals').onChange(update);
gui.add(this, 'innerRadiusMM', 1, 30).onChange(update);
gui.add(this, 'amountPointsInner', 3, 30, 1).onChange(update);
gui.add(this, 'innerHoleRadiusMM', 0.5, 10, 0.5).onChange(update);
const guiHinge = gui.addFolder('hinge');
guiHinge.open();
guiHinge.add(this, 'hingeWidthMM', 0.5, 40, 0.5).onChange(update);
guiHinge.add(this, 'hingeHeightMM', 0.5, 40, 0.5).onChange(update);
guiHinge.add(this, 'hingeHoleRadiusMM', 0.5, 40, 0.5).onChange(update);
guiHinge.add(this, 'hingeHoleSeparationMM', 0.5, 40, 0.5).onChange(update);
guiHinge.add(this, 'hingeAirXMM', 0, 40, 0.5).onChange(update);
guiHinge.add(this, 'hingeAirYMM', 0, 40, 0.1).onChange(update);
guiHinge.add(this, 'hingeHoleAirYMM', -2, 2, 0.1).onChange(update);
/*
var intervalID = setInterval(() => {
    innerSideLengthMM = 40 +Math.random()*70;
    update();
}, 2000);
*/