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
            $table->dropColumn(['status', 'metadata']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listriks', function (Blueprint $table) {
            $table->string('status')->nullable()->after('power_factor');
            $table->json('metadata')->nullable()->after('status');
        });
    }
};
