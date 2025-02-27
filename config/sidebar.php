<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    |
    | Most templating systems load templates from disk. Here you may specify
    | an array of paths that should be checked for your views. Of course
    | the usual Laravel view path has already been registered for you.
    |
    */
  'menu' => [[
    'icon' => 'fa fa-sitemap',
    'title' => 'Dashboard',
    'url' => '/dashboard/v1',  // Ubah langsung ke URL Dashboard v1
    'route-name' => 'dashboard-v1'
	],[
		'icon' => 'fa fa-table',
		'title' => 'Tables',
		'url' => 'javascript:;',
		'caret' => true,
		'sub_menu' => [[
			'url' => '/table/basic',
			'title' => 'Basic',
			'route-name' => 'table-basic'
		],[
			'url' => 'javascript:;',
			'title' => 'Managed Tables',
			'sub_menu' => [[
				'url' => '/table/manage/default',
				'title' => 'Default',
				'route-name' => 'table-manage-default'
			],[
				'url' => '/table/manage/buttons',
				'title' => 'Buttons',
				'route-name' => 'table-manage-buttons'
			],[
				'url' => '/table/manage/colreorder',
				'title' => 'ColReorder',
				'route-name' => 'table-manage-colreorder'
			],[
				'url' => '/table/manage/fixed-column',
				'title' => 'Fixed Column',
				'route-name' => 'table-manage-fixed-column'
			],[
				'url' => '/table/manage/fixed-header',
				'title' => 'Fixed Header',
				'route-name' => 'table-manage-fixed-header'
			],[
				'url' => '/table/manage/keytable',
				'title' => 'KeyTable',
				'route-name' => 'table-manage-keytable'
			],[
				'url' => '/table/manage/responsive',
				'title' => 'Responsive',
				'route-name' => 'table-manage-responsive'
			],[
				'url' => '/table/manage/rowreorder',
				'title' => 'RowReorder',
				'route-name' => 'table-manage-rowreorder'
			],[
				'url' => '/table/manage/scroller',
				'title' => 'Scroller',
				'route-name' => 'table-manage-scroller'
			],[
				'url' => '/table/manage/select',
				'title' => 'Select',
				'route-name' => 'table-manage-select'
			],[
				'url' => '/table/manage/combine',
				'title' => 'Extension Combination',
				'route-name' => 'table-manage-combine'
			]]
		]]
	]]
];
