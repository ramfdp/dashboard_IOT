<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('overtimes', function (Blueprint $table) {
            // Update the light_selection column to support 8 relays
            // Keep backward compatibility with existing itms1, itms2, all values
            $table->string('light_selection')->nullable()->default(null)->change();
        });

        // Update existing records to use new relay naming while maintaining functionality
        DB::statement("UPDATE overtimes SET light_selection = 'relay1' WHERE light_selection = 'itms1'");
        DB::statement("UPDATE overtimes SET light_selection = 'relay2' WHERE light_selection = 'itms2'");
        // 'all' remains the same for backward compatibility
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to legacy naming for rollback
        DB::statement("UPDATE overtimes SET light_selection = 'itms1' WHERE light_selection = 'relay1'");
        DB::statement("UPDATE overtimes SET light_selection = 'itms2' WHERE light_selection = 'relay2'");
    }
};
