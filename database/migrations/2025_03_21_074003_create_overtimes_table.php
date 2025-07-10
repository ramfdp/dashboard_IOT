<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('overtimes', function (Blueprint $table) {
            $table->id();
            $table->string('employee_name');      
            $table->string('division_name');       
            $table->date('overtime_date');
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->text('notes')->nullable();
            $table->integer('duration')->nullable();
            $table->integer('status')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('overtimes');
    }
};
