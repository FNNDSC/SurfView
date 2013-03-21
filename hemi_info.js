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
 *     hemi_info.js
 * 
 * DESCRIPTION
 * 
 * This file defines the logic required to access information internal to specific
 * hemispheres such as number of vertices, signed value counts, etc.
 * 
 * GLOBAL/External variables:
 * 
 * The logic in this file is intimately linked to the actual tagged regions
 * of the HTML page.
 *    
 */


      
function hid_select(astr_hemi) {
    str_id = '';
    __htmlEl = null;
    console.log(astr_hemi);
    switch(astr_hemi) {
    case 'Left': case 'lh':
        __htmlEl = hid.lh;
        _str_id = 'lh_';
        break;
    case 'Right': case 'rh':
        __htmlEl = hid.rh;
        _str_id = 'rh_';
        break;
    }
    return {hemi : __htmlEl, id : _str_id};
}

function hid_init(astr_hemi) {
    html = hid_select(astr_hemi);
    for(var key in _htmlRefTag) {
        str_htmlEl = html.id + key;
        html.hemi[key] = document.getElementById(str_htmlEl);
    }
}

function hemi_infoUpdate(astr_hemi, curvFuncVal) {
    // Due to mix and match between 'lh'/'Left' and 'rh'/'Right',
    // we just need to consistently use 'Left' for 'lh' and 'Right' for 'rh'
    switch(astr_hemi) {
        case 'lh':    astr_hemi = 'Left';
                    break;
        case 'rh':    astr_hemi = 'Right';
                    break;
    }
    
    html = hid_select(astr_hemi);
    hemi = hemi_select(astr_hemi);
    console.log('hemi_infoUpdate ' + astr_hemi);
    console.log(html);
    // We need to copy and then filter the scalars.array
    // according to the min/max values
    //var arr_scalars = hemi.surface.scalars.array.subarray(0);
    var arr_scalars = hemi.surface.scalars.array.copy();
    // Now bandpass filter between the min/max values of the 
    // thresholded values...
    var f_min = hemi.surface.scalars.min;
    var f_max = hemi.surface.scalars.max;
    arr_bandFilter(arr_scalars, f_min, f_max);
    
    //var s_stats = stats_calc(hemi.surface.scalars.array);
    var s_stats = stats_calc(arr_scalars);
    for(var key in _htmlRefTag) {
      switch(key) {
      case 'vertices':
          html.hemi[key].innerHTML = hemi.surface.scalars.array.length;
          break;
      case 'curvFunc':
         var _index = curvatureTypes.indexOf(curvFuncVal);
          html.hemi[key].innerHTML = curvatureFiles[_index];
          break;
      case 'negCount':
          html.hemi[key].innerHTML = s_stats.negCount.toFixed(0);
          break;
      case 'posCount':
          html.hemi[key].innerHTML = s_stats.posCount.toFixed(0);
          break;
      case 'minCurv':
          html.hemi[key].innerHTML = hemi.surface.scalars.min.toFixed(4);
          html.hemi[key].innerHTML = s_stats.min.toFixed(4);
          break;;
      case 'maxCurv':
          html.hemi[key].innerHTML = hemi.surface.scalars.max.toFixed(4);
          html.hemi[key].innerHTML = s_stats.max.toFixed(4);
          break;
      case 'stdCurv':
          html.hemi[key].innerHTML = s_stats.deviation.toFixed(4);
      break;
      }
    }
    // Now (re)draw the histogram 
    s_hist = histogram_calculate(arr_scalars, 100);
    histogram_draw(astr_hemi + '_histogram', s_hist.arr_xy);
}    
