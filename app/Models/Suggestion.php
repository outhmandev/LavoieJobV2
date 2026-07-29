<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Suggestion extends Model
{
    use HasFactory;

    protected $appends = ['match_score'];

    protected $fillable = [
        'client_id',
        'profile_id',
        'user_id',
        'status',
        'notes',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getMatchScoreAttribute()
    {
        // Require eager loaded relations to avoid N+1 issues
        if (!$this->relationLoaded('client') || !$this->relationLoaded('profile')) {
            return 0;
        }

        $client = $this->client;
        $profile = $this->profile;

        if (!$client || !$profile) {
            return 0;
        }

        $score = 0;

        // 1. Job Function / Role (40%)
        if (!empty($client->project_id) && !empty($profile->project_id)) {
            if ($client->project_id == $profile->project_id) {
                $score += 40;
            }
        } elseif (!empty($client->c_fonction) && !empty($profile->job)) {
            // Fallback to text matching if project_id is missing
            if (strtolower(trim($client->c_fonction)) === strtolower(trim($profile->job))) {
                $score += 40;
            } else {
                if (str_contains(strtolower($profile->job), strtolower(trim($client->c_fonction))) || 
                    str_contains(strtolower(trim($client->c_fonction)), strtolower($profile->job))) {
                    $score += 20;
                }
            }
        }

        // 2. Budget / Pricing (20%)
        if (!empty($client->c_prix_max) && $client->c_prix_max > 0) {
            $candidatePrice = $profile->min_price ?: ($profile->max_price ?: 0);
            if ($candidatePrice > 0 && $candidatePrice <= $client->c_prix_max) {
                $score += 20;
            } elseif ($candidatePrice == 0) {
                // If candidate price is not set, give half points
                $score += 10;
            }
        } else {
            // Client didn't specify budget, auto-grant points
            $score += 20;
        }

        // 3. Location / Mobility (15%)
        if (!empty($client->c_ville_a)) {
            if (strtolower(trim($client->c_ville_a)) === strtolower(trim($profile->current_city))) {
                $score += 15;
            } elseif (strtolower($profile->mobility) === 'oui') {
                $score += 15; // Mobile candidate
            }
        } else {
            $score += 15;
        }

        // 4. Pet Compatibility (10%)
        if (strtolower($client->c_presence_animaux) === 'oui') {
            if (!$profile->pet_allergies) {
                $score += 10;
            }
        } else {
            $score += 10;
        }

        // 5. Preferences (Nationality/Religion) (15%)
        $prefScore = 0;
        if (!empty($client->c_p_nationalite)) {
            if (strtolower(trim($client->c_p_nationalite)) === strtolower(trim($profile->nationality))) {
                $prefScore += 7.5;
            }
        } else {
            $prefScore += 7.5;
        }

        if (!empty($client->c_p_religion)) {
            if (strtolower(trim($client->c_p_religion)) === strtolower(trim($profile->religion))) {
                $prefScore += 7.5;
            }
        } else {
            $prefScore += 7.5;
        }

        $score += $prefScore;

        return min(100, max(0, round($score)));
    }
}
