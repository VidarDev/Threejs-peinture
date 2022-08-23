"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

// Tableau 3D: "La Reproduction interdite"
// DUT Info - 2021/2022
// Cree par T. Richier (Universite de Lorraine / IUT de Saint-Die, Dpt Info)

// ---------------
// Les variables global du projet

var camera, scene, renderer, gui, stats;
var cameraControls, effectController, cubeRenderTarget;
var clock = new THREE.Clock();
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = false;
var ground = false;
var canvasWidth = 400;
var canvasHeight = 503;
var cube;
var body, mur, clone;
var colorBG = 0x060E1A;
var far = 30000;
var near = 0.2;
var groundTexture;
var spotlight, pointLight, pointLight2, helper;
var miroirCamera, miroir;
var shader_sphere, earth_sphere;
var portail;
var animation = 0;
var temps = 0;
var box;
var tabcube = Array(10);
var V = Array(30);
var raycasterClick;
const pointerClick = new THREE.Vector2();
let sceneMeshes = [];


for( var j = 0; j < 30; j++ ) {
    V[j] = Math.random() / 20;
}


// ---------------
// Les shaders 

// Le vertex shaders
var _VS = `

varying vec3 v_Normal;

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	v_Normal = normal;
}
`;

// Le fragment shaders
var _FS = `

varying vec3 v_Normal;

void main(){
	gl_FragColor = vec4(v_Normal, 1.0);
}
`;


// ---------------
// Les variables de reset du GUI

var resetCamera = {
    reset: function() {
        // Camera
	    camera.position.set( 0, 630, -100 );
	    cameraControls.target.set( 100, 630, 300 );
    }
};

var spotCamera1 = {
    spot: function() {
        // Camera
	    camera.position.set( 200, 630, -1000 );
	    cameraControls.target.set( 200, 630, 0 );
    }
};

var resetPeronnage = {
    reset: function() {
        effectController.personnageAngle = 10.0;
    }
};

// ---------------
// Les Textures

// Le sol
var bois_Texture = new THREE.TextureLoader().load( 'texture/Bois.jpg' );
var wrapVal = THREE.RepeatWrapping;

bois_Texture.wrapS = wrapVal;
bois_Texture.wrapT = wrapVal;
bois_Texture.repeat.set( 10, 10 );

var bois_normalTexture = new THREE.TextureLoader().load( 'texture/Bois_Normal.jpg' );
var wrapVal1 = THREE.RepeatWrapping;

bois_normalTexture.wrapS = wrapVal1;
bois_normalTexture.wrapT = wrapVal1;
bois_normalTexture.repeat.set( 10, 10 );

// Les mur
var mur_normalTexture = new THREE.TextureLoader().load( 'texture/Mur_Normal.jpg' );
var wrapVal2 = THREE.RepeatWrapping;

mur_normalTexture.wrapS = wrapVal2;
mur_normalTexture.wrapT = wrapVal2;
mur_normalTexture.repeat.set( 20, 20 );

// Le meuble
var marbreRose_Texture = new THREE.TextureLoader().load( 'texture/Marbre_Rose.jpg' );
var wrapVal3 = THREE.RepeatWrapping;

marbreRose_Texture.wrapS = wrapVal3;
marbreRose_Texture.wrapT = wrapVal3;

var marbreBlanc_Texture = new THREE.TextureLoader().load( 'texture/Marbre_Blanc.jpg' );
var wrapVal4 = THREE.RepeatWrapping;

marbreBlanc_Texture.wrapS = wrapVal4;
marbreBlanc_Texture.wrapT = wrapVal4;

// Le cadre du miroir
var or_normalTexture = new THREE.TextureLoader().load( 'texture/Or.jpg' );
var wrapVal5 = THREE.RepeatWrapping;

or_normalTexture.wrapS = wrapVal5;
or_normalTexture.wrapT = wrapVal5;
or_normalTexture.repeat.set( 3, 3 );

var or_Texture = new THREE.TextureLoader().load( 'texture/Or_Normal.jpg' );
var wrapVal6 = THREE.RepeatWrapping;

or_Texture.wrapS = wrapVal6;
or_Texture.wrapT = wrapVal6;
or_Texture.repeat.set( 3, 3 );

// Le livre de 
var livre_Texture = new THREE.TextureLoader().load( 'texture/Livre.jpg' );
var livre_normalTexture = new THREE.TextureLoader().load( 'texture/Livre_Normal.jpg' );

