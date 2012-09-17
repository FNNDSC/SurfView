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
 * Web-ified Surface Viewer
 *
 * For reference, see also:
 *
 *	http://lessons.goxtk.com/08/
 *	http://lessons.goxtk.com/12/
 *
 * Typical calling:
 *
 *	http://natal.tch.harvard.edu/surfview.php?subjectDir=allSubjects
 *
 *
 *
 * Enjoy!
 *	- the X devs
 *
 */
-->

<html>
<head>

<!-- 'fs_dirsParse.php' examines the passed 'subjectDir' and builds up a data  -->
<!-- structure of FreeSurfer files and paths. -->
<?php 
include 'SurfView/fs_dirsParse.php';
?>

<title>SurfView</title>

<link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js"></script>

<link href='http://fonts.googleapis.com/css?family=Inika:400,700' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Bevan' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Doppio+One' rel=',stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Henny+Penny' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Ribeye+Marrow' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Unkempt' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Fresca' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Walter+Turncoat' rel='stylesheet' type='text/css'>

<link href='../css/buttons.css' rel='stylesheet'/>

<!-- <script type="text/javascript" src='scripts/jquery.js'></script> -->

<script type="text/javascript" src="http://get.goXTK.com/xtk_xdat.gui.js"></script>
<!-- <script type="text/javascript" src="http://get.goXTK.com/xtk_edge.js "></script> -->

<script type="text/javascript" src="X/lib/closure-library/closure/goog/base.js"></script>
<script type="text/javascript" src="X/xtk-deps.js"></script>

<!-- Highcharts and friends -->
<script src="/highcharts/js/highcharts.js" type="text/javascript"></script>

<!-- <script type="text/javascript" src="http://get.goXTK.com/xtk.js "></script> -->

<script type="text/javascript">

	// The following is required when connecting to a local Xtk build
	goog.require('X.renderer3D');
	goog.require('X.mesh');

	// First, the main data components passed over from the PHP processing:
    // The main php data structure
    var S_render = <?= $jsArr_render ?>;
    // Array list of subject variables
    var subjectArr = <?= $jsArr_subjectList ?>;

	// A 'structure' to contain the left and right hemisphere meshes
    var S_mesh = {
	    'lh':	null,
	    'rh':	null
    };

    // The GUI -- adapted from http://lessons.goxtk.com/12/
    var DATgui = null; 	

    // The actual xtk renderer
    var xrender	= null;
    
</script>

<!-- Import the core javascript components of the system -->
<script type="text/javascript" src="SurfView/env.js"></script>
<script type="text/javascript" src="SurfView/hemi_info.js"></script>
<script type="text/javascript" src="SurfView/page_layout.js"></script>
<script type="text/javascript" src="SurfView/gui.js"></script>
<script type="text/javascript" src="SurfView/histogram.js"></script>
<script type="text/javascript" src="SurfView/misc_maths.js"></script>
<script type="text/javascript" src="SurfView/render_core.js"></script>

<body style="margin:0px;">

  <!-- the container for the renderer -->
  <div class="renderer" id="mesh" style="background-color: #000000; width: 100%; height: 100%;">
  </div>

  <span id="radio" class="fg-buttonset fg-buttonset-single">
        <button id = "as" class="fg-button ui-state-default ui-priority-primary ui-corner-left">Axial (Superior)</button>
        <button id = "ai" class="fg-button ui-state-default ui-priority-primary">Axial (Inferior)</button>
        <button id = "sl" class="fg-button ui-state-default ui-priority-primary">Sagittal (Right)</button>
        <button id = "sr" class="fg-button ui-state-default ui-priority-primary">Sagittal (Left)</button>
        <button id = "cd" class="fg-button ui-state-default ui-priority-primary">Coronal (Dorsal)</button>
        <button id = "cv" class="fg-button ui-state-default ui-priority-primary ui-corner-right">Coronal (Ventral)</button>
  </span>

  <span         id      = "title"
                style   = "color: white;
                           font-family: Inika;
                           font-size:200%;">
	<?= $subject ?>
  </span>

  <span         id      = "rh_info"
                style   = "color: white;
                           font-family: Inika;">
    <table border="0" cellspacing="0" cellpadding="0" style="color:white;
    	   font-size:90%;table-layout:fixed;width:250px;">
        <tr>
        <td style="width:150px;";>hemisphere</td>
        <td align="right">right</td>
        </tr>
        <tr><td>vertices</td>         	<td align="right" id = "rh_vertices">undefined</td></tr>
        <tr><td>curvature function </td><td align="right" id = "rh_curvFunc">undefined</td></tr>
        <tr><td>neg count</td>  	<td align="right" id = "rh_negCount">undefined</td></tr>
        <tr><td>pos count</td>  	<td align="right" id = "rh_posCount">undefined</td></tr>
        <tr><td>min value</td>  	<td align="right" id = "rh_minCurv">undefined</td></tr>
        <tr><td>max value</td>  	<td align="right" id = "rh_maxCurv">undefined</td></tr>
        <tr><td>std value</td>  	<td align="right" id = "rh_stdCurv">undefined</td></tr>
    </table>
  </span>

  <div id="Right_histogram" style = "width:300px; height:150px; border:1px; solid #000000;">
  </div>
  
  <span         id      = "lh_info"
                style   = "color: white;
                           font-family: Inika;">
    <table border="0" cellspacing="0" cellpadding="0" style="color:white;
    	   font-size:90%;table-layout:fixed;width:250px;">
        <tr>
        <td style="width:150px;">hemisphere</td>
        <td align="right">left</td>
        </tr>
        <tr><td>vertices</td>         	<td align="right" id = "lh_vertices">undefined</td></tr>
        <tr><td>curvature function</td>	<td align="right" id = "lh_curvFunc">undefined</td></tr>
        <tr><td>neg count</td>  	<td align="right" id = "lh_negCount">undefined</td></tr>
        <tr><td>pos count</td>  	<td align="right" id = "lh_posCount">undefined</td></tr>
        <tr><td>min value</td>  	<td align="right" id = "lh_minCurv">undefined</td></tr>
        <tr><td>max value</td>  	<td align="right" id = "lh_maxCurv">undefined</td></tr>
        <tr><td>std value</td>  	<td align="right" id = "lh_stdCurv">undefined</td></tr>
    </table>
  </span>
  
  <div id="Left_histogram" style = "width:300px; height:150px; border:1px; solid #000000;">
  </div>
  
</body>
</html>