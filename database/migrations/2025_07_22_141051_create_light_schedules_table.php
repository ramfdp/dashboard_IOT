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
        Schema::create('light_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Schedule name
            $table->enum('device_type', ['relay1', 'relay2']); // Which light device
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('start_time'); // When to turn on
            $table->time('end_time'); // When to turn off
            $table->boolean('is_active')->default(true); // Enable/disable schedule
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('light_schedules');
    }
};
