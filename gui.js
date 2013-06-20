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
 *     gui.js
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
 *         hemi_select(astr_hemi)
 * 
 * External vars:
 * 
 *      S_render
 *      S_mesh
 *      subjectArr
 *  
 *      DATgui
 *  
 */

// Encapsulation variables/structs for the GUI components.
_guiSubject = {
        folder:                 null,
        nameCombobox:           null
          };
    
_guiMesh = {
        folder:                 null,
        visible:                null,
        surfaceCombobox:        null,
        translateX:             null,
        translateY:             null,
        translateZ:             null,
        colorSelector:          null
          };

_guiCurvature = {
        folder:                 null,
        baseSurface:            null,
        textInput:              null,
        funcCombobox:           null,
        interpolationCombobox:  null,
        minColorSelector:       null,
        maxColorSelector:       null,
        minThresholdSelector:   null,
        maxThresholdSelector:   null
          };

_guiLabel = {
        folder:                 null,
        textInput:              null
          };

function translate_holder() {
    _translate = {
        translateX:             0,
        translateY:             0,
        translateZ:             0
    };
    return _translate;
}

// The logical components of the GUI per-hemisphere panels:
//    - mesh settings
//    - curvature settings
//    - label settings
_guiHemi = {
        mesh:                   _guiMesh,
        curvature:              _guiCurvature,
        label:                  _guiLabel,
        position:               null
        };
      
// The top level GUI structure:
//    - subject control
//    - left hemisphere control
//    - right hemisphere control
_gui = {
        subject:                _guiSubject,
        lh:                     _guiHemi,
        rh:                     _guiHemi
        };

// The following 'default' values should probably be 
// differentiated between left and right hemispheres.

//
// The following "structs" define the initial values for several
// GUI components (drop down boxes, text boxes, etc).
//
// Initial value of the subject drop down box
_subjectLoader          = { subjectName:    subjectStart};
// Initial value of the surface drop down box
_surfLoader             = { surfMesh:       null};
// Initial value of the curvature surface base
_curvBase               = { base:           null };
// Initial value of the qualifier text field
_curvQualifier          = { qualifier:      null };
// Initial value of the surface color interpolation drop down box
_interpolationLoader    = { interpolation:  null };
// Initial value of the curvature drop down box
_curvLoader             = { curvFunc:       null };
// Initial value of the label text field
_label                  = { label:          null };
// Combine all into a "defaults" struct
_defaults = {
        surfLoader:             _surfLoader,
        curvBase:               _curvBase,
        curvQualifier:          _curvQualifier,
        interpolationLoader:    _interpolationLoader,
        curvLoader:             _curvLoader,
        label:                  _label
};
// And combine all defaults into left and right hemispheres.
_initial = {
        lh: _defaults,
        rh: _defaults
};

function renderSubject_set(astr_subject) {
    // Set the internal S_render records to new subject and load new
    // meshes / curvatures.
    console.log('renderSubject_set::START');
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
        console.log('renderSubject_set::str_surfaceFile = %s', str_surfaceFile);
        console.log('renderSubject_set::str_scalarFile  = %s', str_scalarFile);
        if(Xfile_checkAccess(str_surfaceFile) && Xfile_checkAccess(str_scalarFile)) {
            hemi.surface.file = hemi.render.surfaceMeshFile;
            hemi.surface.scalars.file = hemi.render.functionCurvFile;
            hemi.surface.modified();
            console.log('hemi_infoUpdate(%s)', hemisphere);
            // Check this for new subject switches!!!
            hemi_infoUpdate(hemisphere, hemi.defaults.curvLoader.curvFunc);
        } else pageTitle_update = false;
    });
    if(pageTitle_update) {
        pageTitleElement = document.getElementById("title");
        pageTitleElement.innerText = astr_subject;
    }
    //
    // Check if a qualifier exists, and if so, update again.
    ['lh', 'rh'].map(function(hemisphere) {
        hemi = hemi_select(hemisphere);
        if(hemi.render.functionCurvQualifier.length)
            hemiCurvQualifier_act(hemisphere, hemi.render.functionCurvQualifier);
    });    
    console.log('renderSubject_set::END');
}

