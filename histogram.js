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
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

function partition(array, begin, end, pivot)
{
    var piv=array[pivot];
    array.swap(pivot, end-1);
    var store=begin;
    var ix;
    for(ix=begin; ix<end-1; ++ix) {
        if(array[ix]<=piv) {
            array.swap(store, ix);
            ++store;
        }
    }
    array.swap(end-1, store);

    return store;
}

function qsort(array, begin, end)
{
    if(end-1>begin) {
        var pivot=begin+Math.floor(Math.random()*(end-begin));

        pivot=partition(array, begin, end, pivot);

        qsort(array, begin, pivot);
        qsort(array, pivot+1, end);
    }
}

function quicksort(array)
{
    qsort(array, 0, array.length);
}

function arr_copy(arr_source, arr_target) {
    arr_target = new Float32Array(arr_source.length);
    for(var i=0, len=arr_source.length; i<len; i++) {
        arr_target[i] = arr_source[i];
    }
    return arr_target;
};

function Float32Array_copy(arr_target) {
    var arr_copy = new Float32Array(arr_target.length);
    arr_copy.set(arr_target);
    return arr_copy;
}

/*
 * Filter an array between <f_min> and <f_max> by hardlimiting
 * values outside the filter to the filter edges.
 * 
 * This operation changes its input!
 * 
 */
function arr_bandFilter(arr_data, f_min, f_max) {
    for(var i=0; i<arr_data.length; i++) {
        if(arr_data[i]<f_min) {arr_data[i] = f_min; continue;}
        if(arr_data[i]>f_max) {arr_data[i] = f_max; continue;}
    }
}

Float32Array.prototype.swap = function(a, b)
{
    var tmp=this[a];
    this[a]=this[b];
    this[b]=tmp;
};

Float32Array.prototype.copy = function() {
    var acopy = new Float32Array(this.length);
    acopy.set(this);
    return acopy;
};


Array.prototype.swap = function(a, b)
{
    var tmp=this[a];
    this[a]=this[b];
    this[b]=tmp;
};

Array.prototype.scale = function(f_scale) {
    for(var i=0, len=this.length; i<len; i++) {
        this[i] *= f_scale;
    }
    return this;
};

/*
 * Given an array of data points, return two arrays of
 * nbin size: 
 * 
 *     o the right-hand histogram bin value
 *     o the number of observations in that value range
 * 
 */
function histogram_calculate(arr_data, nbins) {
    var arr_sorted      = arr_data.copy();
    quicksort(arr_sorted);
    var f_min           = arr_sorted[0];
    var f_max           = arr_sorted[arr_sorted.length-1];
    var f_range         = f_max - f_min;
    var f_binSpan       = f_range / nbins;
    
    // Return arrays
    var arr_binOffset   = [];    // 'x-axis' values, [x1, x2, ... xn]
    var arr_binValue    = [];    // 'y-axis' values, [y1, y2, ... yn]
    var arr_xy          = [];    // a 'merged' array of [[x1, y1], ... [xn, yn]]
    
    var j=0;
    for(j=0; j<nbins; j++) {
        arr_binValue[j]         = 0;
        arr_binOffset[j]        = f_binSpan * (j+1) + f_min;
        arr_xy[j]               = [arr_binOffset[j], 0];
    }
    j=0;
    for(var i=0; i<arr_sorted.length; i++) {
        while(arr_sorted[i]>arr_binOffset[j]) j = j+1;
        if(arr_sorted[i]<=arr_binOffset[j]) {
            arr_binValue[j] = arr_binValue[j]+1;
            arr_xy[j][1]    = arr_xy[j][1] + 1;
        }
    }
    return {arr_binOffset : arr_binOffset, arr_binValue : arr_binValue, 
            arr_xy : arr_xy};
}

/*
 * Draw the histogram as a series of bins on the
 * passed canvasID
 * 
 */

function histogram_draw(astr_canvasID, arr_xy) {

    var canvas         = document.getElementById(astr_canvasID);
    var f_xrange     = canvas.clientWidth;
    var f_yrange     = canvas.clientHeight;
    
    var hchart = new Highcharts.Chart({
        credits: {
            enabled:    false
        },
        chart: {
            style: {
                fontSize:         '8px',
            },
            renderTo:            astr_canvasID,
            type:                'column',
            backgroundColor:     'rbga(255,255,255,0.1)'
        },
        title: {
            enabled:             false,
            text:                 '',
            style: {
                fonstSize:         '8px'
            }
                
        },
        yAxis: {
            title: {
                text:             '',
                align:             'high'
            }
        },
        series: [{
            showInLegend: false,
            name: null,
            data: arr_xy,
            style: {
                fontSize: '8px'
            }
        }]
    });
}