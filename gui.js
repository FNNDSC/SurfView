/*
 *
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x
 *                    x:::::x  x:::::x
 *                     x:::::xx:::::x
 *                      x::::::::::x
 *                       x::::::::x
 *                       x::::::::x
 *                      x::::::::::x
 *                     x:::::xx:::::x
 *                    x:::::x  x:::::x
 *                   x:::::x    x:::::x
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *
 *                  http://www.goXTK.com
 *
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 *
 * NAME
 * 
 * 	gui.js
 * 
 * DESCRIPTION
 * 
 * Defines the GUI elements for the SurfView system. GUI components are 
 * encapsulated in Javascript 'structs' that allows for easy updates/changes.
 * 
 * The GUI is not completely separate/independent from the internal system 
 * logic, and does need access to some SurfView data structures.
 *
 */


/*
 * External methods:
 * 
 * 		hemi_select(astr_hemi)
 * 
 * External vars:
 * 
 *  	S_render
 *  	S_mesh
 *  	subjectArr
 *  
 *  	DATgui
 *  
 */

// Encapsulation variables/structs for the GUI components.
_guiSubject = {
		folder:					null,
	    nameCombobox:			null
      	};
	
_guiMesh = {
		folder:					null,
		visible:				null,
		surfaceCombobox:		null,
		translateX:				null,
		translateY:				null,
		translateZ:				null,
	    colorSelector:			null
      	};

_guiCurvature = {
	    folder:					null,
	    baseSurface:			null,
	    funcCombobox:			null,
	    minColorSelector:		null,
	    maxColorSelector:		null,
	    minThresholdSelector:	null,
	    maxThresholdSelector:	null
      	};

_guiLabel = {
	    folder:					null,
	    textInput:				null
      	};

function translate_holder() {
	_translate = {
		translateX: 	0,
		translateY:		0,
		translateZ:		0
	};
	return _translate;
}

// The logical components of the GUI per-hemisphere panels:
// 	- mesh settings
//	- curvature settings
//	- label settings
_guiHemi = {
		mesh: 					_guiMesh,
		curvature: 				_guiCurvature,
		label: 					_guiLabel,
		position:				null
		};
      
// The top level GUI structure:
//	- subject control
//	- left hemisphere control
//	- right hemisphere control
_gui = {
	    subject: 				_guiSubject,
	    lh:						_guiHemi,
	    rh:						_guiHemi
		};

// Initial value of the subject drop down box
_subjectLoader = {
// First entry in the $arr_subjectList
        //subjectName: subjectArr[0]
		subjectName: subjectStart
};

// Initial value of the surface drop down box
_surfLoader = {
  // Default surface mesh to display
  surfMesh: 'inflated'
};

// Initial value of the curvature surface base
_curvBase = {
  // Default curvature base surface
  base: 'smoothwm'
};


// Initial value of the curvature drop down box
_curvLoader = {
  // Default Curvature Type to display
  curvFunc: 'H (mm&#x207b;&sup1;)'
};


// Initial value of the label text field
_label = { 
  	  label: '<undefined>' 
};


function renderSubject_set(astr_subject) {
	// Set the internal S_render records to new subject and load new
	// meshes / curvatures.
	var pageTitle_update = true;
	['lh', 'rh'].map(function(hemisphere) {
		['functionCurvFile', 'functionCurvPath', 'labelPath',
		 'surfaceMeshFile', 'surfaceMeshPath'].map(function(record) {
			 S_render[hemisphere][record] = 
				 subject_set(S_render[hemisphere][record], astr_subject);
		 });
  		console.log(S_render);
		hemi = hemi_select(hemisphere);
		var str_surfaceFile = hemi.render.surfaceMeshFile;
		var str_scalarFile = hemi.render.functionCurvFile;
		if(Xfile_checkAccess(str_surfaceFile) && Xfile_checkAccess(str_scalarFile)) {
			hemi.surface.file = hemi.render.surfaceMeshFile;
			hemi.surface.scalars.file = hemi.render.functionCurvFile;
			hemi.surface.modified();
			hemi_infoUpdate(hemisphere, _curvLoader.curvFunc);
		} else pageTitle_update = false;
	});
	if(pageTitle_update) {
		pageTitleElement = document.getElementById("title");
		pageTitleElement.innerText = astr_subject;
	}
}


