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
            $table->integer('c_affectation')->default(0);
            $table->integer('c_reclamation')->default(0);
            $table->string('c_nom')->nullable();
            $table->integer('c_mat')->default(0);
            $table->string('c_file_img')->nullable();
            $table->string('c_statut')->nullable();
            $table->string('c_cin')->nullable();
            $table->date('c_cin_v')->nullable();
            $table->date('c_date_naissance')->nullable();
            $table->string('c_nationalite')->nullable();
            $table->string('c_situation_fam')->nullable();
            $table->bigInteger('c_n_enfant')->default(0);
            $table->text('c_enfants_details')->nullable();
            $table->string('c_adresse_cin')->nullable();
            $table->string('c_ville_o')->nullable();
            $table->string('c_adresse_act')->nullable();
            $table->string('c_ville_a')->nullable();
            $table->string('c_logement')->nullable();
            $table->string('c_gsm1')->nullable();
            $table->string('c_gsm2')->nullable();
            $table->string('c_source')->nullable();
            $table->string('c_csource')->nullable();
            $table->string('c_responsable')->nullable();
            $table->string('c_fonction')->nullable();
            $table->string('c_fonction_source')->nullable();
            $table->text('c_criteres')->nullable();
            $table->string('c_p_nationalite')->nullable();
            $table->string('c_p_religion')->nullable();
            $table->bigInteger('c_prix_min')->default(0);
            $table->bigInteger('c_prix_max')->default(0);
            $table->string('c_prix_ech')->nullable();
            $table->string('c_repos')->nullable();
            $table->string('c_experience')->nullable();
            $table->string('c_mode')->nullable();
            $table->string('c_honoraire')->nullable();
            $table->longText('c_observation')->nullable();
            $table->date('c_inscription_date')->nullable();
            $table->timestamp('c_edit_date')->nullable();
            $table->string('c_presence_animaux', 20)->nullable();
            $table->integer('c_nombre_animaux')->default(0);
            $table->text('c_animaux_details')->nullable();
            
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
