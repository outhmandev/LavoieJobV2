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
            // Check if the legacy column exists before renaming (so migrate:fresh doesn't break)
            if (Schema::hasColumn('profiles', 'p_nom')) {
                // Ignore m_mat, p_affectation, p_reclamation (they are not in modern schema, can be kept or dropped)
                $table->renameColumn('p_mat', 'matricule');
                $table->renameColumn('p_nom', 'full_name');
                $table->renameColumn('p_file_img', 'avatar');
                $table->renameColumn('p_statut', 'status');
                $table->renameColumn('p_cin', 'cin');
                $table->renameColumn('p_cin_v', 'cin_validity');
                $table->renameColumn('p_date_naissance', 'birth_date');
                $table->renameColumn('p_ville_n', 'birth_city');
                
                // p_rate in old is int(11), in new is decimal(2,1). Rename and change type if needed, but rename is safer.
                $table->renameColumn('p_rate', 'rate');
                $table->renameColumn('p_nationalite', 'nationality');
                $table->renameColumn('p_religion', 'religion');
                $table->renameColumn('p_niveau_etude', 'education_level');
                $table->renameColumn('p_situation_fam', 'marital_status');
                $table->renameColumn('p_n_enfant', 'children_count');
                $table->renameColumn('p_enfants_details', 'children_details');
                $table->renameColumn('p_adresse_cin', 'cin_address');
                $table->renameColumn('p_ville_o', 'origin_city');
                $table->renameColumn('p_adresse_act', 'current_address');
                $table->renameColumn('p_ville_a', 'current_city');
                $table->renameColumn('p_spe_etude', 'education_specialty');
                $table->renameColumn('p_email', 'email');
                $table->renameColumn('p_gsm1', 'phone_1');
                $table->renameColumn('p_gsm2', 'phone_2');
                $table->renameColumn('p_source', 'source');
                $table->renameColumn('p_fonction', 'job');
                
                $table->renameColumn('p_prix_min', 'min_price');
                $table->renameColumn('p_prix_max', 'max_price');
                
                $table->renameColumn('p_experience', 'experience_years');
                $table->renameColumn('p_experience_detail', 'experience_details');
                
                $table->renameColumn('p_maladie', 'has_diseases');
                $table->renameColumn('p_maladie_details', 'disease_details');
                $table->renameColumn('p_mobilite', 'mobility');
                $table->renameColumn('p_observation', 'observation');
                
                $table->renameColumn('p_allergie_animaux', 'pet_allergies');
                $table->renameColumn('p_allergies_details', 'allergy_details');
                
                $table->renameColumn('p_langue', 'languages');
                $table->renameColumn('p_nom_medecin', 'attending_physician');
                $table->renameColumn('p_criteres', 'criteria');
                
                // Map the created_at / updated_at
                $table->renameColumn('p_inscription_date', 'created_at');
                $table->renameColumn('p_edit_date', 'updated_at');
            }
        });
        
        // Also fix the types so they match the modern schema (like has_diseases from string to boolean)
        if (Schema::hasColumn('profiles', 'has_diseases')) {
            // DB::statement can be used if Doctrine DBAL has issues with enum/booleans
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
