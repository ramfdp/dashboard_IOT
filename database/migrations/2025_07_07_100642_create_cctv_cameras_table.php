<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cctv_cameras', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('description')->nullable();
            $table->string('location')->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->string('ip_address')->nullable();
            $table->integer('port')->nullable();
            $table->json('settings')->nullable();
            $table->timestamp('last_online')->nullable();
            $table->boolean('is_recording')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cctv_cameras');
    }
};