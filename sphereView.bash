#!/bin/bash

G_OS=$(uname)

G_CURVQUAL=ans-
Glst_CURV="K H K1 K2"
Glst_HEMI="lh rh"
Glst_SURFACE="smoothwm pial"

# "include" the set of common script functions
source common.bash
declare -i Gi_verbose=0

G_SYNOPSIS="

    NAME
        
        sphereView.bash
        
    SYNOPSIS
    
        sphereView.bash [-s <'Darwin'|'Linux'> [-v <verbosityLevel>]    \\
                        -h <hemiList>                                   \\
                        -f <surfaceCurvList>                            \\
                        -C <curvList>                                   \\
                        -q <curvFuncQualifier>                          \\
                        <SUBJ1> <SUBJ2> ... <SUBJn>
                        
    DESCRIPTION
    
        'sphereView.bash' opens all curvatures in <curvList> for each subject
        in a goole browser.
        
        The primary purpose is to quickly provide the ability for QA on 
        HBWM surfaces.

"

A_host="checking command line arguments"

EM_host="I couldn't identify the underlying env. Specify either '-s Linux' or '-s Darwin'."

EC_host=10

while getopts v:s:n:h:f:C:q: option ; do
    case "$option" 
    in
        v) Gi_verbose=$OPTARG                           ;;
        s) G_STYLE=$OPTARG                              ;;
	n) Gb_siteNum=1
	   G_siteNum=$OPTARG	                        ;;
	h) Glst_HEMI=$(echo $OPTARG | tr ',' ' ')       ;; 
	f) Glst_SURFACE=$(echo $OPTARG | tr ',' ' ')    ;;
	C) Glst_CURV=$(echo $OPTARG | tr ',' ' ')       ;;
	q) G_CURVQUAL=$OPTARG                           ;;
	\?) synopsis_show ; shut_down 10 ;;
    esac
done

G_OS=$(string_clean $G_OS)
if [[ $G_OS != "Linux" && $G_OS != "Darwin" ]] ; then fatal args;   fi

if [[ $G_OS == "Linux"  ]] ; then OPEN="gnome-open"     ; fi
if [[ $G_OS == "Darwin" ]] ; then OPEN="open"           ; fi

shift $(($OPTIND - 1))
lst_SUBJ=$*

for SUBJ in $lst_SUBJ ; do
    for HEMI in $Glst_HEMI ; do
        for SURFACE in $Glst_SURFACE ; do
            for CURV in $Glst_CURV ; do
                nonVisible="lh"
                if [[ $HEMI == "lh" ]] ; then nonVisible="rh" ; fi
                echo "Opening sphere view on $SUBJ: $HEMI, using $SURFACE.$CURV"
                URL="http://natal.tch.harvard.edu/SurfView.php?SUBJECTS_DIR=numSubjects&${nonVisible}_visible=0&${HEMI}_surfaceMesh=sphere&${HEMI}_functionCurvQualifier=${G_CURVQUAL}&${HEMI}_surfaceCurv=$SURFACE&${HEMI}_functionCurv=$CURV&${HEMI}_colorInterpolation=2&subject=$SUBJ"
                echo $URL
                $OPEN $URL
            done
            read -p "Hit [ENTER] to continue..."
        done
    done
done


