<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;


class Overtime extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $fillable = [
        'employee_name', 
        'department', 
        'overtime_date', 
        'start_time', 
        'end_time', 
        'notes', 
        'duration', 
        'status'
    ];

    protected $dates = [
        'start_time', 
        'end_time'
    ];
}