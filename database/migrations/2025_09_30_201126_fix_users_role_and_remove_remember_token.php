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
        Schema::table('users', function (Blueprint $table) {
            // Drop remember_token column if exists
            if (Schema::hasColumn('users', 'remember_token')) {
                $table->dropColumn('remember_token');
            }

            // Modify role column to have default value and not nullable
            if (Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->nullable(false)->change();
            } else {
                $table->string('role')->default('user')->after('password');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add back remember_token
            $table->rememberToken()->nullable();

            // Make role nullable again
            $table->string('role')->nullable()->change();
        });
    }
};