// La planete Terre
var earth_Texture = new THREE.TextureLoader().load( 'texture/Earth.jpg' );
var earth_normalTexture = new THREE.TextureLoader().load( 'texture/Earth_Normal.jpg' );

// Le portail de Rick et Morty
var portail_Texture = new THREE.TextureLoader().load( 'texture/Portail.png' );
var portail_normalTexture = new THREE.TextureLoader().load( 'texture/Portail_Normal.png' );


// ---------------
// Les fonctions d'objet 3D

// Les fonction regroupeant les murs
function createMur() {
	var mur = new THREE.Object3D();
	mur.add( createMurGauche() );
	mur.add( CreateMurDroite() );
	mur.add( CreateMurDevant() );
	mur.add( CreateMurDerriere() );

	// Mise en place des ombres sur le mur
	mur.traverse( function ( obj ) {
		if ( obj instanceof THREE.Mesh ){
			obj.castShadow = false; // default is false
			obj.receiveShadow = false; // default is false
		}
	});

	return mur;
}

// Le mur de gauche
function createMurGauche() {
	var mur = new THREE.Object3D();
	var murMaterial = new THREE.MeshPhongMaterial( { color: 0x504436, normalMap: mur_normalTexture } );
	var w, l, h;
	w = 20;
	h = 2000;
	l = 1200;

	var cube = new THREE.Mesh( new THREE.BoxGeometry( w, h, l ), murMaterial );
	mur.add( cube );
	mur.position.set( 740, (h/2), -150 );
	return mur;
}

// Le mur a l'avant
function CreateMurDevant() {
	var mur = new THREE.Object3D();
	var murMaterial = new THREE.MeshPhongMaterial( { color: 0x504436, normalMap: mur_normalTexture } );
	var w, l, h;
	w = 1200;
	h = 2000;
	l = 20;

	var cube = new THREE.Mesh( new THREE.BoxGeometry( w, h, l ), murMaterial );
	mur.add( cube );
	mur.position.set( 150, (h/2), 440 );
	return mur;
}

// Le mur de droite
function CreateMurDroite() {
	var mur = new THREE.Object3D();
	var murMaterial = new THREE.MeshPhongMaterial( { color: 0x504436, normalMap: mur_normalTexture} );
	var w, l, h;
	w = 20;
	h = 2000;
	l = 1200;

	var cube = new THREE.Mesh( new THREE.BoxGeometry( w, h, l ), murMaterial );
	mur.add( cube );
	mur.position.set( -440, (h/2), -150 );
	return mur;
}

// Le mur en arriere
function CreateMurDerriere() {
	var mur = new THREE.Object3D();
	var murMaterial = new THREE.MeshPhongMaterial( { color: 0x504436, normalMap: mur_normalTexture } );
	var w ,l ,h;
	w = 1200;
	h = 2000;
	l = 20;

	var cube = new THREE.Mesh( new THREE.BoxGeometry( w, h, l ), murMaterial );
	mur.add( cube );
	mur.position.set( 150, (h/2), -740 );
	return mur;
}

// Le Sol
function createSol() {
	var sol = new THREE.Object3D();
	var solMaterial = new THREE.MeshPhongMaterial( { map: bois_Texture, normalMap: bois_normalTexture } );
	var w, l, h;
	w = 1200;
	h = 20;
	l = 1200;

	var cube = new THREE.Mesh( new THREE.BoxGeometry( w, h, l ), solMaterial );
	sol.add( cube );
	sol.position.set( 150, 0, -150 );
	// Mise en place des ombres sur le sol
	sol.traverse( function ( obj ) {
		if ( obj instanceof THREE.Mesh ){
			obj.castShadow = false; // default is false
			obj.receiveShadow = true; // Il affiche les ombres sur sa surface
		}
	});
	return sol;
}

// La planete en shader + la planete Terre
function createPlanet(){

	var planet = new THREE.Object3D();
	var earthMaterial = new THREE.MeshPhongMaterial( { transparent: true, opacity: 0.9, map: earth_Texture, normalMap: earth_normalTexture, shininess: 100 } );

	earth_sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 500, 500, 500 ), earthMaterial );
	earth_sphere.position.x = 200;
	earth_sphere.position.y = 3000;
	earth_sphere.position.z = -200;
	planet.add( earth_sphere );

	shader_sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 300, 300, 300 ),
		// Mise en place du fragment et vertex shaders
		new THREE.ShaderMaterial({
			uniforms: { },
			vertexShader: _VS,
			fragmentShader: _FS,
		}),
	);
	shader_sphere.position.x = 1200;
	shader_sphere.position.y = 3000;
	shader_sphere.position.z = 1000;
	planet.add( shader_sphere );

	return planet;
}

