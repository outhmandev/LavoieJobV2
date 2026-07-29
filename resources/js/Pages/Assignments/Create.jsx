import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function Create({ clients, profiles }) {
    const params = new URLSearchParams(window.location.search);
    const initialClientId = params.get('client_id') || '';
    const initialProfileId = params.get('profile_id') || '';

    const { data, setData, post, processing, errors } = useForm({
        client_id: initialClientId,
        profile_id: initialProfileId,
        status: 'active',
        agreed_price: '',
        payment_schedule: '',
        rest_days: '',
        employment_type: '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('assignments.store'));
    };

    return (
        <AuthenticatedLayout 
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('assignments.index')} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 transition-colors">
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create New Assignment</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Match a candidate profile with a client's project.</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Assignment" />

            <div className="max-w-4xl mx-auto pb-12">
                <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80 overflow-hidden">
                    <div className="p-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-6">Assignment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="client_id" value="Client *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="client_id"
                                            name="client_id"
                                            value={data.client_id}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('client_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.c_nom}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.client_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="profile_id" value="Profile *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="profile_id"
                                            name="profile_id"
                                            value={data.profile_id}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('profile_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            {profiles.map(p => (
                                                <option key={p.id} value={p.id}>{p.full_name} ({p.job})</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.profile_id} className="mt-2" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="agreed_price" value="Budget final (DHS) *" className="text-gray-700 font-semibold" />
                                        <TextInput
                                            id="agreed_price"
                                            type="number"
                                            name="agreed_price"
                                            min="0"
                                            value={data.agreed_price}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-gray-900 dark:text-gray-100"
                                            onChange={(e) => setData('agreed_price', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.agreed_price} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="payment_schedule" value="Echéance *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="payment_schedule"
                                            name="payment_schedule"
                                            value={data.payment_schedule || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('payment_schedule', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            <option value="Hebdomadaire">Hebdomadaire</option>
                                            <option value="Quinzaine">Quinzaine</option>
                                            <option value="Mensuel">Mensuel</option>
                                        </select>
                                        <InputError message={errors.payment_schedule} className="mt-2" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="rest_days" value="Repos *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="rest_days"
                                            name="rest_days"
                                            value={data.rest_days || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('rest_days', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            <option value="Hebdomadaire">Hebdomadaire</option>
                                            <option value="Quinzaine">Quinzaine</option>
                                            <option value="Mensuel">Mensuel</option>
                                        </select>
                                        <InputError message={errors.rest_days} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="employment_type" value="Mode d'emploi *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="employment_type"
                                            name="employment_type"
                                            value={data.employment_type || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('employment_type', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            <option value="Couchante">Couchante</option>
                                            <option value="Non Couchante">Non Couchante</option>
                                            <option value="Stage">Stage</option>
                                            <option value="Plein temps">Plein temps</option>
                                            <option value="Temps partiel">Temps partiel</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="CDD">CDD</option>
                                            <option value="CDI">CDI</option>
                                            <option value="Job Etudiant">Job Etudiant</option>
                                            <option value="Contrat pro">Contrat de professionnalisation</option>
                                            <option value="Télétravail">Télétravail</option>
                                            <option value="Mission intérim">Mission intérim</option>
                                            <option value="Saisonnier">Saisonnier</option>
                                            <option value="Bénévolat">Bénévolat</option>
                                            <option value="Consultant">Consultant</option>
                                            <option value="Volontariat">Volontariat</option>
                                        </select>
                                        <InputError message={errors.employment_type} className="mt-2" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="start_date" value="Date début *" className="text-gray-700 font-semibold" />
                                        <TextInput
                                            id="start_date"
                                            type="date"
                                            name="start_date"
                                            value={data.start_date || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-gray-900 dark:text-gray-100"
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.start_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="end_date" value="Date de fin" className="text-gray-700 font-semibold" />
                                        <TextInput
                                            id="end_date"
                                            type="date"
                                            name="end_date"
                                            value={data.end_date || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-gray-900 dark:text-gray-100"
                                            onChange={(e) => setData('end_date', e.target.value)}
                                        />
                                        <InputError message={errors.end_date} className="mt-2" />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="notes" value="Note" className="text-gray-700 font-semibold" />
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={data.notes || ''}
                                        rows="4"
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100"
                                        onChange={(e) => setData('notes', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                        <Link href={route('assignments.index')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Cancel
                        </Link>
                        <button 
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 hover:shadow-md transition-all duration-200 disabled:opacity-75"
                        >
                            <FiSave size={18} />
                            Save Assignment
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
