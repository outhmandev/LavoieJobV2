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
            $table->text('blacklist_motif')->nullable()->after('status');
        });
        
        Schema::table('clients', function (Blueprint $table) {
            $table->text('blacklist_motif')->nullable()->after('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('blacklist_motif');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('blacklist_motif');
        });
    }
};
