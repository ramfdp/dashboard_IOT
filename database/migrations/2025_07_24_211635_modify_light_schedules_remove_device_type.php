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
        Schema::table('light_schedules', function (Blueprint $table) {
            $table->dropColumn('device_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('light_schedules', function (Blueprint $table) {
            $table->enum('device_type', ['relay1', 'relay2'])->after('name');
        });
    }
};
