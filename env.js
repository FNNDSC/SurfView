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
 * 	env.js
 * 
 * DESCRIPTION
 * 
 * This file defines some 'environmental', or bridging, code that is shared
 * between various components of the SurfView system. For the most part, functions
 * in this section return data structures (like gui elements, mesh, and 
 * render data) for a specific hemisphere.
 *  
 */


// Javascript access to components of the HTML page:
_htmlRefTag = {
    vertices: 	"vertices",
    curvFunc:	"curvFunc",
    negCount:	"negCount",
    posCount:	"posCount",
    minCurv:	"minCurv",
    maxCurv:	"maxCurv",
    stdCurv:	"stdCurv"		
};

hid = {
    lh:	{
        vertices:	0,
        curvFunc:	'undefined',
        negCount:	0,
        posCount:	0,
        minCurv:	0.0,
        maxCurv:	0.0,
        stdCurv:	0.0
    	},
    rh:	{
        vertices:	0,
        curvFunc:	'undefined',
        negCount:	0,
        posCount:	0,
        minCurv:	0.0,
        maxCurv:	0.0,
        stdCurv:	0.0
    	}
};


// A convenience function that returns GUI components relevant to
// specific hemisphere
//
//	render:		contains elements relevant to file system access for
//				renderable elements (like curvature overlay names,
//				label paths, etc.
function hemi_select(astr_hemi) {
  str_hemi = '';
  __gui = null;
  surface = null;
  switch(astr_hemi) {
  case 'Left':
       __gui = _gui.lh;
       str_hemi = 'Left';
       surface = S_mesh.lh;
       render = S_render.lh;
       break;
  case 'Right':
       __gui = _gui.rh;
       str_hemi = 'Right';
       surface = S_mesh.rh;
       render = S_render.rh;
       break;
  }
  return {gui : __gui, surface : surface, render : render};
}
