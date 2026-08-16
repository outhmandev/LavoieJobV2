const fs = require('fs');

const createPath = 'c:/Users/MH/Desktop/Lavoiejob/LavoieJobV2/resources/js/Pages/Clients/Create.jsx';
let content = fs.readFileSync(createPath, 'utf8');

// 1. Add `domicare_data: {}` to useForm
content = content.replace(
    "c_logement: '',",
    "c_logement: '',\n        domicare_data: {\n            // Demandeur\n            lien_patient: '',\n            // Patient\n            patient_nom: '',\n            patient_cin: '',\n            patient_assurance: '',\n            patient_age: '',\n            patient_nationalite: 'Marocaine',\n            patient_adresse: '',\n            patient_ville: '',\n            patient_gsm1: '',\n            patient_gsm2: '',\n            patient_situation_mat: '',\n            patient_situation_vie: '',\n            patient_profil: '',\n            patient_autonomie: '',\n            // Medical\n            conscience: '',\n            respiration: '',\n            fatigue: 'Non',\n            douleur: 'Non',\n            etat_psy: '',\n            memoire: '',\n            etat_cutane: '',\n            continence: '',\n            nutrition: '',\n            // Demande\n            motif_appel: '',\n            ambulance: 'Non',\n            autres_besoins: '',\n            profil_recherche: '',\n            urgence: '',\n        },"
);

