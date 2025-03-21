@extends('layouts.default', [
    'paceTop' => true, 
    'appSidebarHide' => true, 
    'appHeaderHide' => true, 
    'appContentClass' => 'p-0'
])

@section('title', 'Register Page')

@section('content')
    <!-- BEGIN register -->
    <div class="register register-with-news-feed">
        <!-- BEGIN news-feed -->
        <div class="news-feed">
            <div class="news-image" style="background-image: url(/assets/img/login-bg/login-bg-15.jpg)"></div>
            <div class="news-caption">
                <h4 class="caption-title"><b>IOT</b> Control Panel</h4>
                <p>
					Controlling IOT basis Web
                </p>
            </div>
        </div>
        <!-- END news-feed -->
        
        <!-- BEGIN register-container -->
        <div class="register-container">
            <!-- BEGIN register-header -->
            <div class="register-header mb-25px h1">
                <div class="mb-1">Sign Up</div>
                <small class="d-block fs-15px lh-16">Ayo Buat Akun untuk Mengakses IOT Control Panel</small>
            </div>
            <!-- END register-header -->
            
            <!-- BEGIN register-content -->
            <div class="register-content">
            <form action="{{ route('register') }}" method="POST" class="fs-13px">
                @csrf
                <div class="mb-3">
                    <label class="mb-2">Name <span class="text-danger">*</span></label>
                    <div class="row gx-3">
                        <div class="col-md-6 mb-2 mb-md-0">
                            <input type="text" name="first_name" class="form-control fs-13px" placeholder="First name" required />
                        </div>
                        <div class="col-md-6">
                            <input type="text" name="last_name" class="form-control fs-13px" placeholder="Last name" required />
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="mb-2">Email <span class="text-danger">*</span></label>
                    <input type="email" name="email" class="form-control fs-13px" placeholder="Email address" required />
                </div>
                
                <div class="mb-3">
                    <label class="mb-2">Re-enter Email <span class="text-danger">*</span></label>
                    <input type="email" name="email_confirmation" class="form-control fs-13px" placeholder="Re-enter email address" required />
                </div>
                
                <div class="mb-3">
                    <label class="mb-2">Password <span class="text-danger">*</span></label>
                    <input type="password" name="password" class="form-control fs-13px" placeholder="Password" required />
                </div>
                
                <div class="mb-3">
                    <label class="mb-2">Confirm Password <span class="text-danger">*</span></label>
                    <input type="password" name="password_confirmation" class="form-control fs-13px" placeholder="Confirm Password" required />
                </div>

                <div class="form-check mb-4">
                    <input class="form-check-input" type="checkbox" name="agreement" value="1" id="agreementCheckbox" required />
                    <label class="form-check-label" for="agreementCheckbox">
                        By clicking Sign Up, you agree to our <a href="javascript:;">Terms</a> and that you have read our <a href="javascript:;">Data Policy</a>, including our <a href="javascript:;">Cookie Use</a>.
                    </label>
                </div>
                
                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul>
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <div class="mb-4">
                    <button type="submit" class="btn btn-theme d-block w-100 btn-lg h-45px fs-13px">Sign Up</button>
                </div>
            </form>

            </div>
            <!-- END register-content -->
        </div>
        <!-- END register-container -->
    </div>
    <!-- END register -->
@endsection