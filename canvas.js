//over-runnging program max inputs ( 6 rows, 6 cols)


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var box = [], boxObj = [], boxScheme;
var dragPath = [];
var pathIndex = 0;
var boxIndex, currentIndex, startPosition;
var isMouseDown = false, solution;
var padding = 3;
var rows, cols, totalBoxes, eachBox, code, count;

document.getElementById('btn').addEventListener("click", function(event){
	document.getElementById('btn').disabled = true;
	rows = parseInt(document.getElementById('rows').value);
	cols = parseInt(document.getElementById('cols').value);
	totalBoxes = rows*cols;
	canvasSize();
	startPosition = Math.floor(Math.random()*totalBoxes);
	addBoxObjects();
	algorithm();
	drawBoard();
});

document.getElementById('btn-clear').addEventListener("click", function(event){
	document.getElementById('btn').disabled = false;
	location.reload();
});

function algorithm(){//this function is over-running
	count = 0;
	code = new Array(totalBoxes);
	dragPath[pathIndex++] = startPosition;
	while(count < 13){//because of this part
		currentIndex = nextIndex(dragPath[pathIndex-1]);
		if(currentIndex != -1){
			newPathFinder();
			dragPath[pathIndex++] = currentIndex;
		}
		if(pathIndex == totalBoxes - Math.min(rows, cols)){
			saveSolutions();
			pathIndex = 0;
			while(dragPath.length)
				dragPath.pop();
			dragPath[pathIndex++] = startPosition;
			count++;
		}
	}
	generateScheme();
	//console.log(code);
}

function nextIndex(prev){
	var random = [];
	random[0] = boxObj[prev].left;
	random[1] = boxObj[prev].up;
	random[2] = boxObj[prev].right;
	random[3] = boxObj[prev].down;

	return random[Math.floor(Math.random()*4)];
}

function saveSolutions(){
	code[count] = new Array(13);
	for(let i=0; i<pathIndex; i++)
		code[count][i] = dragPath[i];
}

function generateScheme(){
	boxScheme = new Array(totalBoxes);
	boxScheme.fill(0);
	var randomSolution = code[Math.floor(Math.random()*13)];
	console.log(randomSolution);
	for(let i=0; i<randomSolution.length; i++){
		for(let j=0; j<totalBoxes; j++){
			if(randomSolution[i] == j){
				boxScheme[j] = 1;
				break;
			}
		}
	}
}

function addBoxObjects(){
	var index = 0;
	for(let i=0; i<rows; i++){
		for(let j=0; j<cols; j++) {
			var obj = {left:-1, up:-1, right:-1, down:-1, x: padding +  eachBox/2, y: padding +  eachBox/2}
			if(j < cols-1)
				obj.right = index+1;
			if(j > 0)
				obj.left = index-1;
			if(i < rows-1)
				obj.down = index+cols;
			if(i > 0)
				obj.up = index-cols;
			obj.x += (padding + eachBox)*j;
			obj.y += (padding + eachBox)*i;
			boxObj[index] = obj;
			index++;
		}
	}
	//console.log(boxObj);
}

canvas.addEventListener('mousedown', function(event) {
	currentIndex = boxIndexFinder(event.offsetX, event.offsetY);
	if(currentIndex == dragPath[pathIndex-1]){
		isMouseDown = true;
	}
});

canvas.addEventListener('mousemove', function(event) {
	if(isMouseDown){
	  currentIndex = boxIndexFinder(event.offsetX, event.offsetY);
	  //move = { stay: dragPath[pathIndex-1], left:dragPath[pathIndex-1]-1, right:dragPath[pathIndex-1]+1, up:dragPath[pathIndex-1]-cols, down:dragPath[pathIndex-1]+cols}
	  if (currentIndex != undefined && currentIndex != dragPath[pathIndex-1] && boxScheme[currentIndex] != 0)
	  	fillMove();
	}
});

canvas.addEventListener('mouseup', function(event){
	if(isMouseDown){
		isMouseDown = false;
		//lastPosition = dragPath[pathIndex-1];
	}
	console.log(dragPath);
	console.log("last position: "+dragPath[pathIndex-1]);
});

function canvasSize(){
	const display_width = document.getElementById('display').offsetWidth;
	const display_height = document.getElementById('display').offsetHeight;

	const margin_px = 60;
	var maxi = Math.max(rows,cols);
	if (display_width > display_height){//landscape
		const min_height = display_height - margin_px - (maxi*padding);
		eachBox = Math.floor(parseInt(min_height)/parseInt(maxi));
	}
	else{
		const min_width = display_width - margin_px - (maxi*padding);
		eachBox = Math.floor(min_width / maxi);
	}

	canvas.width = (eachBox+padding)*cols + padding;
	canvas.height = (eachBox+padding)*rows + padding;
}

function fillDefault(){
	let x = padding, y = padding;
	ctx.fillStyle = 'green';
	for(let i=0; i<totalBoxes; i++){
		box[i] = new Path2D();
		box[i].rect(x, y, eachBox, eachBox);
		if(boxScheme[i] == 0)
			ctx.clearRect(x,y,eachBox, eachBox);
		else
			ctx.fill(box[i]);
		if(i%cols == cols-1){
			y += eachBox+padding;
			x = padding;
		}
		else
			x += eachBox+padding;
	}
}

function boxIndexFinder(x, y){
	for(let i=0; i<totalBoxes; i++)
		if(ctx.isPointInPath(box[i], x, y))
	    	return i;
}

function fillMove(){
	console.log('move');
	if(currentIndex == boxObj[dragPath[pathIndex-1]].left || currentIndex == boxObj[dragPath[pathIndex-1]].right || currentIndex == boxObj[dragPath[pathIndex-1]].up || currentIndex == boxObj[dragPath[pathIndex-1]].down){
		newPathFinder();
		dragPath[pathIndex++] = currentIndex;
		drawBoard();
	}
}

function drawBoard(){
	console.log('draw');
	fillDefault();
	ctx.fillStyle = 'blue';
	ctx.fill(box[startPosition]);
	ctx.fillStyle = 'skyblue';
	for(let i=1; i<pathIndex; i++){
		ctx.fill(box[dragPath[i]]);
		ctx.beginPath();
		ctx.setLineDash([7, 7]);
		ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'antiquewhite';
        ctx.lineWidth = 3;
		ctx.moveTo(boxObj[dragPath[i-1]].x, boxObj[dragPath[i-1]].y);
		ctx.lineTo(boxObj[dragPath[i]].x, boxObj[dragPath[i]].y);
		ctx.stroke();
		ctx.closePath();
	}
}

function newPathFinder(){
	for(let i=0; i<pathIndex; i++){
		if(currentIndex == dragPath[i]){
			while(dragPath.length > i)
				dragPath.pop();
			pathIndex = dragPath.length;
		}
	}
}
