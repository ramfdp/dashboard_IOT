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
            $table->unsignedBigInteger('employee_id'); // Ganti employee_name dengan employee_id
            $table->unsignedBigInteger('department_id'); // Ganti department dengan department_id
            $table->date('overtime_date');
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->text('notes')->nullable();
            $table->integer('duration')->nullable();
            $table->integer('status')->default(0);
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('overtimes');
    }
};