function guiMesh_init(astr_hemi) {
	hemi = hemi_select(astr_hemi);
    hemi.gui.mesh.folder = DATgui.addFolder(str_hemi + ' Hemisphere Mesh');
    hemi.gui.mesh.surfaceCombobox = hemi.gui.mesh.folder.add(
    					_surfLoader,
    					'surfMesh',
    					meshTypes);
    hemi.gui.mesh.surfaceCombobox.onChange(function(value){
    		hemiMeshFunc_act(astr_hemi, value);
    		});
    hemi.gui.mesh.visible = hemi.gui.mesh.folder.add(hemi.surface, 'visible');
    hemi.gui.position = {
    		positionX:	0,
    		positionY:	0,
    		positionZ:	0
    };
    hemi.gui.mesh.translateX = hemi.gui.mesh.folder.add(
    					hemi.gui.position, 'positionX', -100, 100);
    hemi.gui.mesh.translateX.onChange(function(value) {
    					hemiPosition_act(astr_hemi, value, 'X');
    		});
    hemi.gui.mesh.translateY = hemi.gui.mesh.folder.add(
						hemi.gui.position, 'positionY', -100, 100);
	hemi.gui.mesh.translateY.onChange(function(value) {
						hemiPosition_act(astr_hemi, value, 'Y');
    		});
	hemi.gui.mesh.translateZ = hemi.gui.mesh.folder.add(
			hemi.gui.position, 'positionZ', -100, 100);
	hemi.gui.mesh.translateZ.onChange(function(value) {
						hemiPosition_act(astr_hemi, value, 'Z');
			});
    hemi.gui.mesh.colorSelector = hemi.gui.mesh.folder.addColor(
		  				hemi.surface, 'color');    
    //hemi.gui.mesh.folder.open();
}


function guiCurvature_init(astr_hemi) {
	hemi = hemi_select(astr_hemi);
	hemi.gui.curvature.folder = DATgui.addFolder(str_hemi + 
	      	  				' Hemisphere Curvature');
	hemi.gui.curvature.baseSurface = hemi.gui.curvature.folder.add(
							_curvBase,
							'base');
	hemi.gui.curvature.baseSurface.onFinishChange(function(value) {
			hemiCurvBase_act(astr_hemi, value);
			});
	hemi.gui.curvature.funcCombobox = hemi.gui.curvature.folder.add(
							_curvLoader, 
							'curvFunc', 
							curvatureTypes);
	hemi.gui.curvature.funcCombobox.onChange(function(value) {
        	console.log('Servicing <' + astr_hemi + '> curvature combobox');
        	console.log('Selected value = ' + value);
        	hemiCurvFunc_act(astr_hemi, value);
			});
	
	hemi.gui.curvature.minColorSelector = hemi.gui.curvature.folder.addColor(
						hemi.surface.scalars, 
		  				'minColor');
	hemi.gui.curvature.maxColorSelector = hemi.gui.curvature.folder.addColor(
						hemi.surface.scalars, 
		  				'maxColor');
	hemi.gui.curvature.minThresholdSelector = hemi.gui.curvature.folder.add(
						hemi.surface.scalars, 
		  				'lowerThreshold',
		  				-10, 0);
//						hemi.surface.scalars.min,
//						hemi.surface.scalars.max);
	hemi.gui.curvature.maxThresholdSelector = hemi.gui.curvature.folder.add(
						hemi.surface.scalars, 
		  				'upperThreshold',
		  				0, 10);
//		  				hemi.surface.scalars.min,
//		  				hemi.surface.scalars.max);
	hemi.gui.curvature.folder.open();
}


function guiLabel_init(astr_hemi) {
	  hemi = hemi_select(astr_hemi);
	  hemi.gui.label.folder = DATgui.addFolder(str_hemi + ' Hemisphere Label');
	  hemi.gui.label.textInput = hemi.gui.label.folder.add(_label, 'label');
	  //hemi.gui.label.folder.open();

	  hemi.gui.label.textInput.onFinishChange(function(value) {
        console.log('Servicing <' + astr_hemi + '> label field');
        hemiLabel_act(astr_hemi, value);
	  });      
}

//
// Call back functions to service GUI-related events
//

//
// Mesh position modification callback
//
function hemiPosition_act(astr_hemi, value, astr_pos) {
	hemi = hemi_select(astr_hemi);
	switch(astr_pos) {
	case 'X':
		hemi.surface.transform.matrix.setValueAt(0, 3, value); break;
	case 'Y':
		hemi.surface.transform.matrix.setValueAt(1, 3, value); break;
	case 'Z':
		hemi.surface.transform.matrix.setValueAt(2, 3, value); break;
	}
	hemi.surface.transform.modified();
}

//
//  Mesh type modification callback
//
function hemiMeshFunc_act(astr_hemi, value) {
	hemi = hemi_select(astr_hemi);
	var str_meshFile = hemi.render.surfaceMeshPath + value;
	if(Xfile_checkAccess(str_meshFile)) {
		hemi.render.surfaceMesh = value;
		hemi.render.surfaceMeshFile = str_meshFile;
		hemi.surface.file = hemi.render.surfaceMeshFile;
		hemiPosition_act(astr_hemi, S_render_Xoffset(astr_hemi), 'X');
		hemi.surface.modified();
	}
}

