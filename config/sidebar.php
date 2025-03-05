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
    'menu' => [
        [
            'icon' => 'fa fa-sitemap',
            'title' => 'Dashboard',
            'url' => '/dashboard/v1', // Ubah langsung ke URL Dashboard v1
            'route-name' => 'dashboard-v1'
        ],
        [
            'icon' => 'fa fa-table',
            'title' => 'Tables',
            'url' => '/table/manage/buttons',
            'route-name' => 'table-manage-buttons'
        ]
    ]

];
