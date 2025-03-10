<?php

return [

    'menu' => [
        [
            'icon' => 'fa fa-sitemap',
            'title' => 'Dashboard',
            'url' => '/dashboard/v1',
            'route-name' => 'dashboard-v1'
        ],
        [
            'icon' => 'fa fa-table',
            'title' => 'Tables',
            'url' => '/table/manage/buttons',
            'route-name' => 'table-manage-buttons'
        ],
        [
            'icon' => 'fa fa-lightbulb-o', // Ikon lampu
            'title' => 'Kontrol Lampu', // Nama menu
            'url' => '/lampu/kontrol', // URL ke halaman kontrol lampu
            'route-name' => 'lampu-kontrol'
        ]
    ]

];