function createPortail(){

	portail = new THREE.Object3D();
	var portailMaterial = new THREE.SpriteMaterial( { transparent: true, map: portail_Texture, normalMap: portail_normalTexture, opacity: 0.9 } );
	
	var portail_1 = new THREE.Sprite( portailMaterial ); 
	portail_1.scale.set( 600, 800, 600 );
	portail_1.position.x = 200; 
	portail_1.position.y = 1000; 
	portail_1.position.z = -200; 
	portail.add( portail_1 );
	
	return portail;
}

// Le meuble
function createMeuble() {
	var meuble = new THREE.Object3D();
	var plateau = new THREE.Object3D();

	var baseMaterial = new THREE.MeshPhongMaterial( { map: marbreRose_Texture} );
	var plateauMaterial = new THREE.MeshPhongMaterial( { map: marbreBlanc_Texture } );

	var w, l, h;
	w = 1000;
	h = 320;
	l = 120;

	var cube = new THREE.Mesh( new THREE.BoxGeometry( w, h, l ), baseMaterial );
	meuble.add( cube );
	cube = new THREE.Mesh( new THREE.BoxGeometry( 1050, 15, 140 ), plateauMaterial );
	plateau.add( cube );
	plateau.position.set( 0, 165, -10 );

	meuble.add( plateau );
	meuble.position.set( 150, (h/2), 380 );
	// Mise en place des ombres sur le meuble
	meuble.traverse( function ( obj ) {
		if ( obj instanceof THREE.Mesh ){
			obj.castShadow = false; // default is false
			obj.receiveShadow = true; // Il affiche les ombres sur sa surface
		}
	});
	return meuble;
}

// Le cadre du miroir
function createCadre() {
	var cadre = new THREE.Object3D();
	var cadreMaterial = new THREE.MeshPhongMaterial( { color: 0xccac00, map: or_Texture, normalMap: or_normalTexture } );
	var w, l, h;
	w = 60;
	h = 1050;
	l = 10;
	var cube = new THREE.Mesh( new THREE.BoxGeometry( w, h, l ), cadreMaterial );
	cube.position.set( 600, 0, 0 );
	cadre.add( cube );
	cube = new THREE.Mesh( new THREE.BoxGeometry( 60, 1050, 10 ), cadreMaterial );
	cube.position.set( -300, 0, 0 );
	cadre.add( cube );
	cube = new THREE.Mesh( new THREE.BoxGeometry( 840, 60, 10 ), cadreMaterial );
	cube.position.set( 150, 495, 0 );
	cadre.add( cube );
	cube = new THREE.Mesh( new THREE.BoxGeometry( 840, 60, 10 ), cadreMaterial );
	cube.position.set( 150, -470, 0 );
	cadre.add( cube );
	// Mise en place des ombres sur le cadre
	cadre.traverse( function ( obj ) {
		if ( obj instanceof THREE.Mesh ){
			obj.castShadow = false; // default is false
			obj.receiveShadow = true; // Il affiche les ombres sur sa surface
		}
	});

	cadre.position.set( 0, 830, 430 );
	return cadre;
}

// Le miroir
function mirror () {
	var miroirMaterial = new THREE.MeshBasicMaterial( { envMap:cubeRenderTarget.texture } );
	miroir = new THREE.Mesh( new THREE.BoxGeometry( 840, 905, 0.01, 10, 10, 10 ), miroirMaterial );
	miroir.position.set( 150, 841, 425 );
    miroirCamera.position.set( 90150, 620, -180 );
	miroirCamera.rotation.y = 3.15;
    scene.add( miroir );
}

