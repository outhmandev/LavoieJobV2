<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('profiles', 'project_id')) {
                $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('profiles', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
