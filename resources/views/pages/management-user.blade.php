@extends('layouts.default')

@section('title', 'Management User')

@push('css')
    <link href="{{ asset('assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css') }}" rel="stylesheet" />
    <link href="{{ asset('assets/plugins/gritter/css/jquery.gritter.css') }}" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" rel="stylesheet" />
    <link href="{{ asset('assets/css/indikator.css') }}" rel="stylesheet" />
    <link href="{{ asset('assets/css/dashboard-v1.css') }}" rel="stylesheet" />
    <link href="{{ asset('assets/css/krakatau-modal-fixes.css') }}" rel="stylesheet" />
@endpush

@section('content')
    @if(auth()->check() && auth()->user()->getRoleNames()->first() && auth()->user()->getRoleNames()->first() != 'user')
        @livewire('user-management')
    @endif
@endsection
