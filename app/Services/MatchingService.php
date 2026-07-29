<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Profile;
use Illuminate\Support\Collection;

class MatchingService
{
    /**
     * Find matching profiles for a given client based on legacy logic translation.
     *
     * @param Client $client
     * @return Collection
     */
    public function matchProfilesForClient(Client $client): Collection
    {
        $query = Profile::query()->where('status', 'active');

        if ($client->job) {
            $query->where('job', $client->job);
        }

        if ($client->max_price) {
            $query->where('min_price', '<=', $client->max_price);
        }

        if ($client->current_city) {
            $query->where('current_city', $client->current_city);
        }

        if ($client->has_pets) {
            $query->where('pet_allergies', false);
        }

        return $query->get();
    }
}