function guiMesh_init(astr_hemi) {
    hemi = hemi_select(astr_hemi);
    hemi.gui.mesh.folder = DATgui.addFolder(str_hemi + ' Hemisphere Mesh');
    hemi.gui.mesh.surfaceCombobox = hemi.gui.mesh.folder.add(
                        hemi.defaults.surfLoader,
                        'surfMesh',
                        meshTypes);
    hemi.gui.mesh.surfaceCombobox.onChange(function(value){
            hemiMeshFunc_act(astr_hemi, value);
            });
    // Has an "override" been specified in the URL?
    if(hemi.render.visible == '0') hemi.surface.visible = false;
    hemi.gui.mesh.visible = hemi.gui.mesh.folder.add(hemi.surface, 'visible');
    hemi.gui.position = {
            positionX:    0,
            positionY:    0,
            positionZ:    0
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
                            hemi.defaults.curvBase,
                            'base');
    hemi.gui.curvature.baseSurface.onFinishChange(function(value) {
            hemiCurvBase_act(astr_hemi, value);
            });
    // Has an "override" been specified in the URL?
    if(hemi.render.functionCurvQualifier.length) {
        hemiCurvQualifier_process(astr_hemi);
    }
    hemi.gui.label.textInput = hemi.gui.curvature.folder.add(
                            hemi.defaults.curvQualifier, 'qualifier');
    hemi.gui.label.textInput.onFinishChange(function(value) {
            console.log('Setting internal curvature map to ' + value);
            hemiCurvQualifier_act(astr_hemi, value);
          });      
    hemi.gui.curvature.funcCombobox = hemi.gui.curvature.folder.add(
                            hemi.defaults.curvLoader, 
                            'curvFunc', 
                            curvatureTypes);
    hemi.gui.curvature.funcCombobox.onChange(function(value) {
            console.log('Servicing <' + astr_hemi + '> curvature combobox');
            console.log('Selected value = ' + value);
            hemiCurvFunc_act(astr_hemi, value);
            });
    hemi.gui.curvature.interpolationCombobox = hemi.gui.curvature.folder.add(
            hemi.defaults.interpolationLoader,
            'interpolation',
            interpolationSchemes);
    hemi.gui.curvature.interpolationCombobox.onChange(function(value) {
        hemiInterpolation_act(astr_hemi, value);
        });
    console.log('%s: in guiCurvature_init... interpolation = %d', astr_hemi, hemi.surface.scalars.interpolation);
    if(hemi.surface.scalars.interpolation <= 1) {
        hemi.gui.curvature.minColorSelector = hemi.gui.curvature.folder.addColor(
                        hemi.surface.scalars, 
                          'minColor');
        hemi.gui.curvature.maxColorSelector = hemi.gui.curvature.folder.addColor(
                        hemi.surface.scalars, 
                          'maxColor');
    }
    hemi.gui.curvature.minThresholdSelector = hemi.gui.curvature.folder.add(
                        hemi.surface.scalars, 
                          'lowerThreshold',
//                          -10, 0);
                        hemi.surface.scalars.min,
                        hemi.surface.scalars.max);
    hemi.gui.curvature.maxThresholdSelector = hemi.gui.curvature.folder.add(
                        hemi.surface.scalars, 
                          'upperThreshold',
//                          0, 10);
                        hemi.surface.scalars.min,
                        hemi.surface.scalars.max);
    if(hemi.render.visible == "1") hemi.gui.curvature.folder.open();
}


function guiLabel_init(astr_hemi) {
      hemi = hemi_select(astr_hemi);
      hemi.gui.label.folder = DATgui.addFolder(str_hemi + ' Hemisphere Label');
      hemi.gui.label.textInput = hemi.gui.label.folder.add(
                  hemi.defaults.label, 'label');
      //hemi.gui.label.folder.open();

      hemi.gui.label.textInput.onFinishChange(function(value) {
        console.log('Servicing <' + astr_hemi + '> label field');
        hemiLabel_act(astr_hemi, value);
      });      
}

//
// Call back functions to service GUI-related events
//

