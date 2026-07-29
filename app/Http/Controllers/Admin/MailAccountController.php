<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CpanelService;
use Exception;

class MailAccountController extends Controller
{
    protected $cpanel;

    public function __construct(CpanelService $cpanel)
    {
        $this->cpanel = $cpanel;
    }

    public function index()
    {
        try {
            $emails = $this->cpanel->listEmails();
        } catch (Exception $e) {
            $emails = [];
            // In a real app we might flash an error or handle it more elegantly
            session()->flash('error', $e->getMessage());
        }

        return Inertia::render('Admin/Mails/Index', [
            'emails' => $emails,
            'domain' => config('services.cpanel.domain'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string|regex:/^[a-zA-Z0-9._-]+$/',
            'password' => 'required|string|min:8',
            'quota' => 'nullable|numeric|min:0',
        ]);

        try {
            $this->cpanel->createEmail(
                $data['email'], 
                $data['password'], 
                $data['quota'] ?? 0
            );
            return redirect()->route('admin.mail-accounts.index')->with('success', 'Compte e-mail créé avec succès.');
        } catch (Exception $e) {
            return redirect()->route('admin.mail-accounts.index')->with('error', $e->getMessage());
        }
    }

    public function update(Request $request, string $email)
    {
        $data = $request->validate([
            'password' => 'nullable|string|min:8',
            'quota' => 'nullable|numeric|min:0',
        ]);

        try {
            if (!empty($data['password'])) {
                $this->cpanel->updateEmailPassword($email, $data['password']);
            }
            if (isset($data['quota'])) {
                $this->cpanel->updateEmailQuota($email, $data['quota']);
            }

            return redirect()->route('admin.mail-accounts.index')->with('success', 'Compte e-mail mis à jour avec succès.');
        } catch (Exception $e) {
            return redirect()->route('admin.mail-accounts.index')->with('error', $e->getMessage());
        }
    }

    public function destroy(string $email)
    {
        try {
            $this->cpanel->deleteEmail($email);
            return redirect()->route('admin.mail-accounts.index')->with('success', 'Compte e-mail supprimé avec succès.');
        } catch (Exception $e) {
            return redirect()->route('admin.mail-accounts.index')->with('error', $e->getMessage());
        }
    }
}
