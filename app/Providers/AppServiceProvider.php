<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Livewire\Livewire;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Set Livewire asset URL to match APP_URL with proper base path
        Livewire::setUpdateRoute(function ($handle) {
            return \Illuminate\Support\Facades\Route::post('/dashboard_IOT/public/livewire/update', $handle);
        });

        Livewire::setScriptRoute(function ($handle) {
            return \Illuminate\Support\Facades\Route::get('/dashboard_IOT/public/livewire/livewire.js', $handle);
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
