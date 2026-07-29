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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique()->nullable();
            $table->string('full_name');
            $table->string('avatar')->nullable();
            $table->string('status')->default('active');
            $table->string('cin')->nullable();
            $table->date('cin_validity')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('birth_city')->nullable();
            $table->decimal('rate', 2, 1)->default(0);
            $table->string('nationality')->nullable();
            $table->string('religion')->nullable();
            $table->string('education_level')->nullable();
            $table->string('marital_status')->nullable();
            $table->integer('children_count')->default(0);
            $table->text('children_details')->nullable();
            $table->string('cin_address')->nullable();
            $table->string('origin_city')->nullable();
            $table->string('current_address')->nullable();
            $table->string('current_city')->nullable();
            $table->string('education_specialty')->nullable();
            $table->string('email')->nullable();
            $table->string('phone_1')->nullable();
            $table->string('phone_2')->nullable();
            $table->string('source')->nullable();
            $table->string('job')->nullable();
            $table->decimal('min_price', 10, 2)->nullable();
            $table->decimal('max_price', 10, 2)->nullable();
            $table->string('experience_years')->nullable();
            $table->text('experience_details')->nullable();
            $table->boolean('has_diseases')->default(false);
            $table->text('disease_details')->nullable();
            $table->string('mobility')->nullable();
            $table->text('observation')->nullable();
            $table->boolean('pet_allergies')->default(false);
            $table->text('allergy_details')->nullable();
            $table->json('criteria')->nullable();
            $table->string('attending_physician')->nullable();
            $table->string('languages')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
