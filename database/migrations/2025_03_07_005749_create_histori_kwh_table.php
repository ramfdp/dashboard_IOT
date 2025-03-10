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
        Schema::create('histori_kwh', function (Blueprint $table) {
            $table->id();
            $table->float('tegangan');
            $table->float('arus');
            $table->float('daya');
            $table->float('energi');
            $table->float('frekuensi');
            $table->float('power_factor');
            $table->timestamp('tanggal_input')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('histori_kwh');
    }
};
