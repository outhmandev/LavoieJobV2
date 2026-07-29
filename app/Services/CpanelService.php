<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class CpanelService
{
    protected $host;
    protected $username;
    protected $token;
    protected $domain;

    public function __construct()
    {
        $this->host = rtrim(config('services.cpanel.host'), '/');
        $this->username = config('services.cpanel.username');
        $this->token = config('services.cpanel.api_token');
        $this->domain = config('services.cpanel.domain');

        if (empty($this->host) || empty($this->token) || empty($this->domain)) {
            throw new Exception("cPanel configuration is missing. Please check your .env file.");
        }
        
        if (empty($this->username)) {
            throw new Exception("cPanel username is missing. Please set CPANEL_USERNAME in your .env file.");
        }
    }

    protected function getUrl(string $module, string $function): string
    {
        return "{$this->host}/execute/{$module}/{$function}";
    }

    protected function request(string $module, string $function, array $data = [])
    {
        $url = $this->getUrl($module, $function);

        $response = Http::withHeaders([
            'Authorization' => "cpanel {$this->username}:{$this->token}",
        ])->get($url, $data);

        if ($response->failed()) {
            throw new Exception("cPanel API Request Failed: " . $response->body());
        }

        $result = $response->json();

        if (isset($result['errors']) && count($result['errors']) > 0) {
            throw new Exception("cPanel API Error: " . implode(', ', $result['errors']));
        }

        if (isset($result['status']) && $result['status'] === 0) {
            $error = $result['errors'][0] ?? 'Unknown cPanel API Error';
            throw new Exception("cPanel API Error: " . $error);
        }

        return $result['data'] ?? [];
    }

    public function listEmails()
    {
        return $this->request('Email', 'list_pops_with_disk');
    }

    public function createEmail(string $email, string $password, $quota = 0)
    {
        return $this->request('Email', 'add_pop', [
            'email' => $email,
            'password' => $password,
            'domain' => $this->domain,
            'quota' => $quota,
        ]);
    }

    public function updateEmailPassword(string $email, string $password)
    {
        return $this->request('Email', 'passwd_pop', [
            'email' => $email,
            'password' => $password,
            'domain' => $this->domain,
        ]);
    }
    
    public function updateEmailQuota(string $email, $quota)
    {
        return $this->request('Email', 'edit_quota', [
            'email' => $email,
            'domain' => $this->domain,
            'quota' => $quota,
        ]);
    }

    public function deleteEmail(string $email)
    {
        return $this->request('Email', 'delete_pop', [
            'email' => $email,
            'domain' => $this->domain,
        ]);
    }
}
