<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_request_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_request_id')->constrained('contract_requests')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('user_role')->nullable();
            $table->string('action'); // created, approved, rejected, generation_started, generation_completed, generation_failed, cancelled, downloaded, retried
            $table->text('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_request_audits');
    }
};
