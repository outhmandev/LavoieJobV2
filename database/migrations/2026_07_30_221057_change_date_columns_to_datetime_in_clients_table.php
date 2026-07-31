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
        Schema::table('clients', function (Blueprint $table) {
            $table->dateTime('cin_v')->nullable()->change();
            $table->dateTime('date_naissance')->nullable()->change();
            $table->dateTime('inscription_date')->nullable()->change();
            $table->dateTime('edit_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->timestamp('cin_v')->nullable()->change();
            $table->timestamp('date_naissance')->nullable()->change();
            $table->timestamp('inscription_date')->nullable()->change();
            $table->timestamp('edit_date')->nullable()->change();
        });
    }
};
