<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $table = 'dht11_data'; // Nama tabel di MySQL
    protected $fillable = ['temperature', 'humidity', 'created_at'];
    public $timestamps = false; // Karena timestamp otomatis dari MySQL
}