// Le personnage
function createPersonnage() {
	var personnage = new THREE.Object3D();
	var loader = new THREE.OBJLoader();
	var materiauLoader = new THREE.MTLLoader();
    // Charger le fichier
	materiauLoader.path = '3D/';
	// MTL : Fichier appliquant la texture
	materiauLoader.load( 'personnage.mtl', function( materials ) {
		materials.preload();
		loader.setMaterials( materials );
		loader.path = '3D/';
		loader.load( 'personnage.obj',
			function ( object ) {
				object.traverse( function ( obj ) {
					// Mise en place des ombres sur le personnage
					if ( obj instanceof THREE.Mesh ) {
						obj.castShadow = true; // Il devienne un objet que creer une ombre
						obj.receiveShadow = false; // default is false
						obj.shininess = 150;
						obj.specular= 0x222222;
					}
				});
				object.scale.set( 400, 410, 400 );

				personnage.add( object );
			});
		});
	return personnage;
}

// Le livre de "The Narrative of Arthur Gordon Pym of Nantucket"
function createLivre() {
	var livre = new THREE.Object3D();
	var loader = new THREE.OBJLoader();
    // Charger le fichier
    loader.load( '3D/livre.obj',
        function ( object ) {
			object.traverse( function ( obj ) {
				if ( obj instanceof THREE.Mesh ){
					obj.material.map = livre_Texture;
					obj.material.normalMap = livre_normalTexture;
					//obj.material.color.set(0x54724e);
					obj.castShadow = true;
					obj.receiveShadow = true;
				}
			});
			object.scale.set( 50, 50, 50 );
			livre.position.set( -120, 315, 365 );
			object.rotateY( -3.4 );

            livre.add( object );
        }
	);
	return livre;
}

// Duplication de la scene pour le miroir (car nous ne pouvons pas filter les objets que l'on veux afficher avec la camera)
function createIllusion() {
	var illusion = new THREE.Object3D();
	illusion.add( createMur() );
	illusion.add( createSol() );
	illusion.add( pointLight );
	
	clone = new THREE.Object3D();
	clone.add( createPersonnage() );
	clone.position.set( 115, -8, 120 );
	illusion.add( clone );
	return illusion;
}

function tweeningUpdate(){
    
    var current = { x: 0 };

    var update = function(){
        for ( let index = 0; index < 10 ; index++ ) {
            tabcube[index].position.x += V[index];
            tabcube[index].position.y += V[index + 10];
            tabcube[index].position.z += V[index + 20];
            tabcube[index].scale.x = 3 - Math.abs( current.x ) * 2.5 / 10;  
            tabcube[index].scale.y = 3 - Math.abs( current.x ) * 2.5 / 10;  
            tabcube[index].scale.z = 3 - Math.abs( current.x ) * 2.5 / 10;  
        }
    }

    var tweenDebut = new TWEEN.Tween( current )
        .to( { x: -10 }, 1500 )
        .delay( 200 )
        .easing( TWEEN.Easing.Quartic.InOut )
        .onUpdate( update )

    var tweenFin = new TWEEN.Tween( current )
        .to( { x: 10 }, 2500 )
        .delay( 200 )
        .easing( TWEEN.Easing.Quartic.InOut )
        .onUpdate( update )

    tweenDebut.chain( tweenFin )
    tweenFin.chain( tweenDebut )

    tweenDebut.start()
}

function tweeningBox(){

    for(var i = 0; i < 10; i++) {
        var cubeColor = new THREE.Color( Math.random(), Math.random(), Math.random() );
        var cubeMaterial = new THREE.MeshPhongMaterial( { color: cubeColor} ) ;

        box = new THREE.Mesh(
            new THREE.BoxGeometry( 50, 50, 50 ), cubeMaterial );
        box.position.x = -800 + Math.floor( Math.random() * 200 );
        box.position.y = 500 + Math.floor( Math.random() * 200 );
        box.position.z = 800 + Math.floor( Math.random() * 200 );
        box.rotation.x = Math.cos( Math.PI / 4 );
        box.rotation.z = Math.sin( Math.PI / 4 );
        box.userData.clicked = false;
        sceneMeshes.push( box );
        tabcube[i] = box;
        scene.add( tabcube[i] );
    }

}


// ---------------
// Initialisation

function init() {
	canvasWidth;
	canvasHeight;

	var canvasRatio = canvasWidth / canvasHeight;

	// Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColor( colorBG, 1 );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap ;

	// Camera
	camera = new THREE.PerspectiveCamera( 90, canvasRatio, near, far );
	camera.position.set( 0, 630, -100 );
	
	// Controles
	cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.target.set( 100, 630, 300 );

	// Miroir
	cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 1000, { generateMipmaps: true} );
	miroirCamera = new THREE.CubeCamera( 0.5, 1000, cubeRenderTarget );
	miroirCamera.matrixWorldInverse; 

    // STATS
    stats = new Stats();
    stats.setMode( 0 );

	fillScene();
}

