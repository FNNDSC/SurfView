<!--
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
 *
 * NAME
 *
 *     	fs_dirsParse.php
 *
 * SYNOPSIS
 *
 *		fs_dirsParse.php?subjectDir=<subjectDir>[\
 *                      &subject=<subject>\
 *						&lh_surfaceMesh=<meshLH>\
 *						&rh_surfaceMesh=<meshRH>\
 *						&lh_surfaceCurvature=<curvatureBaseSurfaceForLH>\
 *						&rh_surfaceCurvature=<curvatureBaseSurfaceForRH>\
 *						&lh_functionCurv=<initialCurvatureFunctionToOverlayLH>\
 *						&rh_functionCurv=<initialCurvatureFunctionToOverlayRH>\]
 *
 * DESCRIPTION
 *
 *	'fs_dirsParse.php' examines a passed <subjectDir> and <subject> directory 
 *	and builds a basic data structure containing information to render left and
 *	right hemispheres, overlay curvature functions, and superimpose FS labels.
 *
 *	This script is a constituent component of the SurfView.php surface viewer 
 *	system.
 *
 * ARGS
 *
 *	&subjectDir=<FreeSurfer_subjectDir>
 *		
 *		This defines the FreeSurfer subject directory that is parsed for
 *		a complete subject list. This directory MUST be accessible by the
 *		underlying web server. 
 *
 *		This is a MANDATORY argument.
 *
 *	&subject=<subjectToDisplay>
 *	
 *		The actual <subject> within <subjectDir> to display. If not specified,
 *		the first directory in the <subjectDir> is used by default.
 *
 *	&lh_surfaceMesh=<meshLH>
 *
 *		The actual mesh to render for the left hemisphere. If not specified,
 *		defaults to 'inflated'.
 *
 *	&lh_surfaceCurv=<curvatureBaseSurfaceForLH>
 *
 *		Curvature functions are calculated on specific surfaces. For example, 
 *		the 'mean' (or 'H') curvature calculated off the 'smoothwm' surface is
 *		different to that calculated off the 'pial' surface. The argument
 *		specifies the base surface to use for the curvature overlays.
 *
 *		It is quite common to display, for example, the curvature calculated
 *		off the gray/white junction (the 'smoothwm' mesh) on an inflated 
 *		projection of the brain surface (the 'inflated' mesh).
 *
 *		Default: 'smoothwm'
 *
 *	&lh_functionCurv=<initialCurvatureFunctionToOverlayLH>
 *
 *		This defines the actual curvature function to display on the surface.
 *
 *		Default: 'H'
 *
 *	&rh_surfaceMesh=<meshRH>
 *	&rh_surfaceCurv=<curvatureBaseSurfaceForLH>
 *	&rh_functionCurv=<initialCurvatureFunctionToOverlayLH>
 *		Same as 'lh' prefixed arguments, but for the right hemisphere.
 *
 * RETURN
 *
 *	The core purpose of this script is to prepare a data structure that can
 *	be used by the javascript components of the base html document. To this
 *	end, the script provide two variables:
 *
 *   +--------------------------------------------------------------------+
 *   |+------------------------------------------------------------------+|
 *	 ||	o $jsArr_subjectList -- list of subjects in <subjectDir>         ||
 *	 ||	o $jsArr_render -- JSON encoded representation of data structure ||
 *   |+------------------------------------------------------------------+|
 *   +--------------------------------------------------------------------+
 *
 * $jsArr_render is the JSON encoded representation of the underlying 
 * array-based PHP structure.
 *
 * This structure, in 'node' form, is:
 *
 *	+
 *	+--lh
 *	|	|
 *	|	+--surfaceMesh:			mesh to display ('inflated')
 *	|	+--surfaceCurv:			surface type to use for curvature ('smoothwm')
 *	|	+--functionCurv:		curvature function to display ('H')
 *	|	+--surfaceMeshPath:		directory path to surface
 *	|	+--surfaceMeshFile: 	filename of surface mesh
 *	|	+--functionCurvPath:	directory path to curvature file
 *	|	+--functionCurvFile:	filename of curvature file
 *	|	+--arrCurvFile--+
 *	|	|				|
 *	|	|				+--H:	filename of mean crv file
 *	|	|				+--K:	filename of gaussian crv file
 *	|	|				+--K1: 	filename of maximum crv file
 *	|	|				+--K2:	filename of minimium crv file
 *	|	|				+--C:   filename of curvedness crv file
 *	|	+--labelPath:			directory path to label folder
 *	|
 *	+--rh (same as 'lh')
 *
 
 *
 */
-->