function hemiName_fix(astr_hemi) {
    // Due to a bad initial design, we need to be consistent in 
    // the way hemispheres are identified.
    switch(astr_hemi) {
        case 'Left':    astr_hemi = 'lh';
                        break;
        case 'Right':    astr_hemi = 'rh';
                        break;
    }
    return astr_hemi;
}

//
// Mesh position modification callback
//
function hemiPosition_act(astr_hemi, value, astr_pos) {
    hemi = hemi_select(astr_hemi);
    switch(astr_pos) {
    case 'X':
        hemi.surface.transform.matrix[12] = value; break;
    case 'Y':
        hemi.surface.transform.matrix[13] = value; break;
    case 'Z':
        hemi.surface.transform.matrix[14] = value; break;
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
    astr_hemi  = hemiName_fix(astr_hemi);
    S_render_baseCurve_set(astr_hemi, value);
    // We need to now refresh the curvature display. This essentially
    // means simulating a curvFunc selection; the "trick" is that
    // the hemicurvFunct_act method needs to be called with the 
    // drop down function name.
    funcName = curvatureTypes[0];
    for(var rec in curvatureIndexLookup) {
        console.log(curvatureIndexLookup[rec] + '\t' + S_render[astr_hemi]['functionCurv']);
        if(curvatureIndexLookup[rec] == S_render[astr_hemi]['functionCurv']) {
            funcName = curvatureTypes[rec];
            break;
        }
    }
    console.log('Calling hemiCurvFunc_act on ' + funcName);
    hemiCurvFunc_act(astr_hemi, funcName);
}

//
// Curvature qualifier callback
//

function hemiCurvQualifier_process(astr_hemi) {
    astr_hemi = hemiName_fix(astr_hemi);
    hemi = hemi_select(astr_hemi);
    var str_qualifier = hemi.render.functionCurvQualifier;
    var str_surfaceFile = hemi.render.surfaceMeshFile;
    var str_scalarFile = hemi.render.functionCurvFile;
    str_qualifier = hemi.render.functionCurvQualifier;
    _curvQualifier.qualifier = hemi.render.functionCurvQualifier;
    // Now, reset the functionQualifier
    console.log('Resetting qualifier and triggering reload...');
    console.log('str_qualifier = %s', str_qualifier);
    console.log('str_surfaceFile = %s', str_surfaceFile);
    console.log('str_scalarFile = %s', str_scalarFile);
    hemi.render.functionCurvQualifier = '';
    if(Xfile_checkAccess(str_surfaceFile) && Xfile_checkAccess(str_scalarFile)) {
        hemiCurvQualifier_act(astr_hemi, str_qualifier);
        hemi.surface.file = hemi.render.surfaceMeshFile;
        hemi.surface.scalars.file = hemi.render.functionCurvFile;
        hemi.surface.modified();
        console.log('Processing default overlay hemi_infoUpdate...');
        console.log(hemi);
    }
}

function hemiCurvQualifier_act(astr_hemi, avalue) {
    astr_hemi = hemiName_fix(astr_hemi);
    console.log('Calling S_render_curvQualifier_set with avalue = %s', avalue);
    S_render_curvQualifier_set(astr_hemi, avalue);
    // We need to now refresh the curvature display. This essentially
    // means simulating a curvFunc selection; the "trick" is that
    // the hemicurvFunct_act method needs to be called with the 
    // drop down function name.
    funcName = curvatureTypes[0];
    for(var rec in curvatureIndexLookup) {
        //console.log(curvatureIndexLookup[rec] + '\t' + S_render[astr_hemi]['functionCurv']);
        if(curvatureIndexLookup[rec] == S_render[astr_hemi]['functionCurv']) {
            funcName = curvatureTypes[rec];
            break;
        }
    }
    console.log('Calling hemiCurvFunc_act on ' + funcName);
    hemiCurvFunc_act(astr_hemi, funcName);
}

//
// Curvature function callback
//
function hemiCurvFunc_act(astr_hemi, value) {
    console.log('in hemiCurvFunc, value = ' + value);
    hemi = hemi_select(astr_hemi);
    var _index = curvatureTypes.indexOf(value);
    var _rec = curvatureIndexLookup[_index];
    // we need to buffer the (maybe changed) colors
    // else wise we would start with the default red<->green mapping
    var oldMinColor = hemi.surface.scalars.minColor;
    var oldMaxColor = hemi.surface.scalars.maxColor;

    // update the S_render functionCurv 
    for(var rec in curvatureTypes) {
        if(curvatureTypes[rec] == value) {
            hemi.render.functionCurv = curvatureIndexLookup[rec];
            console.log('Setting S_render hemi functionCurv to ' + 
                    curvatureIndexLookup[rec]);
            break;
        }
    }
    
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
        
        hemi.surface.scalars.minColor     = oldMinColor;
        hemi.surface.scalars.maxColor     = oldMaxColor;
    }
}