// 2. Define DOMICARE steps
const stepsDef = `
const standardSteps = [
    { id: 1, name: 'Identité', icon: FiUser },
    { id: 2, name: 'Contact & Logement', icon: FiMapPin },
    { id: 3, name: 'Projet & Critères', icon: FiBriefcase },
    { id: 4, name: 'Médical', icon: FiHeart },
];

const domicareSteps = [
    { id: 1, name: 'Demandeur', icon: FiUser },
    { id: 2, name: 'Patient', icon: FiUser },
    { id: 3, name: 'Médical', icon: FiHeart },
    { id: 4, name: 'Demande', icon: FiFileText },
];
`;
content = content.replace(
    /const steps = \[\s*\{ id: 1, name: 'Identité'[\s\S]*?\];/m,
    stepsDef
);

// 3. Dynamic steps inside component
content = content.replace(
    'const [currentStep, setCurrentStep] = useState(1);',
    'const [currentStep, setCurrentStep] = useState(1);\n    const isDomicare = selectedProject?.name === "DOMICARE";\n    const steps = isDomicare ? domicareSteps : standardSteps;'
);

// 4. Move Project Selection to Step 1 (or above steps)
const projectSelectHtml = `
                {/* Project Selection (Global) */}
                <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-6 z-20 relative">
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <FiBriefcase size={24} />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <InputLabel value="Projet Associé (Requis pour commencer)" className="text-gray-700 dark:text-gray-300 font-bold text-lg" />
                        <select 
                            value={data.project_id} 
                            onChange={handleProjectChange} 
                            className="w-full bg-gray-50 dark:bg-gray-800 border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500 rounded-xl text-gray-800 dark:text-gray-200 font-medium h-14 shadow-sm text-lg" 
                            required
                        >
                            <option value="">-- Sélectionnez d'abord un projet --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                {!selectedProject && (
                    <div className="text-center p-12 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
                        <FiBriefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">Veuillez sélectionner un projet pour commencer.</h3>
                    </div>
                )}

                {selectedProject && (
                    <>
`;
content = content.replace(
    '{/* Stepper Header */}',
    projectSelectHtml + '\n                {/* Stepper Header */}'
);

content = content.replace(
    '                        {/* Bottom Navigation */}',
    '                        {/* Bottom Navigation */}'
);
content = content.replace(
    '</form>',
    '</form>\n                    </>'
);

content = content.replace(
    /<div className="space-y-2">[\s\S]*?<InputLabel value="Projet Associé \*"[\s\S]*?<\/select>\s*<\/div>/m,
    ''
);

const domicareForms = `
                                    {/* DOMICARE - STEP 1 : Demandeur */}
                                    {isDomicare && currentStep === 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><FiUser size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informations Demandeur</h3>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <InputLabel value="Nom et prénom *" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_nom} onChange={e => setData('c_nom', e.target.value)} className="w-full" required />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Lien avec le patient" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.lien_patient} onChange={e => setData('domicare_data', {...data.domicare_data, lien_patient: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Statut (Demandeur)" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.statut} onChange={e => {setData('statut', e.target.value); setData('status', e.target.value); setData('c_statut', e.target.value);}} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300">
                                                    {availableStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="CIN ou Pass" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_cin} onChange={e => setData('c_cin', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Adresse actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_adresse_act} onChange={e => setData('c_adresse_act', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Mail" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput type="email" value={data.c_email} onChange={e => setData('c_email', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 1 *" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <TextInput value={data.c_gsm1} onChange={e => setData('c_gsm1', e.target.value)} className="w-full" required />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 2 (si possible)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_gsm2} onChange={e => setData('c_gsm2', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <InputLabel value="Source" className="text-gray-600 dark:text-gray-400" />
                                                <DynamicSelect value={data.c_source} onChange={val => setData('c_source', val)} options={RECRUITMENT_SOURCES} className="w-full h-[42px]" />
                                            </div>
                                        </div>
                                    )}

                                    {/* DOMICARE - STEP 2 : Patient */}
                                    {isDomicare && currentStep === 2 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400"><FiUser size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informations Patient</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Nom et prénom du patient" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_nom} onChange={e => setData('domicare_data', {...data.domicare_data, patient_nom: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="CIN / PAS" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_cin} onChange={e => setData('domicare_data', {...data.domicare_data, patient_cin: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <InputLabel value="Affiliation à un régime d'assurance obligatoire" className="text-gray-600 dark:text-gray-400 mb-2 font-bold" />
                                                <div className="flex flex-wrap gap-4">
                                                    {['CNOPS', 'CNSS', 'AMO', 'Non'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <input type="radio" name="assurance" value={opt} checked={data.domicare_data.patient_assurance === opt} onChange={e => setData('domicare_data', {...data.domicare_data, patient_assurance: e.target.value})} className="text-indigo-600 focus:ring-indigo-500" />
                                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Âge" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_age} onChange={e => setData('domicare_data', {...data.domicare_data, patient_age: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Nationalité" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_nationalite} onChange={e => setData('domicare_data', {...data.domicare_data, patient_nationalite: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Adresse actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_adresse} onChange={e => setData('domicare_data', {...data.domicare_data, patient_adresse: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Ville" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_ville} onChange={e => setData('domicare_data', {...data.domicare_data, patient_ville: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 1 (Patient)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_gsm1} onChange={e => setData('domicare_data', {...data.domicare_data, patient_gsm1: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 2 (Patient)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_gsm2} onChange={e => setData('domicare_data', {...data.domicare_data, patient_gsm2: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Situation matrimoniale" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_situation_mat} onChange={e => setData('domicare_data', {...data.domicare_data, patient_situation_mat: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Situation de vie" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.domicare_data.patient_situation_vie} onChange={e => setData('domicare_data', {...data.domicare_data, patient_situation_vie: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300">
                                                    <option value="">-- Sélectionnez --</option>
                                                    <option value="Vit seul(e)">Vit seul(e)</option>
                                                    <option value="Vit avec la famille">Vit avec la famille</option>
                                                    <option value="Autre">Autre (à préciser dans observation)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <InputLabel value="Profil du patient" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex flex-wrap gap-3">
                                                    {['Personne âgée', 'Opéré', 'Malade chronique', 'Porteur prothèse/plâtre', 'Autre'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                                            <input type="radio" name="profil_pat" value={opt} checked={data.domicare_data.patient_profil === opt} onChange={e => setData('domicare_data', {...data.domicare_data, patient_profil: e.target.value})} className="text-indigo-600" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <InputLabel value="Autonomie du patient" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex flex-wrap gap-3">
                                                    {['Totalement dépendant (Alité)', 'Semi-autonome', 'Autonome'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex-1 justify-center">
                                                            <input type="radio" name="autonomie" value={opt} checked={data.domicare_data.patient_autonomie === opt} onChange={e => setData('domicare_data', {...data.domicare_data, patient_autonomie: e.target.value})} className="text-emerald-600" />
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DOMICARE - STEP 3 : Médical */}
                                    {isDomicare && currentStep === 3 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400"><FiHeart size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informations Médicales (Patient)</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Allergie" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.allergies} onChange={e => setData('allergies', e.target.value)} className="w-full" placeholder="Précisez si oui..." />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Médecin traitant" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.attending_physician} onChange={e => setData('attending_physician', e.target.value)} className="w-full" />
                                            </div>
                                            
                                            <div className="md:col-span-2 mt-4 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">L'évaluation de l'état du bénéficiaire</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <InputLabel value="Conscience" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.conscience} onChange={e => setData('domicare_data', {...data.domicare_data, conscience: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Respiration" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.respiration} onChange={e => setData('domicare_data', {...data.domicare_data, respiration: e.target.value})} className="w-full" />
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <InputLabel value="Fatigue" className="text-gray-600 dark:text-gray-400" />
                                                        <select value={data.domicare_data.fatigue} onChange={e => setData('domicare_data', {...data.domicare_data, fatigue: e.target.value})} className="w-full bg-white dark:bg-gray-800 rounded-lg">
                                                            <option value="Non">Non</option><option value="Oui">Oui</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Douleur" className="text-gray-600 dark:text-gray-400" />
                                                        <select value={data.domicare_data.douleur} onChange={e => setData('domicare_data', {...data.domicare_data, douleur: e.target.value})} className="w-full bg-white dark:bg-gray-800 rounded-lg">
                                                            <option value="Non">Non</option><option value="Oui">Oui</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <InputLabel value="État psychologique" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.etat_psy} onChange={e => setData('domicare_data', {...data.domicare_data, etat_psy: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Mémoire" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.memoire} onChange={e => setData('domicare_data', {...data.domicare_data, memoire: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Etat cutanée" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.etat_cutane} onChange={e => setData('domicare_data', {...data.domicare_data, etat_cutane: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Continence" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.continence} onChange={e => setData('domicare_data', {...data.domicare_data, continence: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <InputLabel value="Nutrition et hydratation" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.nutrition} onChange={e => setData('domicare_data', {...data.domicare_data, nutrition: e.target.value})} className="w-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DOMICARE - STEP 4 : Demande */}
                                    {isDomicare && currentStep === 4 && (
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400"><FiFileText size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Demande & Besoins</h3>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <InputLabel value="Motif d'appel" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <textarea rows="3" value={data.domicare_data.motif_appel} onChange={e => setData('domicare_data', {...data.domicare_data, motif_appel: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl" placeholder="Décrivez le motif de l'appel..."></textarea>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Besoin d'Ambulance ?" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 flex-1 justify-center">
                                                            <input type="radio" name="ambulance" value={opt} checked={data.domicare_data.ambulance === opt} onChange={e => setData('domicare_data', {...data.domicare_data, ambulance: e.target.value})} className="text-amber-600" />
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Autres besoins spécifiques" className="text-gray-600 dark:text-gray-400" />
                                                <textarea rows="2" value={data.domicare_data.autres_besoins} onChange={e => setData('domicare_data', {...data.domicare_data, autres_besoins: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl"></textarea>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Profil recherché (Personnel souhaité)" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <textarea rows="2" value={data.domicare_data.profil_recherche} onChange={e => setData('domicare_data', {...data.domicare_data, profil_recherche: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl"></textarea>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Urgence de la prise en charge" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex gap-4 flex-wrap">
                                                    {['Immédiate', '48h programmé'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 justify-center">
                                                            <input type="radio" name="urgence" value={opt} checked={data.domicare_data.urgence === opt} onChange={e => setData('domicare_data', {...data.domicare_data, urgence: e.target.value})} className="text-red-600" />
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <InputLabel value="Observation Libre (Optionnel)" className="text-gray-600 dark:text-gray-400" />
                                                <textarea rows="2" value={data.c_observation} onChange={e => setData('c_observation', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl"></textarea>
                                            </div>
                                        </div>
                                    )}
`;
content = content.replace(
    '{/* STEP 1 */}',
    domicareForms + '\n                                    {/* STANDARD - STEP 1 */}'
);

content = content.replace(
    '{currentStep === 1 && (',
    '{!isDomicare && currentStep === 1 && ('
);
content = content.replace(
    '{currentStep === 2 && (',
    '{!isDomicare && currentStep === 2 && ('
);
content = content.replace(
    '{currentStep === 3 && (',
    '{!isDomicare && currentStep === 3 && ('
);
content = content.replace(
    '{currentStep === 4 && (',
    '{!isDomicare && currentStep === 4 && ('
);

fs.writeFileSync(createPath, content, 'utf8');
console.log('Success');