<?php
    // Whole brain vars
    $subjectDir		= $_REQUEST['subjectDir'];
    $subject 		= $_REQUEST['subject'];

    // Define the core data structures necessary for the viewer:
    //	o arr_surfaceSpec contains information relevant to a surface
    //	  mesh and the particular curvature map to project onto the
    //	  surface -- it also contains a list of all the relevant curvature
    //    filenames in functionCurvFile;
    //  o arr_hemi is the list of hemispheres, i.e. left and right;
    //  o arr_render is the container array holding a lh and rh surfacSpec;
    //  o arr_curvFunc is the list of curvature types to display;
    
    // Default surface spec values:
    //	o The viewer displays the 'inflated' surface
    //	o The viewer projects the 'smoothwm' 'H' curvature
    //	  on the inflated surface
    $arr_surfaceSpec	= array(
    				'surfaceMesh'      	=> 'inflated',
     				'surfaceCurv'      	=> 'smoothwm',
     				'functionCurv'     	=> 'H',
    				'surfaceMeshPath'  	=> '',
    				'surfaceMeshFile'  	=> '',
    				'functionCurvPath' 	=> '',
    				'functionCurvFile' 	=> '',
    				'allCurvFile' 	   	=> array(),
    				'labelPath'	   		=> ''
    				);

    $arr_hemi		= array('lh', 'rh');
     
    $arr_render		= array(
    				'lh' => $arr_surfaceSpec,
     				'rh' => $arr_surfaceSpec
    				);

    $arr_curvFunc 	= array(
    				'H'  => 'mean',  
    			  	'K'  => 'gaussian', 
    			  	'K1' => 'maximum', 
    			  	'K2' => 'minimum', 
    			  	'C'  => 'curvedness'
    				);
    
    // Scan the URL for arguments to initialize viewer
    // A typical URL spec would be:
    // http://some.host/surfview.php?subjectDir=allSubjects&\
    //      lh_surfaceMesh=smoothwm&lh_functionCurv=K1&\
    //      rh_surfaceMesh=inflated&rh_functionCurv=H
    foreach($arr_hemi as $hemi) {
    	foreach($arr_surfaceSpec as $surfaceSpecKey => $surfaceSpecVal) {
	    $str_request  = '';
    	    $str_request .= $hemi . '_' . $surfaceSpecKey;
	    if(!empty($_REQUEST[$str_request]))
    	        $arr_render[$hemi][$surfaceSpecKey] = $_REQUEST[$str_request];
    	}
    }
    $jsArr_render = json_encode($arr_render);
            
    // Get a listing of all the directories in the $subjectDir. This 
    // assumes that each directory is a subject.
    $arr_subjectList = array();
    foreach(new DirectoryIterator($subjectDir) as $entry) {
    	if(!$entry->isDot() && $entry->isDir()) {
    	    $arr_subjectList[] = $entry->getFileName();
    	}
    }
    
    // sort the listing
    sort($arr_subjectList);

    if(empty($_REQUEST['subject'])) {
    	$subject = $arr_subjectList[0];
    }
    // Convert the php array to a js array
    $jsArr_subjectList = json_encode($arr_subjectList);

    // This builds a large array data structure containing all the necessary
    // vars and paths for rendering meshes and projecting curvatures.
    foreach($arr_hemi as $hemi) {
        foreach ($arr_curvFunc as $curvKey => $curvFunc) {
            //$arr_curvSpec[$curvKey] = '';
    	    //$arr_curvSpec[$curvKey] .= $surfaceCurv . '.' . $curvKey;
    	    $arr_render[$hemi]['allCurvFile'][$curvKey] = '';
    	    $arr_render[$hemi]['allCurvFile'][$curvKey] .=
    	        $arr_render[$hemi]['surfaceCurv'] . '.' . $curvKey; 
        }
    	$arr_render[$hemi]['labelPath']  = '';
        $arr_render[$hemi]['labelPath'] .= $subjectDir . '/' . $subject .
        				   '/label/' . $hemi . '.';
        $arr_render[$hemi]['surfaceMeshPath']  = '';
        $arr_render[$hemi]['surfaceMeshPath'] .= $subjectDir . '/' . $subject .
        				    '/surf/' . $hemi . '.';    
        $arr_render[$hemi]['functionCurvPath']  = '';
        $arr_render[$hemi]['functionCurvPath'] .= $subjectDir . '/' . $subject .
        				    '/surf/' . $hemi . '.';
        $arr_render[$hemi]['surfaceMeshFile']  = '';
        $arr_render[$hemi]['surfaceMeshFile'] .= 
        	$arr_render[$hemi]['surfaceMeshPath'] . 
        	$arr_render[$hemi]['surfaceMesh'];
        $arr_render[$hemi]['functionCurvFile']  = '';
        $arr_render[$hemi]['functionCurvFile'] .= 
        	$arr_render[$hemi]['functionCurvPath'] . 
        	$arr_render[$hemi]['allCurvFile'][$arr_render[$hemi]['functionCurv']] . '.crv';
   }
   
   $jsArr_render = json_encode($arr_render);
   //print $jsArr_render;
?>
