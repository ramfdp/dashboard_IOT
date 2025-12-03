<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\User;

class SingleRoleConstraint implements ValidationRule
{
    protected $userId;

    public function __construct($userId = null)
    {
        $this->userId = $userId;
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Simple validation for role field (no longer using Spatie Permission)
        // Check if role is valid
        $validRoles = ['admin', 'user'];
        
        if (!in_array($value, $validRoles)) {
            $fail('The selected role is invalid. Must be either admin or user.');
        }
        
        // Additional validation can be added here
        // For example, checking if certain roles are restricted
    }
}
