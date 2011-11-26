var intervalFunc = new Array();

setInterval(function() {
	for (i=0; i<intervalFunc.length; i++) {
		f = intervalFunc[i];
		f();
	}
}, 100);


DataView = function() {
	this.rootNode = false;
	
	
	this.Render = function() {
		if (this.rootNode !== false) {
			renderer.Render(this.rootNode);
		}
	};
};


CanvasView = function(canvas) {
	DataView.call(this);
	this.canvas = canvas.getContext("2d");
	this.renderRun = new Array();
	this.fromCenter = 0;
	this.isRotating = true;
	this.rotation = 0;
	this.canvas.canvas.dv = this;
	
	this.renderListener = new Array();
	this.mouseActionListener = new Array();
	
	this.eventRun = new Array();
	
	
	
	this.canvas.canvas.addEventListener("mousemove",  function(e) {
		this.dv.mouseMove(e);
	}, true);
	
	this.canvas.canvas.addEventListener("click",  function(e) {
		this.dv.mouseClick(e);
	}, true);
	
	this.canvas.canvas.addEventListener("mousedown",  function(e) {
		this.dv.mouseDown(e);
	}, true);
	
	this.canvas.canvas.addEventListener("mouseup",  function(e) {
		this.dv.mouseUp(e);
	}, true);
	
	this.mouseDown = function(event) {
		if (this.rootNode === false) {
			return;
		}
		this.eventRun = new Array();
		this.checkMouseEvent("mousedown", this.rootNode, event);
		this.triggerMouseAction("mousedown", event);
		
	};
	
	this.mouseUp = function(event) {
		if (this.rootNode === false) {
			return;
		}
		this.eventRun = new Array();
		this.checkMouseEvent("mouseup", this.rootNode, event);
		this.triggerMouseAction("mouseup", event);
		
	};
	
	this.mouseMove = function(event) {
		if (this.rootNode === false) {
			return;
		}
		this.eventRun = new Array();
		this.checkMouseEvent("mousemove", this.rootNode, event);
		this.triggerMouseAction("mousemove", event);
		this.eventRun = new Array();
		this.checkMouseEvent("mouseover", this.rootNode, event);
		this.triggerMouseAction("mouseover", event);
		this.eventRun = new Array();
		this.checkMouseEvent("mouseout", this.rootNode, event);
		this.triggerMouseAction("mouseout", event);
	};
	
	this.mouseClick = function(event) {
		if (this.rootNode === false) {
			return;
		}
		this.eventRun = new Array();
		this.checkMouseEvent("click", this.rootNode, event);
		this.triggerMouseAction("click", event);
	};
	
	this.checkMouseEvent = function(e, node, event) {
		
		
		if (this.eventRun.indexOf(node) == -1) {
			this.eventRun.push(node);
		} else {
			return;
		}
		if (node.isRendered(event.offsetX, event.offsetY)) {
			if (e == "mousemove") {
				this.triggerMouseEvent(node, e, event);
			}
			
			if (e == "mouseover" && !node.isMouseOver) {
				this.triggerMouseEvent(node, e, event);
				node.isMouseOver = true;
			}
			
			if (e == "click") {
				this.triggerMouseEvent(node, e, event);
			}
			
			
		} else if (node.isMouseOver && e == "mouseout") {
			this.triggerMouseEvent(node, e, event);
			node.isMouseOver = false;
		}
		var i;
		for (i=0; i<node.bonds.length; i++) {
			this.checkMouseEvent(e, node.bonds[i].getFinishNode(), event);
		}
	};
	
	this.triggerMouseAction = function(e, event) {
		for (i=0; i<this.mouseActionListener.length; i++) {
			func = this.mouseActionListener[i];
			func(this, e, event);
		}
	};
	
	this.addMouseActionListener = function(f) {
		this.mouseActionListener.push(f);
	};
	
	this.triggerMouseEvent = function(node, event, args) {
		switch (event) {
			case "mousedown":
				f = node.mouseDown;
				break;
			case "mouseup":
				f = node.mouseUp;
				break;
			case "click":
				f = node.mouseClick;
				break;
			case "mouseover":
				f = node.mouseOver;
				break;
			case "mousemove":
				f = node.mouseMove;
				break;
			case "mouseout":
				f = node.mouseOut;
				break;
			default:
				return false;
				break;
		}
		var i;
		for (i=0; i<f.length; i++) {
			func = f[i];
			func(args, this, node);
		}
		return true;
	};
	
	this.setRootNode = function(node) {
		if (this.rootNode) {
			this.eventRun = new Array();
			this.fireEventTree(this.rootNode, "mouseout", null);
		}
		this.rootNode = node;
	};
	
	this.fireEventTree = function(node, e, event) {
		if (this.eventRun.indexOf(node) == -1) {
			this.eventRun.push(node);
		} else {
			return;
		}
		if (e == "mouseout" && node.isMouseOver) {
			this.triggerMouseEvent(node, e, event);
			node.isMouseOver = false;
		} else if (e != "mouseout") {
			this.triggerMouseEvent(node, e, event);
		}
		for (i=0; i<node.bonds.length; i++) {
			this.fireEventTree(node.bonds[i].getFinishNode(), e, event);
		}
	};
	
	this.Render = function(node) {
		this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
		
		
		
		
		if (!node) {
			node = this.rootNode;
		}
		
		if (node === false) {
			return;
		}
	
		this.renderRun = new Array();
		this.fromCenter = 0;
		if (this.isRotating) {
			this.rotation += (Math.PI*2/720);
		}
		this.renderNode(node, this.canvas.canvas.width/2, this.canvas.canvas.height/2);
		
		for (i=0; i<this.renderListener.length; i++) {
			func = this.renderListener[i];
			func(this);
		}
	};
	
	this.addRenderListener = function(f) {
		this.renderListener.push(f);
	};
	
	this.renderNode = function(node, centerX, centerY) {
		this.fromCenter++;
		if (this.renderRun.indexOf(node) == -1) {
			this.renderRun.push(node);
			var renderNum = 0;
			for (i=0; i<node.bonds.length; i++) {
				if (this.renderRun.indexOf(node.bonds[i].getFinishNode()) == -1) {
					renderNum++;
				}
			}
			var hasRendered = 0;
			var i;
			for (i=0; i<node.bonds.length; i++) {
				var y;
				var x;
				hasRendered++;
				y = Math.round(centerY + (node.bonds[i].arcLength/this.fromCenter) * Math.sin(2*Math.PI/renderNum*hasRendered+(this.rotation*this.fromCenter)));
				x = Math.round(centerX + (node.bonds[i].arcLength/this.fromCenter) * Math.cos(2*Math.PI/renderNum*hasRendered+(this.rotation*this.fromCenter)));
				if (this.renderRun.indexOf(node.bonds[i].getFinishNode()) == -1) {
					node.bonds[i].Render(this.canvas, x, y, centerX, centerY, this.fromCenter);
				}
				this.renderNode(node.bonds[i].getFinishNode(), x, y);
			}
			newC = node.Render(this.canvas, centerX, centerY, this.fromCenter);
		}
		this.fromCenter--;
	};
};