//
// Curvature mesh base callback
//
function hemiCurvBase_act(astr_hemi, value) {
	switch(astr_hemi) {
	case 'Left':	astr_hemi = 'lh';
					break;
	case 'Right':	astr_hemi = 'rh';
					break;
	}
	S_render_baseCurve_set(astr_hemi, value);
    curvatureFiles = [ 	S_render[astr_hemi].allCurvFile.H,
                       	S_render[astr_hemi].allCurvFile.K,
                       	S_render[astr_hemi].allCurvFile.K1,    	    			
                       	S_render[astr_hemi].allCurvFile.K2,
                       	S_render[astr_hemi].allCurvFile.C ];
}


//
//Curvature function callback
//
function hemiCurvFunc_act(astr_hemi, value) {
	hemi = hemi_select(astr_hemi);
	var _index = curvatureTypes.indexOf(value);
	var _rec = curvatureIndexLookup[_index];
    // we need to buffer the (maybe changed) colors
    // else wise we would start with the default red<->green mapping
    var oldMinColor = hemi.surface.scalars.minColor;
    var oldMaxColor = hemi.surface.scalars.maxColor;

    var str_curvFile = hemi.render.functionCurvPath + 
					hemi.render.allCurvFile[_rec] + '.crv';
    if(Xfile_checkAccess(str_curvFile)) {
	    // now we (re-)load the selected curvature file
	    hemi.surface.scalars.array = null;
	    hemi.surface.scalars.file = str_curvFile;
	
	    console.log("Sending modified() event on " + hemi.surface.scalars.file);
	    hemi.surface.modified();
	
	    xrender.onShowtime = function() {
	        hemi_infoUpdate(astr_hemi, value);
	    };

		// This is an UGLY hack. Basically, the hemisphere values should be
		// updated *after* the modified() event above has been serviced. 
		// Since this is asynchronous, we wait 2000ms after the modified()
		// and then update the hemi info.
		//setTimeout(function() {
		//    hemi_infoUpdate(astr_hemi, value);
		//}, 2000);		
		
	    hemi.surface.scalars.minColor 	= oldMinColor;
	    hemi.surface.scalars.maxColor 	= oldMaxColor;
    }
}

//
//Label specification callback
//
function hemiLabel_act(astr_hemi, value) {
	hemi = hemi_select(astr_hemi);
	var str_labelFile = hemi.render.labelPath + value + '.label';
	if(Xfile_checkAccess(str_labelFile)) {
		hemi.surface.scalars.file = hemi.render.labelPath + value + '.label';
		hemi.surface.modified();
		xrender.onShowtime = function() {};
	}
}

// The GUI_build() is called just before the first rendering attempt, i.e.
// after all the mesh and curvature files have been loaded.
GUI_build = function() {

	// A housekeeping static counter
	if (typeof this._counter == 'undefined') this._counter = 0;
	this._counter = this._counter + 1;
	
	// The available mesh types
	meshTypes 	   = [ 'inflated',
	          	       'smoothwm',
	          	       'pial',
	          	       'sphere' ];
	
    // The available curvature types (looks a little cryptic but is 
    // just text) and files
    curvatureTypes = ['H (mm&#x207b;&sup1;)', 
                      'k (mm&#x207b;&sup2;)',
                      'k&#x2081; (mm&#x207b;&sup1;)',
                      'k&#x2082; (mm&#x207b;&sup1;)',
                      'C (mm&#x207b;&sup2;)'];

    curvatureIndexLookup = ['H',
                            'K',
                            'K1',
                            'K2',
                            'C'];
    
    // These are the string names of actual files, like 'smoothwm.H'
    // and since they are the same names for the lh and rh, we use the
    // lh parts of the S_render structure here to define the names.
    curvatureFiles = [ 	S_render.lh.allCurvFile.H,
                       	S_render.lh.allCurvFile.K,
                       	S_render.lh.allCurvFile.K1,    	    			
                       	S_render.lh.allCurvFile.K2,
                       	S_render.lh.allCurvFile.C ];

    if(this._counter == 1) {
        console.log('INTIAL: updating hemi in onShowtime()');
		hemi_infoUpdate('Left',  _curvLoader.curvFunc);
		hemi_infoUpdate('Right', _curvLoader.curvFunc);
	}

    if (DATgui) {
		// if we already have a gui, destroy it
        // .. it will be re-created immediately
        DATgui.destroy();
        DATgui = null;
	}
      
	//
	// Create the main GUI panel on the right
	//
	DATgui = new dat.GUI();
      
    // Now build the GUI, element-by-element
    _gui.subject.folder = DATgui.addFolder('Subject');
    _gui.subject.nameCombobox = _gui.subject.folder.add(_subjectLoader, 
    	      				'subjectName', subjectArr);
    //_gui.subject.folder.open();

    // 
	// Subject selection callback
	//
	_gui.subject.nameCombobox.onChange(function(subjectName) {
		renderSubject_set(subjectName);
	});
    
    ['Left', 'Right'].map( function(hemi) {
    	guiMesh_init(hemi);
      	guiCurvature_init(hemi);
      	guiLabel_init(hemi);
     });
};
