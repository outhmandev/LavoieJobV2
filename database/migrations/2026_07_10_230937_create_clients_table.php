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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->integer('m_mat')->default(0);
            $table->integer('affectation')->default(0);
            $table->integer('reclamation')->default(0);
            $table->string('nom')->nullable();
            $table->integer('mat')->default(0);
            $table->string('file_img')->nullable();
            $table->string('statut')->nullable();
            $table->string('cin')->nullable();
            $table->timestamp('cin_v')->nullable();
            $table->timestamp('date_naissance')->nullable();
            $table->string('nationalite')->nullable();
            $table->string('situation_fam')->nullable();
            $table->bigInteger('n_enfant')->default(0);
            $table->text('enfants_details')->nullable();
            $table->string('adresse_cin')->nullable();
            $table->string('ville_o')->nullable();
            $table->string('adresse_act')->nullable();
            $table->string('ville_a')->nullable();
            $table->string('logement')->nullable();
            $table->string('gsm1')->nullable();
            $table->string('gsm2')->nullable();
            $table->string('source')->nullable();
            $table->string('csource')->nullable();
            $table->string('responsable')->nullable();
            $table->string('fonction')->nullable();
            $table->string('fonction_source')->nullable();
            $table->text('criteres')->nullable();
            $table->string('religion')->nullable();
            $table->bigInteger('prix_min')->default(0);
            $table->bigInteger('prix_max')->default(0);
            $table->string('prix_ech')->nullable();
            $table->string('repos')->nullable();
            $table->string('experience')->nullable();
            $table->string('mode')->nullable();
            $table->string('honoraire')->nullable();
            $table->longText('observation')->nullable();
            $table->timestamp('inscription_date')->nullable();
            $table->timestamp('edit_date')->nullable();
            $table->string('presence_animaux', 20)->nullable();
            $table->integer('nombre_animaux')->default(0);
            $table->text('animaux_details')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