//
// Curvature color interpolation callback
//
function hemiInterpolation_act(astr_hemi, value) {
    hemi = hemi_select(astr_hemi);
    console.log('In interpolationCombobox for %s', hemi.render.name);
    console.log('astr_hemi = %s, value = %s, current scheme index = %d', astr_hemi, value, hemi.surface.scalars.interpolation);
    for(var rec in interpolationSchemes) {
        if(interpolationSchemes[rec] == value) {
            hemi.surface.scalars.interpolation = 
                interpolationCodes[rec];
            hemi.render.colorInterpolation = rec;
            break;
        }
    }
    GUI_build();
}

//
// Label specification callback
//
function hemiLabel_act(astr_hemi, value) {
    hemi = hemi_select(astr_hemi);
    hemi.render.label = value;
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

    var GUI_buildf = this;
    
    // A housekeeping static counter
    if (typeof this._counter == 'undefined') this._counter = 0;
    this._counter = this._counter + 1;
    
    // The available mesh types
    meshTypes        = [ 'inflated',
                         'smoothwm',
                         'pial',
                         'sphere' ];
    
    // The available curvature types (looks a little cryptic but is 
    // just text) and files
    curvatureTypes = ['H (mm&#x207b;&sup1;)', 
                      'k (mm&#x207b;&sup2;)',
                      'k&#x2081; (mm&#x207b;&sup1;)',
                      'k&#x2082; (mm&#x207b;&sup1;)',
                      'S (mm&#x207b;&sup2;)',
                      'BE (mm&#x207b;&sup2;)',
                      'C (mm&#x207b;&sup2;)'];

    curvatureIndexLookup = ['H',
                            'K',
                            'K1',
                            'K2',
                            'S',
                            'BE',
                            'C'];

    // Color interpolation options
    interpolationSchemes = [ 'XTK default',
                             'FreeSurfer',
                             'Terrain',
                             'Hot'];
    interpolationCodes   = [ 0,
                             1,
                             2,
                             3];
    
    
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
    
    // Make sure that for building, the functionCurvQualifier is set to
    // empty
      
    // Now build the GUI, element-by-element
    _gui.subject.folder         = DATgui.addFolder('Subject');
    _gui.subject.nameCombobox   = _gui.subject.folder.add(_subjectLoader, 
                                      'subjectName', subjectArr);
    //_gui.subject.folder.open();

    // 
    // Subject selection callback
    //
    _gui.subject.nameCombobox.onChange(function(subjectName) {
        renderSubject_set(subjectName);
    });
    
    ['Left', 'Right'].map( function(hemi) {
        h = hemiName_fix(hemi);
        setup = hemi_select(hemi);
        setup.defaults.surfLoader.surfMesh  = setup.render.surfaceMesh;
        setup.defaults.curvBase.base        = setup.render.surfaceCurv;
        setup.defaults.curvQualifier.qualifier = setup.render.functionCurvQualifier;
        setup.defaults.interpolationLoader.interpolation =
                interpolationSchemes[setup.render.colorInterpolation];
        setup.defaults.curvLoader.curvFunc  = curvatureTypes[curvatureIndexLookup.indexOf(setup.render.functionCurv)];
        setup.defaults.label.label          = setup.render.label;
        
        if(GUI_buildf._counter == 1) {
            console.log('GUI_build::INITIAL: updating hemi');
            hemi_infoUpdate(hemi, setup.defaults.curvLoader.curvFunc);
        }
        
        guiMesh_init(hemi);
        guiCurvature_init(hemi);
        guiLabel_init(hemi);
     });
};