DataArc = function(fin) {
	this.arcFin = fin;
	this.size = 100;
};



DataNode = function() {
	this.bonds = new Array();
	this.size = 100;
	
	this.Bond = function(dataNode, twoWay) {
		var da;
		da = new DataArc(dataNode);
		this.bonds.push(d);
		
		if (twoWay) {
			dataNode.Bond(this);
		}
	};
	
};

CanvasPositionTweener = function() {
	this.tweenSpeed = 2;
	
	this.tweenPos = function(x, tX) {
		if (x > tX+3 || x < tX-3) {
			x += (tX-x)/this.tweenSpeed;
		} else {
			x = tX;
		}
		return x;
	};
};

CanvasNode = function() {
	DataNode.call(this);
	this.color = new Array(255, 255, 255, 1);
	this.size = 50;
	this.drawBG = true;
	
	this.icon = false;
	this.iconW = 256;
	this.iconH = 256;
	
	this.bonds = new Array();
	
	this.overrideX = false;
	this.overrideY = false;
	this.overrideW = false;
	this.overrideH = false;
	
	this.x = false;
	this.y = false;
	this.w = false;
	this.h = false;
	this.targetH = false;
	this.targetW = false;
	this.targetX = false;
	this.targetY = false;
	
	this.posTween = new CanvasPositionTweener();
	
	this.mouseOver = new Array();
	this.mouseOut = new Array();
	this.mouseDown = new Array();
	this.mouseUp = new Array();
	this.mouseClick = new Array();
	this.mouseMove = new Array();
	
	
	
	this.isMouseOver = false;
	
	this.addEventListener = function(type, func) {
		switch (type) {
			case "mousedown":
				this.mouseDown.push(func);
				break;
			case "mouseup":
				this.mouseUp.push(func);
				break;
			case "click":
				this.mouseClick.push(func);
				break;
			case "mouseover":
				this.mouseOver.push(func);
				break;
			case "mouseout":
				this.mouseOut.push(func);
				break;
			case "mousemove":
				this.mouseMove.push(func);
				break;
			default:
				return false;
				break;
		}
		return true;
	};
	
	this.removeEventListener = function(type, func) {
		switch (type) {
			case "mousedown":
				l = "mouseDown";
				break;
			case "mouseup":
				l = "mouseUp";
				break;
			case "click":
				l = "mouseClick";
				break;
			case "mouseover":
				l = "mouseOver";
				break;
			case "mousemove":
				l = "mouseMove";
				break;
			case "mouseout":
				l = "mouseOut";
				break;
			default:
				return false;
				break;
		}
		
		r = false;
		fl = this[l];
		this[l] = new Array();
		for (i=0; i<fl.length; i++) {
			if (fl[i] != func) {
				this[l].push(fl[i]);
			} else {
				r = true;
			}
		}
		return r;
	};
	
	this.Render = function(canvas, x, y, dist) {
		
		if (this.overrideW == false) {
			this.targetW = this.size/dist;
		} else {
			this.targetW = this.overrideW;
		}
		
		if (this.overrideH == false) {
			this.targetH = this.size/dist;
		} else {
			this.targetH= this.overrideH;
		}
		
		
		
		if (this.overrideX != false) {
			this.targetX = this.overrideX-(this.targetW/2);
		} else {
			this.targetX = x-(this.targetW/2);
		}
		
		if (this.overrideY != false) {
			this.targetY = this.overrideX-(this.targetH/2);
		} else {
			this.targetY = y-(this.targetH/2);
		}
		
		if (this.x === false && this.y === false) {
			this.h = this.targetH;
			this.w = this.targetW;
			this.x = this.targetX;
			this.y = this.targetH;
		}
		
		this.x = this.posTween.tweenPos(this.x, this.targetX);
		this.y = this.posTween.tweenPos(this.y, this.targetY);
		this.w = this.posTween.tweenPos(this.w, this.targetW);
		this.h = this.posTween.tweenPos(this.h, this.targetH);
		
		if (this.drawBG) {
			canvas.fillRect(this.x, this.y, this.w, this.h);
		}
		
		
		if (this.icon) {
			if ((i = this.isIconCached(this.icon)) === false) {
				i = new Image(this.icon);
				i.canvas = canvas;
				i.w = this.w;
				i.h = this.h;
				i.srcW = this.iconW;
				i.srcH = this.iconH;
				i.sx = this.w/this.iconW;
				i.sy = this.h/this.iconH;
				i.tx = this.x;
				i.ty = this.y;
				i.onload = function() {
					this.loaded = true;
					this.canvas.save();
					canvas.translate(this.tx, this.ty);
					canvas.scale(this.sx, this.sy);
					canvas.drawImage(this, 0, 0, this.srcW, this.srcH);
					canvas.restore();
				};
				i.loaded = false;
				i.src = this.icon;
				i.cacheSrc = this.icon;
				this.addIconCache(i);
			} else {
				i.w = this.w;
				i.h = this.h;
				i.srcW = this.iconW;
				i.srcH = this.iconH;
				i.sx = this.w/this.iconW;
				i.sy = this.h/this.iconH;
				i.tx = this.x;
				i.ty = this.y;
				i.onload();
				
			}
		}
		
		return new Array(this.x, this.y);
	};
	
	this.iconCache = new Array();
	
	this.addIconCache = function(icon) {
		this.iconCache.push(icon);
	};
	
	this.isIconCached = function(path) {
		for (i=0; i<this.iconCache.length; i++) {
			if (this.iconCache[i].cacheSrc == path && this.iconCache[i].loaded) {
				return this.iconCache[i];
			}
		}
		return false;
	};
	
	
	
	this.Bond = function(dataNode, twoWay) {
		var da;
		da = new CanvasArc(dataNode);
		this.bonds.push(da);
		
		if (twoWay) {
			dataNode.Bond(this);
		}
	};
	
	this.clearBonds = function() {
		this.bonds = new Array();
	};
	
	this.isRendered = function(x, y) {
		if (x > this.x && x < this.x+this.w && y > this.y && y < this.y+this.h) {
			return true;
		}
		return false;
	};
};

