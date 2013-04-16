var ps, cloud, cloud_notes, cloud2,windowCounter=0, pick_vertices = new Object();
cloud2 = "NULL";
var buttonClicked = false;
var pick_texture , pick_renderbuffer, pick_framebuffer;
//cloud_temp = new Object();

// Create an orbit camera halfway between the closest and farthest point
var cam = new OrbitCam({closest:0.1, farthest:2000, distance: 50});
var isDragging = false;
var rotationStartCoords = [0, 0];

function zoom(amt){
 // var invert = document.getElementById('invertScroll').checked ? -1: 1;
 
  amt *= 10;
  
  if(amt < 0){
    cam.goCloser(-amt);
  }
  else{
    cam.goFarther(amt);
  }   

}

function mousePressed(){
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;  
  isDragging = true;  
}

function mouseReleased(){
  isDragging = false;
}

function render(){
	
	$("span#mouseX").html(ps.mouseX);
	$("span#mouseY").html(ps.mouseY);

	if(isDragging === true){		
		// how much was the cursor moved compared to last time
		// this function was called?
		var deltaX = ps.mouseX - rotationStartCoords[0];
		var deltaY = ps.mouseY - rotationStartCoords[1];

		// now that the camera was updated, reset where the
		// rotation will start for the next time this function is called.
		rotationStartCoords = [ps.mouseX, ps.mouseY];

		cam.yaw(-deltaX * 0.005);
		cam.pitch(deltaY * 0.005);
	}

	var c = cloud.getCenter();  
	ps.multMatrix(M4x4.makeLookAt(cam.position, cam.direction, cam.up));
	ps.translate(-cam.position[0]-c[0], -cam.position[1]-c[1], -cam.position[2]-c[2] );  
	ps.clear();				
	ps.render(cloud);   
	
	var gl = ps.getContext();	
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	//ps.render(cloud_notes);
	if (cloud2 != "NULL" && buttonClicked) {
		ps.render(cloud2);
	}
}

function decodeFromColor(r, g, b, a) {
  if (typeof(g) == "undefined") { g = r[1]; b = r[2]; a = r[3]; r = r[0]; }
  // b and a are reserved, see #encodeToColor
  
  var number = (g * 256) + r;
  return number;
}


// Compares Picked Color with Original Color
function compare(readout, color){
	return (Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 &&
	Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 &&
	Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
}


function render_pick() {
	var gl = ps.getContext();	
	var canvas = document.getElementById('canvas');
	var width = canvas.width;
	var height = canvas.height;	
	
	//var pick_texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, pick_texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA,
	gl.UNSIGNED_BYTE, null);
	//var pick_renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, pick_renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width,	height);	
	//var pick_framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, pick_framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
	gl.TEXTURE_2D, pick_texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
	gl.RENDERBUFFER, pick_renderbuffer);	

	// ---------------------- Picking starts on offscreen Framebuffer
	
	// MouseXY => WebGLXY
	var x = ps.mouseX;		
	var y = 800 - ps.mouseY;	
	var pixelValues = new Uint8Array(1*1*4);
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);
	
	// DEBUG Output
	if (pixelValues[0] != 0 && pixelValues[1] != 0 && pixelValues[2] != 0 && pixelValues[3] != 0) {
		$("span#pixelValues-0").html(pixelValues[0]);
		$("span#pixelValues-1").html(pixelValues[1]);
		$("span#pixelValues-2").html(pixelValues[2]);
		$("span#pixelValues-3").html(pixelValues[3]);		
	} else {		
		$("span#pixelValues-0").html("0");
		$("span#pixelValues-1").html("0");
		$("span#pixelValues-2").html("0");
		$("span#pixelValues-3").html("0");	
	}	
	
	
	// Cleanup
	/*
	gl.deleteTexture(texture);			
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	ps.clear();	
	*/
	
	/* --------------------------------- Offscreen Framebuffer ------------------------------- */		
	// 1. Offscreen Texture for storing Color Information

	/*var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA,
	gl.UNSIGNED_BYTE, null);
	
	// 2. Renderbuffer for depth Information
	var renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width,
	height);
	
	// 3. Final Step: Create Framebuffer and bind 1. and 2.	
	var framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
	gl.TEXTURE_2D, texture, 0);	
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
	gl.RENDERBUFFER, renderbuffer);	*/
	

/* --------------------------------- /Offscreen Framebuffer ------------------------------- */
	
	/*
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
*/
}

function start(){
  ps = new PointStream();  
  ps.setup(document.getElementById('canvas')); 
  //ps.resize(1200,800,{preserveDrawingBuffer: true});
  ps.background([0, 0, 0, 0.1]);
  ps.pointSize(35);
  
  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;  
  ps.registerParser("ply", PLYParser);  
  //http://efrata.ikg.uni-hannover.de/geovis2/dataset1/00000040_ffffffb5_ascii.ply    
  cloud = ps.load("andor.ply");
  
  	var gl = ps.getContext();	
	pick_texture = gl.createTexture();
	pick_renderbuffer = gl.createRenderbuffer();
	pick_framebuffer = gl.createFramebuffer();

  //var defaultV = ps.getShaderStr("shaders/default.vs");
  //var defaultF = ps.getShaderStr("shaders/default.fs");  
  //progPicking = ps.createProgram(defaultV, defaultF);
  //ps.useProgram(progPicking);   
  
  //cloud2 = ps.load("andor2.ply");
  //cloud_notes = ps.load("empty.ply");
}

