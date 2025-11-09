@php
    $appHeaderAttr = (!empty($appHeaderInverse)) ? ' data-bs-theme=dark' : '';
    $appHeaderMenu = (!empty($appHeaderMenu)) ? $appHeaderMenu : '';
    $appHeaderMegaMenu = (!empty($appHeaderMegaMenu)) ? $appHeaderMegaMenu : ''; 
    $appHeaderTopMenu = (!empty($appHeaderTopMenu)) ? $appHeaderTopMenu : '';
@endphp

<!-- BEGIN #header -->
<div id="header" class="app-header" {{ $appHeaderAttr }}>
    <div class="navbar-header">
        @if ($appSidebarTwo)
        <button type="button" class="navbar-mobile-toggler" data-toggle="app-sidebar-end-mobile">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
        @endif
        <img src="{{ asset('assets/img/logo/ksp001.png') }}" alt="KSP Logo" class="logo-ksp">
        @if ($appHeaderMegaMenu && !$appSidebarTwo)
        <button type="button" class="navbar-mobile-toggler" data-bs-toggle="collapse" data-bs-target="#top-navbar">
            <span class="fa-stack fa-lg">
                <i class="far fa-square fa-stack-2x"></i>
                <i class="fa fa-cog fa-stack-1x mt-1px"></i>
            </span>
        </button>
        @endif
        @if($appTopMenu && !$appSidebarHide && !$appSidebarTwo)
        <button type="button" class="navbar-mobile-toggler" data-toggle="app-top-menu-mobile">
            <span class="fa-stack fa-lg">
                <i class="far fa-square fa-stack-2x"></i>
                <i class="fa fa-cog fa-stack-1x mt-1px"></i>
            </span>
        </button>
        @endif
        @if (!$appSidebarHide)
        <button type="button" class="navbar-mobile-toggler" data-toggle="app-sidebar-mobile">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
        @endif
    </div>
    
    @includeWhen($appHeaderMegaMenu, 'includes.component.header-mega-menu')
    
    <!-- BEGIN header-nav -->
    <div class="navbar-nav">
        <!-- Sync Status Indicators (Global) -->
        <div class="navbar-item d-none d-md-flex align-items-center me-2">
            <small class="badge bg-secondary me-2" id="dbSyncStatus" title="Database Sync Status">
                <i class="fa fa-database"></i> DB: Waiting
            </small>
            <small class="badge bg-secondary" id="firebaseSyncStatus" title="Firebase Sync Status">
                <i class="fa fa-cloud"></i> Firebase: Waiting
            </small>
        </div>
        
        @isset($appHeaderLanguageBar)
            @include('includes.component.header-language-bar')
        @endisset
        
        <div class="navbar-item navbar-user dropdown">
            <a href="#" class="navbar-link dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
                <img src="/assets/img/user/ks-icon.png" alt="" /> 
                <span>
                    @if(auth()->check())
                        <span class="d-none d-md-inline">{{ auth()->user()->name }}</span>
                    @else
                        <span class="d-none d-md-inline">Guest</span>
                    @endif
                        <b class="caret"></b>
                </span>

            </a>
            @include('includes.component.header-dropdown-profile')
        </div>
        
        @if($appSidebarTwo)
        <div class="navbar-divider d-none d-md-block"></div>
        <div class="navbar-item d-none d-md-block">
            <a href="javascript:;" data-toggle="app-sidebar-end" class="navbar-link icon">
                <i class="fa fa-th"></i>
            </a>
        </div>
        @endif
    </div>
    <!-- END header-nav -->
</div>
<!-- END #header -->

<style>
    .logo-ksp {
        max-width: 150px; 
        height: auto;
    }
</style>
