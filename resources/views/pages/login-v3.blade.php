@extends('layouts.default', [
    'paceTop' => true,
    'appSidebarHide' => true,
    'appHeaderHide' => true,
    'appContentClass' => 'p-0'
])

@section('title', 'Login Page')

@section('content')
    <div class="login login-with-news-feed">
        <div class="news-feed">
            <div class="news-image" style="background-image: url('{{ asset('assets/img/login-bg/wisma krakatau background.png') }}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
            <div class="news-caption">
                <h4 class="caption-title"><b>IOT</b> Control Panel</h4>
                <p>Tempat Untuk Mengkontrol Penggunaan Listrik</p>
            </div>
        </div> 
        
        <div class="login-container">
            <div class="login-header mb-30px">
			<div class="brand">
    <div class="d-flex align-items-center">
        <img src="{{ asset('assets/img/logo/ksp001.png') }}" alt="Logo" class="logo-img" style="height: 20px; margin-right: 8px;">
        <b>IOT</b> Control Panel
    </div>
    <small>Controlling IOT basis Web</small>
</div>

                <div class="icon">
                    <i class="fa fa-sign-in-alt"></i>
                </div>
            </div>
            
            <div class="login-content">
                <form action="{{ route('login-v3') }}" method="POST" class="fs-13px">
                    @csrf
                    
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul>
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                    
                    <div class="form-floating mb-15px">
                        <input type="email" name="email" class="form-control h-45px fs-13px" placeholder="Email Address" required />
                        <label class="d-flex align-items-center fs-13px text-gray-600">Email Address</label>
                    </div>
                    <div class="form-floating mb-15px">
                        <input type="password" name="password" class="form-control h-45px fs-13px" placeholder="Password" required />
                        <label class="d-flex align-items-center fs-13px text-gray-600">Password</label>
                    </div>
                    <div class="form-check mb-30px">
                        <input class="form-check-input" type="checkbox" name="remember" />
                        <label class="form-check-label">Remember Me</label>
                    </div>
                    <div class="mb-15px">
                        <button type="submit" class="btn btn-theme d-block h-45px w-100 btn-lg fs-14px">Sign me in</button>
                    </div>
                    <hr class="bg-gray-600 opacity-2" />
                    <div class="text-gray-600 text-center text-gray-500-darker mb-0">
                        &copy; Krakatau Sarana Properti IOT All Right Reserved 2025
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection