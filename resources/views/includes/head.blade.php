<meta charset="utf-8" />
<title>@yield('title')</title>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
<meta content="" name="description" />
<meta content="" name="author" />
<link rel="icon" href="{{ asset('favicon.ico?v=2') }}" type="image/x-icon" />
<link rel="shortcut icon" href="{{ asset('favicon.ico?v=2') }}" type="image/x-icon" />
<script>window.baseUrl = "{{ url('/') }}";</script>

<!-- ================== BEGIN BASE CSS STYLE ================== -->
<link href="{{ asset('assets/css/vendor.min.css') }}" rel="stylesheet" />
<link href="{{ asset('assets/css/app.min.css') }}" rel="stylesheet" />
<!-- ================== END BASE CSS STYLE ================== -->

<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>

@stack('css')
