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
 * 	render_core.js
 * 
 * DESCRIPTION
 * 
 * This file defines the window.onload function that contains the core
 * xtk-based logic and rendering.
 * 
 * GLOBAL/External variables:
 * 
 * 	xrender -- 	the actual xtk render instance, shared between various
 * 				system components.
 *    
 */


/**
 * This function simply returns some internal information on the xrender
 * camera view, specifically the current max distance. This is needed to
 * preserve the same viewpoint distance when switching between different
 * planar views in the main display.
 */
function camera_maxCurrent() {
    var pos = xrender.camera.view.toArray();
    return(pos[2][3]);
};

/**
 * This function initiates a FreeSurfer mesh. The <aS_metaData>
 * structure contains all the details relevant to the mesh (specifically the
 * mesh file path, the curvature overlay path).
 * 
 * @param {!aS_metaData} a structure contain mesh file system info
 * @return {!Struct} a structure containing metadata relevant to the mesh
 * @protected
 */
function mesh_init(aS_metaData) {
	mesh = new X.mesh();
	mesh.color = [0.5, 0.5, 0.5];
	mesh.file = aS_metaData.surfaceMeshFile;

	mesh.scalars.file = aS_metaData.functionCurvFile;
	mesh.scalars.maxColor = [1, 0, 0];
	mesh.scalars.minColor = [0, 1, 0];

	return mesh;
}

// XTK model
window.onload =  function() {
	  
    ['Left', 'Right'].map( function(hemi) {hid_init(hemi);} );
  
    xrender = new X.renderer3D();
    xrender.container = "mesh";
    xrender.init();

    S_mesh.lh = mesh_init(S_render.lh);
    hemiPosition_act('lh', S_render_Xoffset('lh'), 'X');
    S_mesh.lh.scalars.interpolation = 1;
    S_mesh.rh = mesh_init(S_render.rh);
    hemiPosition_act('rh', S_render_Xoffset('rh'), 'X');
    S_mesh.rh.scalars.interpolation = 1;
    
    xrender.add(S_mesh.lh);
    xrender.add(S_mesh.rh);

    // Default up vector:  (0,1,0)
    // Default camera pos: (0,0,100)
    // Default "view": axial (superior)
    //          x: sagittal
    //          y: coronal
    //          z: axial
    //

    // Default rendering: axial (superior)
    xrender.camera.up = [0, 1, 0];
    xrender.camera.position = [0, 0, 500];

    console.log('calling render');
    
    xrender.render();

    console.log('called render');
   
    // the onShowtime method gets executed after all files were fully loaded and
    // just before the first rendering attempt
    xrender.onShowtime = GUI_build;
};
 
