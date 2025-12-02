@extends('layouts.default')

@section('title', 'Dashboard CCTV')

@push('css')
    <link href="{{ asset('assets/plugins/jvectormap-next/jquery-jvectormap.css') }}" rel="stylesheet" />
    <link href="{{ asset('assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css') }}" rel="stylesheet" />
    <link href="{{ asset('assets/plugins/gritter/css/jquery.gritter.css') }}" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" rel="stylesheet" />
    <link href="{{ asset('assets/css/cctv.css') }}" rel="stylesheet" />
@endpush

@push('javascripts')
    <script src="{{ asset('assets/js/CCTV.js') }}"></script>
@endpush

@section('content')
<div class="cctv-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="mb-0">Dashboard CCTV</h1>
        <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" onclick="refreshAllCameras()">
                <i class="fas fa-sync-alt"></i> Refresh All
            </button>
            <button class="btn btn-success btn-sm" onclick="location.reload()">
                <i class="fas fa-redo"></i> Reload Page
            </button>
        </div>
    </div>
    
    <!-- Stats Bar -->
    <div class="stats-bar">
        <div class="stat-item">
            <h4>Total Cameras</h4>
            <p>{{ count($cameras) }}</p>
        </div>
        <div class="stat-item">
            <h4>Online Cameras</h4>
            <p id="online-count">{{ count($cameras) }}</p>
        </div>
        <div class="stat-item">
            <h4>Last Update</h4>
            <p id="current-timestamp">-</p>
        </div>
        <div class="stat-item">
            <h4>System Status</h4>
            <p style="color: #28a745;">Active</p>
        </div>
    </div>
    
    <!-- CCTV Grid -->
    <div class="cctv-grid">
        @foreach($cameras as $camera)
        <div class="cctv-card">
                <h3>
                    <span class="status-indicator" id="status-{{ $camera['id'] }}"></span>
                    {{ $camera['name'] }}
                </h3>
                
                <div class="cctv-frame wide">
                    <img id="camera-{{ $camera['id'] }}" 
                        src="{{ $camera['url'] }}?t={{ time() }}" 
                        alt="{{ $camera['name'] }}"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    
                    <div class="loading-overlay" id="loading-{{ $camera['id'] }}" style="display: none;">
                        <div>
                            <i class="fas fa-spinner fa-spin"></i><br>
                            Loading...
                        </div>
                    </div>
                </div>

                @if(isset($camera['description']))
                <div class="mt-2">
                    <small class="text-muted">{{ $camera['description'] }}</small>
                </div>
                @endif
            </div>
            @endforeach
        </div>
        @if(empty($cameras))
        <div class="text-center mt-5">
            <i class="fas fa-video-slash fa-3x text-muted mb-3"></i>
            <h3 class="text-muted">No Cameras Configured</h3>
            <p class="text-muted">Please configure your CCTV cameras in the system settings.</p>
        </div>
        @endif
    </div>

@if(session('success'))
<div class="alert alert-success alert-dismissible fade show" role="alert">
    {{ session('success') }}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
@endif

@if(session('error'))
<div class="alert alert-danger alert-dismissible fade show" role="alert">
    {{ session('error') }}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
@endif
@endsection