// ---------------
// Creation de la scene

function fillScene() {
	
	// La scene
	scene = new THREE.Scene();
    scene.fog = new THREE.Fog( colorBG, far / 2, far / 1.5 ); // Creer l'effet de brouillard en depassant le far

	// Les Lumieres
	var ambientLight = new THREE.AmbientLight( 0x333333 );
	scene.add( ambientLight );

	spotlight = new THREE.SpotLight( 0xffffff, 0.6 );
	spotlight.position.set( 400, 1200, -600 );
	spotlight.angle = 0.90 * Math.PI / 2;
	spotlight.castShadow = true;
	spotlight.shadowBias= 0.00001;
	spotlight.shadow.focus = 0.3; // default
	spotlight.shadow.mapSize.width = 512;
	spotlight.shadow.mapSize.height = 512;
	spotlight.shadow.camera.near = 0.5;
	spotlight.shadow.camera.far = 2000;
	scene.add( spotlight );
	
	pointLight = new THREE.PointLight( 0xffffff, 1, 3000 );
	pointLight.position.set( -600, 1200, -600 );
	scene.add( pointLight );

	pointLight2 = new THREE.PointLight( 0xffffff, 10, 12000 );
	pointLight2.position.set( 400, 12000, -600 );
	scene.add( pointLight2 );

	// La visualisation des parametres de la spotlight
	helper = new THREE.CameraHelper( spotlight.shadow.camera );
	helper.visible;
	scene.add( helper );
	
	// Le fond etoile
	scene.background = new THREE.CubeTextureLoader()
	.setPath( 'texture/skybox/' )
	.load([	'px.jpg', 'nx.jpg',
			'py.jpg', 'ny.jpg',
			'pz.jpg', 'nz.jpg']);

    // Le plateau miroir (mer) 
    var loader = new THREE.TextureLoader();
    groundTexture = loader.load( 'texture/Mur_Normal.jpg' );

    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    var ground = new THREE.PlaneGeometry( 500000, 500000, 100, 100 );
    var solidGround = new THREE.Mesh( ground, new THREE.MeshBasicMaterial ( { envMap: groundTexture, shininess: 100, specular: 0x111111,} ) );
    
    solidGround.rotation.x -= Math.PI * 0.5;
	// Mise en place des ombres sur la mer
	solidGround.traverse( function ( obj ) {
		if ( obj instanceof THREE.Mesh ){
			obj.castShadow = false; // default is false
			obj.receiveShadow = true; // default is false
		}
	});

    scene.add( solidGround );

	// Mise en place des objets 3D
	mur = createMur();
    mur.visible;
	scene.add( mur );

	var sol = createSol();
	scene.add( sol );

	var meuble = createMeuble();
	scene.add( meuble );

	var cadre = createCadre();
	scene.add( cadre );

	var livre = createLivre();
	scene.add( livre );
	
	body = createPersonnage();
	body.position.set( 115, -8, 120 );
	scene.add( body );

	var illusion = createIllusion();
	illusion.position.set( 90000, 0, 0 );
	scene.add( illusion );

	var portail = createPortail();
	scene.add( portail );

	var planet = createPlanet();
	scene.add( planet );

	mirror();

	tweeningBox();
	tweeningUpdate();

}


// ---------------
// addToDOM
function addToDOM() {
	var container = document.getElementById( 'webGL' );
	var canvas = container.getElementsByTagName( 'canvas' );
	if ( canvas.length > 0 ) {
		container.removeChild( canvas[0] );
	}
	container.appendChild( renderer.domElement );
    document.getElementById( "stats" ).appendChild( stats.domElement );
}

function drawHelpers() {
	if ( gridX ) {
		Coordinates.drawGrid( { size: 10000, scale: 0.01, orientation: "x" } );
	}
	if ( gridY ) {
		Coordinates.drawGrid( { size: 10000, scale: 0.01, orientation: "y" } );
	}
	if ( gridZ ) {
		Coordinates.drawGrid( { size: 10000, scale: 0.01, orientation: "z" } );
	}
	if ( axes ) {
		Coordinates.drawAllAxes( { axisLength: 500, axisRadius: 15, axisTess: 50 } );
	}
}

