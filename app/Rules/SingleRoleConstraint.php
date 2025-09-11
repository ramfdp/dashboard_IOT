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
        // If we're updating an existing user
        if ($this->userId) {
            $user = User::find($this->userId);

            if ($user) {
                // Check if user already has Spatie roles that would conflict
                $existingRoles = $user->roles()->count();

                if ($existingRoles > 1) {
                    $fail('This user has multiple roles assigned. Please resolve role conflicts before updating.');
                }

                // Check if the new role_id differs from existing Spatie role
                $currentSpatieRole = $user->roles()->first();
                if ($currentSpatieRole && $currentSpatieRole->id != $value) {
                    // This is acceptable - we'll sync it in the model
                }
            }
        }

        // Additional validation can be added here
        // For example, checking if certain roles are restricted
    }
}
