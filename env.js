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
 *     env.js
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
    vertices:   "vertices",
    curvFunc:   "curvFunc",
    negCount:   "negCount",
    posCount:   "posCount",
    minCurv:    "minCurv",
    maxCurv:    "maxCurv",
    stdCurv:    "stdCurv"        
};

hid = {
    lh:    {
        vertices:       0,
        curvFunc:       'undefined',
        negCount:       0,
        posCount:       0,
        minCurv:        0.0,
        maxCurv:        0.0,
        stdCurv:        0.0
        },
    rh:    {
        vertices:       0,
        curvFunc:       'undefined',
        negCount:       0,
        posCount:       0,
        minCurv:        0.0,
        maxCurv:        0.0,
        stdCurv:        0.0
        }
};


//
// Change the <subject> part of an input directory path
// (in S_render convention) and return the path spec
// with new subject.
//
// It is quite important that the subjectDir is correctly
// preserved during this operation.
//
function subject_set(astr_path, astr_subject, aindex) {
    // First, split off the subjectDir from the astr_path
    var str_noSubject = astr_path.split(subjectDir)[1];
    var arr_dir = str_noSubject.split('/');
    aindex = (typeof aindex == 'undefined') ? 1 : aindex;
    arr_dir[aindex] = astr_subject;
    var str_newSubject = subjectDir + arr_dir.join('/');
    console.log(str_newSubject);
    return(subjectDir + arr_dir.join('/'));
}

//
// Change the curvature qualifier in the S_render object
//
function S_render_curvQualifier_set(astr_hemi, astr_qualifier) {
    var str_qualifierCurrent = S_render[astr_hemi]['functionCurvQualifier'];
    var str_fullQualifier = '.' + str_qualifierCurrent;
    var str_qualifierNew = '.' + astr_qualifier;
    var S_curvFile = S_render[astr_hemi]['allCurvFile'];
    for(var rec in S_curvFile) {
        if(S_curvFile.hasOwnProperty(rec)) {
            S_curvFile[rec] = S_curvFile[rec].replace(str_fullQualifier, str_qualifierNew);
            console.log(S_curvFile[rec]);
        }
    }
    S_render[astr_hemi]['functionCurvQualifier'] = astr_qualifier;
}

//
// Change the curvature base file in the S_render object
//
function S_render_baseCurve_set(astr_hemi, astr_baseNew) {
    var str_baseCurrent = S_render[astr_hemi]['surfaceCurv'];
    var S_curvFile = S_render[astr_hemi]['allCurvFile'];
    for(var rec in S_curvFile) {
        if(S_curvFile.hasOwnProperty(rec)) {
            S_curvFile[rec] = S_curvFile[rec].replace(str_baseCurrent, astr_baseNew);
            console.log(S_curvFile[rec]);
        }
    }
    S_render[astr_hemi]['functionCurvFile'] = 
        S_render[astr_hemi]['functionCurvFile'].replace(str_baseCurrent, astr_baseNew);
    S_render[astr_hemi]['surfaceCurv'] =
        S_render[astr_hemi]['surfaceCurv'].replace(str_baseCurrent, astr_baseNew);
    console.log(S_render);
}

//
// Based on the S_render internals, return some initial position 
// information.
//
function S_render_Xoffset(astr_hemi) {
    // Make sure about the 'Left'/'lh' 'Right'/'rh' duality
    switch(astr_hemi) {
        case 'Left':    astr_hemi = 'lh'; break;
        case 'Right':    astr_hemi = 'rh'; break;
    }
    var offset = 0;
    switch(S_render[astr_hemi].surfaceMesh) {
    case 'smoothwm':    offset = 0;
                        break;
    case 'inflated':    offset = 40;
                        break;
    case 'sphere':        offset = 100;
                        break;
    case 'pial':        offset = 0;
                        break;
    }
    if(astr_hemi == 'Left' || astr_hemi == 'lh') offset = offset * -1;
    return offset;
}


//
// Check if a file (URL) actually exists.
//
function url_exists(astr_url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', astr_url, false);
    http.send();
    return http.status!=404;    
}


function url_accessAllowed(astr_url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', astr_url, false);
    http.send();
    return http.status!=403;    
}


function Xfile_checkAccess(astr_file) {
    str_url = location.origin + '/' + astr_file;
    if(!url_exists(str_url)) {
        alert(str_url + '\nNot found.');
        return false;
    }
    if(!url_accessAllowed(str_url)) {
        alert(str_url + '\nFile exists, but access is forbidded.');
        return false;
    }
    return true;
}

// A convenience function that returns GUI components relevant to
// specific hemisphere
//
// render:      contains elements relevant to file system access for
//              renderable elements (like curvature overlay names,
//              label paths, etc.
function hemi_select(astr_hemi) {
  str_hemi = '';
  __gui = null;
  surface = null;
  switch(astr_hemi) {
  case 'Left': case 'lh':
       __gui = _gui.lh;
       str_hemi = 'Left';
       surface = S_mesh.lh;
       render = S_render.lh;
       break;
  case 'Right': case 'rh':
       __gui = _gui.rh;
       str_hemi = 'Right';
       surface = S_mesh.rh;
       render = S_render.rh;
       break;
  }
  return {gui : __gui, surface : surface, render : render};
}
