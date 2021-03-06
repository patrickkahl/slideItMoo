<?php

/**
 * Contao Open Source CMS
 *
 * @copyright  MEN AT WORK 2013
 * @package    slideitmoo
 * @license    GNU/LGPL
 * @filesource
 */
$GLOBALS['TL_HOOKS']['parseBackendTemplate'][] = array('slideItHelper', 'checkExtensions');

/**
 * Content elements
 */
$GLOBALS['TL_CTE']['slideIt'] = array(
    'slideItStart' => 'slideItStart',
    'slideItEnd'   => 'slideItEnd'
);

/**
 * Front end modules
 */
$GLOBALS['FE_MOD']['miscellaneous']['slideItMoo'] = 'slideItModule';

$GLOBALS['TL_WRAPPERS']['start'][] = 'slideItStart';
$GLOBALS['TL_WRAPPERS']['stop'][]  = 'slideItEnd';
?>