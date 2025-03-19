<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('listriks', function (Blueprint $table) {
            $table->id();
            $table->string('lokasi'); // CM1, CM2, dll.
            $table->float('listrik');
            $table->float('ac');
            $table->float('lampu');
            $table->timestamps();
        });
    }    

    public function down()
    {
        Schema::dropIfExists('listriks');
    }
};