// ---------------
// La fonction animate
function animate() {
	TWEEN.update();
	window.requestAnimationFrame( animate );

	for(var k = 0; k < 10; k++) {
        var t = tabcube[k];
        if (t.position.x >= 500 || t.position.x <= -500){
            V[k] = -V[k];
        }
        if (t.position.y >= 500 || t.position.y <= -500){
            V[k+10] = -V[k+10];
        }
        if (t.position.z >= 500 || t.position.z <= -500){
            V[k+20] = -V[k+20];
        }
    }

	stats.update();
	render();
}

// ---------------
// Le centre des interactions du projet (loop)
function render() {
	var delta = clock.getDelta();
	cameraControls.update( delta );
    
	// Affichage de XYZ
	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newAxes !== axes )
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		axes = effectController.newAxes;		

		fillScene();
		drawHelpers();
	}

	// Le Zoom x2
	if ( effectController.zoom ) {
        if ( webGL.className === "" ) {
            renderer.setSize( window.innerHeight*0.8, window.innerHeight );
            webGL.className = "display-full";
        }
    } else {
        if ( webGL.className === "display-full" ) {
            renderer.setSize( canvasWidth, canvasHeight );
            webGL.className = "";
        }
    }
	
	// Les animations de planetes et de portails
	animation ++;
	temps += 0.02;

	portail.position.x = 18 * 100 * Math.cos( animation * Math.PI / 180 );
	portail.position.y = 5 * 100 * Math.sin( temps );
	portail.position.z = 18 * 100 * Math.sin( animation * Math.PI / 180 );

	earth_sphere.position.x = 36 * 100 * Math.cos( animation * -Math.PI / 180 );
	earth_sphere.position.z = 30 * 100 * Math.sin( animation * -Math.PI / 180 );
	earth_sphere.rotation.y = animation / 30;
	earth_sphere.rotation.z = animation / 30;
	
	shader_sphere.position.y = 8 * 100 * Math.sin( temps );
	shader_sphere.rotation.y = animation / 30;
	shader_sphere.rotation.z = animation / 30;

    body.rotation.y = effectController.personnageAngle * Math.PI / 180;
	clone.rotation.y = effectController.personnageAngle * -Math.PI / 180;

	miroirCamera.visible = false;
    miroirCamera.updateCubeMap( renderer, scene );
    miroirCamera.visible = true;

	renderer.render( scene, camera );
}

// ---------------
// Setup de l'interface d'interaction + valeur par defaut
function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newAxes: axes,

        personnageAngle: 10.0,

        wall: true,
		helperCamera: true,
		zoom: false,

	};

	var gui = new dat.GUI();

	var categorie = gui.addFolder( "Les grilles" );
	categorie.add( effectController, "newGridX" ).name( "Voir la grille XZ" );
	categorie.add( effectController, "newGridY" ).name( "Voir la grille YZ" );
	categorie.add( effectController, "newGridZ" ).name( "Voir la grille XY" );
	categorie.add( effectController, "newAxes" ).name( "Voir la grille" );

	var categorie = gui.addFolder( "Les interactions" );
	categorie.add( spotCamera1, "spot" ).name( "Spot camera 1" );
	categorie.add(effectController, "zoom").name("Zoom MAX");
	categorie.add( effectController, "wall" ).name( "Mur visible" ).onChange( function ( value ) {
        mur.visible = value; 
    } );
	categorie.add( effectController, "helperCamera" ).name( "Camera visible" ).onChange( function ( value ) {
        helper.visible = value; 
    } );
    categorie.add( effectController, "personnageAngle", -180.0, 180.0, 0.025 ).name( "Rotation Perso" );
	
    var categorie = gui.addFolder( "Reset" );
    categorie.add( resetCamera, "reset" ).name( "Reset Camera" );
	categorie.add( resetPeronnage, "reset" ).name( "Reset Perso" );
	

}

// Ordre de lancement
try {
	init();
	fillScene();
	drawHelpers();
	addToDOM();
	setupGui();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$( '#container' ).append( errorReport + e );
}

// lance l'animation que quand la page est prete
document.addEventListener( "DOMContentLoaded", function() {
    // ajoute listener resize window adapte le mode plein ecran webGL
    window.addEventListener( "resize", function() {
        if ( effectController.zoom ) {
            renderer.setSize( window.innerHeight*0.8, window.innerHeight );
        }
    });
	// this is the main action sequence
	try {
		animate();
	} catch(e) {
		var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
		$( '#container' ).append( errorReport + e );
	}
});