CanvasArc = function(fin) {
	//this.prototype = new DataArc(fin.prototype);
	DataArc.call(this, fin);
	this.arcLength = 100;
	
	this.color = new Array(0, 0, 0, 1);
	this.arcStyle = '';
	
	
	this.posTween = new CanvasPositionTweener();
	
	this.sX = false;
	this.sY = false;
	this.fX = false;
	this.fY = false;
	
	this.tsX = false;
	this.tsY = false;
	this.tfX = false;
	this.tfY = false;
	
	this.Render = function(canvas, x, y, fx, fy, dist) {
		this.tsX = x;
		this.tsY = y;
		this.tfX = fx;
		this.tfY = fy;
		
		if (this.sX === false && this.sY === false) {
			this.sX = this.tsX;
			this.sY = this.tsY;
			this.fX = this.tfX;
			this.fY = this.tfY;
		}
		this.sX = this.posTween.tweenPos(this.sX, this.tsX);
		this.sY = this.posTween.tweenPos(this.sY, this.tsY);
		this.fX = this.posTween.tweenPos(this.fX, this.tfX);
		this.fY = this.posTween.tweenPos(this.fY, this.tfY);
		
		
		canvas.beginPath();
		canvas.moveTo(this.sX, this.sY);
		canvas.lineTo(this.fX, this.fY);
		canvas.stroke();
	};
	
	this.getFinishNode = function() {
		return this.arcFin;
	};
};
