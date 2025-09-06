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
        Schema::table('listriks', function (Blueprint $table) {
            // Add sensor columns for PZEM data
            $table->float('tegangan')->nullable()->comment('Voltage in V');
            $table->float('arus')->nullable()->comment('Current in A');
            $table->float('daya')->nullable()->comment('Power in W');
            $table->float('energi')->nullable()->comment('Energy in kWh');
            $table->float('frekuensi')->nullable()->default(50.0)->comment('Frequency in Hz');
            $table->float('power_factor')->nullable()->default(0.85)->comment('Power Factor');
            $table->string('status')->nullable()->default('active');
            $table->string('source')->nullable()->comment('Data source');
            $table->text('metadata')->nullable()->comment('Additional metadata as JSON');
            $table->timestamp('sensor_timestamp')->nullable()->comment('Sensor timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listriks', function (Blueprint $table) {
            $table->dropColumn([
                'tegangan',
                'arus',
                'daya',
                'energi',
                'frekuensi',
                'power_factor',
                'status',
                'source',
                'metadata',
                'sensor_timestamp'
            ]);
        });
    }
};
