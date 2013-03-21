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
 *     page_layout.js
 * 
 * DESCRIPTION
 * 
 * This code implements the jQuery based layout of logical elements
 * of the HTML page. It has intimate dependencies on the named elements
 * of the page.
 * 
 * GLOBAL/External variables:
 * 
 * The logic in this file is intimately linked to the actual tagged regions
 * of the HTML page.
 *    
 */

// Do the layout of page components using jQuery
jQuery(document).ready(function($) {

    //all hover and click logic for buttons
    jQuery(".fg-button:not(.ui-state-disabled)")
    .hover(
        function(){
            $(this).addClass("ui-state-hover");
        },
        function(){
            $(this).removeClass("ui-state-hover");
        }
    )
    .mousedown(function(){
        $(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
        if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ $(this).removeClass("ui-state-active"); }
        else { $(this).addClass("ui-state-active"); }
    })
    .mouseup(function(){
        if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ){
            $(this).removeClass("ui-state-active");
        }
    });

    jQuery("#title").titlePos_layout(jQuery("#title").width());
    
    jQuery('a.minibutton').bind({
          mousedown: function() {
          jQuery(this).addClass('mousedown');
          },
          blur: function() {
          jQuery(this).removeClass('mousedown');
          },
          mouseup: function() {
          jQuery(this).removeClass('mousedown');
          }
    });
    
    jQuery("#radio").buttons_layout(jQuery("#title").height()+10);

    jQuery("#rh_info").rhData_layout();
    jQuery("#rh_info").draggable();
    jQuery("#lh_info").lhData_layout();
    jQuery("#lh_info").draggable();

    // Button callbacks...
    jQuery("#as").click(function() {
      var dis = Math.abs(camera_maxCurrent());
      xrender.camera.up = [0,1,0];
      console.log(dis);
      xrender.camera.position = [0,0,dis];
      xrender.render();
    });
    jQuery("#ai").click(function() {
      var dis = Math.abs(camera_maxCurrent());
      xrender.camera.up = [0,1,0];
      console.log(dis);
      xrender.camera.position = [1, 0,-dis];
      xrender.render();
    });
    jQuery("#sl").click(function() {
      var dis = Math.abs(camera_maxCurrent());
      xrender.camera.up = [1,0,0];
      console.log(dis);
      xrender.camera.position = [dis,0,0];
      xrender.render();
    });
    jQuery("#sr").click(function() {
      var dis = Math.abs(camera_maxCurrent());
      xrender.camera.up = [1,0,0];
      console.log(dis);
      xrender.camera.position = [-dis,0,1];
      xrender.render();
    });
    jQuery("#cd").click(function() {
      var dis = Math.abs(camera_maxCurrent());
      xrender.camera.up = [0,1,0];
      console.log(dis);
      xrender.camera.position = [0,dis,0];
      xrender.render();
    });
    jQuery("#cv").click(function() {
      var dis = Math.abs(camera_maxCurrent());
      xrender.camera.up = [0,1,0];
      console.log(dis);
      xrender.camera.position = [0,-dis,1];
      xrender.render();
    });
}); // End of document.ready
    
jQuery.fn.titlePos_layout = function(textWidth) {
    this.css("position", "absolute");
    this.css("top",  "10px");
    this.css("left", window.innerWidth/2 - textWidth/2 + "px");
    return this;
};

jQuery.fn.buttons_layout = function(heightOffset) {
    buttonLayoutWidth = document.getElementById("radio").clientWidth;
    this.css("position", "absolute");
    this.css("top",  heightOffset + "px");
    this.css("left", window.innerWidth/2 - buttonLayoutWidth/2 + "px");
    return this;
};

jQuery.fn.slider_layout = function() {
    this.css("position", "absolute");
    this.css("top", "100px");
    this.css("left", "600px");
};

jQuery.fn.rhHistogram_layout = function() {
    histElement = document.getElementById('Right_histogram');
    infoElement = document.getElementById('rh_info');
    this.css("position", "absolute");
    this.css("top",  window.innerHeight - histElement.clientHeight - 20 + "px");
    this.css("right", infoElement.clientWidth + 30 + "px");
    return this;
};

jQuery.fn.lhHistogram_layout = function() {
    histElement = document.getElementById('Left_histogram');
    infoElement = document.getElementById('lh_info');
    console.log('lh histogram, left: ' + infoElement.clientWidth);
    this.css("position", "absolute");
    this.css("top",  window.innerHeight - histElement.clientHeight - 20 + "px");
    this.css("left", infoElement.clientWidth + 30 + "px");
    return this;
};

jQuery.fn.rhData_layout = function() {
    docElement = document.getElementById('rh_info');
    this.css("position", "absolute");
    this.css("top",  window.innerHeight - docElement.clientHeight - 20 + "px");
    this.css("right", "10px");
    jQuery("#Right_histogram").draggable();
    jQuery("#Right_histogram").rhHistogram_layout();
    return this;
};

jQuery.fn.lhData_layout = function() {
    docElement = document.getElementById('lh_info');
    this.css("position", "absolute");
    this.css("top",  window.innerHeight - docElement.clientHeight - 20 + "px");
    this.css("left", "10px");
    jQuery("#Left_histogram").draggable();
    jQuery("#Left_histogram").lhHistogram_layout();
    return this;
};

jQuery.fn.textWidth = function(){
    var html_org = $(this).html();
    var html_calc = '<span>' + html_org + '</span>';
    $(this).html(html_calc);
    var width = $(this).find('span:first').width();
    $(this).html(html_org);
    return width;
};

function view_set(av_up, av_camera) {
    xrender.camera.up = av_up;
    xrender.camera.position = av_camera;
    xrender.render();
}

//splits the document into two frames
function split_screen() {

  if ( parent.viewer_left !== undefined ) {
    // exit if we are already in split screen mode
    return;
  }

  frameset = '<FRAMESET cols="50%,50%" BORDER=3>' + '<FRAME src="'
      + document.location.href + '"' + ' NAME="viewer_left">' + '<FRAME src="'
      + document.location.href + '"' + ' NAME="viewer_right">' + '</FRAMESET>';
  location = 'javascript:frameset';

};

