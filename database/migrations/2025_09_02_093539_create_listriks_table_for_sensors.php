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
        // Drop table if exists and create new one
        Schema::dropIfExists('listriks');
        
        Schema::create('listriks', function (Blueprint $table) {
            $table->id();
            $table->string('lokasi')->default('PT Krakatau Sarana Property');
            
            // PZEM Sensor Data
            $table->float('tegangan')->nullable()->comment('Voltage in V');
            $table->float('arus')->nullable()->comment('Current in A');
            $table->float('daya')->nullable()->comment('Power in W');
            $table->float('energi')->nullable()->comment('Energy in kWh');
            $table->float('frekuensi')->nullable()->default(50.0)->comment('Frequency in Hz');
            $table->float('power_factor')->nullable()->default(0.85)->comment('Power Factor');
            
            // Legacy columns (keep for compatibility)
            $table->float('listrik')->nullable();
            $table->float('ac')->nullable();
            $table->float('lampu')->nullable();
            
            // Additional fields
            $table->string('status')->default('active');
            $table->string('source')->nullable()->comment('Data source');
            $table->text('metadata')->nullable()->comment('Additional metadata as JSON');
            $table->timestamp('sensor_timestamp')->nullable()->comment('Sensor timestamp');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listriks');
    }
};
