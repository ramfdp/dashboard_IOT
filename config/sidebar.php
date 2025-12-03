<?php

return [

    'menu' => [
        [
            'icon' => 'fa fa-sitemap',
            'title' => 'Dashboard',
            'url' => '/dashboard/v1',
            'route-name' => 'dashboard-v1',
            'permissions' => ['admin', 'user']
        ],
        [
            'icon' => 'fa fa-table',
            'title' => 'History Listrik',
            'url' => 'table/manage/buttons',
            'route-name' => 'table-manage-buttons',
            'permissions' => ['admin', 'user']
        ],
        [
            'icon' => 'fa fa-users',
            'title' => 'Management User',
            'url' => 'management-user',
            'route-name' => 'management-user',
            'permissions' => ['admin']
        ],
        [
            'icon' => 'fa fa-camera',
            'title' => 'CCTV',
            'url' => 'cctv',
            'route-name' => 'cctv.dashboard',
            'permissions' => ['admin', 'user']
        ]
    ]

];
