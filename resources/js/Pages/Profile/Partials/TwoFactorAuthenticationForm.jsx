import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import {
    FiShield, FiCheckCircle, FiCopy, FiCheck, FiRefreshCw,
    FiSmartphone, FiKey, FiDownload, FiAlertTriangle, FiLock
} from 'react-icons/fi';

export default function TwoFactorAuthenticationForm({ className = '' }) {
    const { auth } = usePage().props;
    const [enabled, setEnabled] = useState(Boolean(auth.user.two_factor_enabled));
    
    // Setup state
    const [enabling, setEnabling] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [setupError, setSetupError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    // Recovery codes state
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showCodesModal, setShowCodesModal] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    // Disable state & modal
    const [confirmingDisable, setConfirmingDisable] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disableError, setDisableError] = useState('');
    const [disabling, setDisabling] = useState(false);

    const startEnabling = async () => {
        setEnabling(true);
        setSetupError('');
        try {
            const response = await axios.post(route('two-factor.enable'));
            setSecretKey(response.data.secret);
            setQrCodeUrl(response.data.qr_code_url);
            setRecoveryCodes(response.data.recovery_codes || []);
        } catch (error) {
            setSetupError('Impossible d\'initialiser le 2FA. Veuillez réessayer.');
            setEnabling(false);
        }
    };

    const confirmTwoFactor = async (e) => {
        e.preventDefault();
        setConfirming(true);
        setSetupError('');

        try {
            const response = await axios.post(route('two-factor.confirm'), {
                code: confirmationCode,
            });
            setEnabled(true);
            setEnabling(false);
            setRecoveryCodes(response.data.recovery_codes || recoveryCodes);
            setShowCodesModal(true);
        } catch (error) {
            if (error.response?.data?.errors?.code) {
                setSetupError(error.response.data.errors.code[0]);
            } else {
                setSetupError('Code invalide. Veuillez réessayer.');
            }
        } finally {
            setConfirming(false);
        }
    };

    const copySecretToClipboard = () => {
        navigator.clipboard.writeText(secretKey);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2500);
    };

    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2500);
    };

    const downloadRecoveryCodes = () => {
        const text = `Codes de récupération d'urgence LavoieJob\nCompte : ${auth.user.email}\nDate : ${new Date().toLocaleDateString('fr-FR')}\n\n${recoveryCodes.join('\n')}\n\nConservez ces codes dans un endroit sûr et confidentiel.`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lavoiejob-codes-recuperation-${auth.user.id}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const viewRecoveryCodes = async () => {
        try {
            const res = await axios.get(route('two-factor.recovery-codes'));
            setRecoveryCodes(res.data.recovery_codes || []);
            setShowCodesModal(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDisable = async (e) => {
        e.preventDefault();
        setDisabling(true);
        setDisableError('');

        try {
            await axios.delete(route('two-factor.disable'), {
                data: { password: disablePassword },
            });
            setEnabled(false);
            setConfirmingDisable(false);
            setDisablePassword('');
        } catch (error) {
            if (error.response?.data?.errors?.password) {
                setDisableError(error.response.data.errors.password[0]);
            } else {
                setDisableError('Mot de passe incorrect ou erreur lors de la désactivation.');
            }
        } finally {
            setDisabling(false);
        }
    };

    // Fast SVG QR code URL via modern public generator or direct representation
    const qrImageSource = qrCodeUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}` : '';

    return (
        <section className={className}>
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiShield className="text-indigo-600 dark:text-indigo-400" />
                        Authentification à Deux Facteurs (2FA)
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Renforcez la sécurité de votre compte en exigeant un code à 6 chiffres depuis votre application d'authentification lors de la connexion.
                    </p>
                </div>

                {enabled && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <FiCheckCircle size={14} /> Actif
                    </span>
                )}
            </header>

            <div className="mt-6">
                {!enabled && !enabling && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                <FiSmartphone size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Le 2FA n'est pas activé</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Compatible avec Google Authenticator, Microsoft Authenticator, Authy, etc.</p>
                            </div>
                        </div>
                        <PrimaryButton onClick={startEnabling} className="whitespace-nowrap">
                            Activer le 2FA
                        </PrimaryButton>
                    </div>
                )}

                {/* Setup Flow */}
                {enabling && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 shadow-md space-y-6 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                <FiSmartphone className="text-indigo-600 dark:text-indigo-400" />
                                Configuration de l'application d'authentification
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEnabling(false)}
                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Annuler
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* QR Code */}
                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/70 rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                                    1. Scannez ce QR Code avec votre application :
                                </p>
                                {qrImageSource ? (
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <img src={qrImageSource} alt="QR Code 2FA" className="w-44 h-44 object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-44 h-44 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse text-xs text-gray-400">
                                        Chargement QR...
                                    </div>
                                )}
                            </div>

                            {/* Manual Secret & Code Confirmation */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        2. Ou saisissez manuellement cette clé secrète :
                                    </p>
                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-xs font-bold text-gray-800 dark:text-gray-200">
                                        <span className="truncate flex-1 tracking-widest">{secretKey}</span>
                                        <button
                                            type="button"
                                            onClick={copySecretToClipboard}
                                            className="p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                            title="Copier la clé"
                                        >
                                            {copiedSecret ? <FiCheck size={16} className="text-emerald-500" /> : <FiCopy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={confirmTwoFactor} className="space-y-4 pt-2">
                                    <div>
                                        <InputLabel htmlFor="confirmationCode" value="3. Saisissez le code de vérification à 6 chiffres :" className="text-xs font-semibold text-gray-700 dark:text-gray-300" />
                                        <div className="mt-1.5 flex gap-3">
                                            <TextInput
                                                id="confirmationCode"
                                                type="text"
                                                value={confirmationCode}
                                                maxLength={6}
                                                placeholder="123456"
                                                className="w-44 font-mono font-bold text-center text-lg tracking-widest"
                                                onChange={(e) => setConfirmationCode(e.target.value.replace(/[^0-9]/g, ''))}
                                            />
                                            <PrimaryButton
                                                disabled={confirming || confirmationCode.length < 6}
                                                className="px-5 py-2 text-xs"
                                            >
                                                {confirming ? 'Validation...' : 'Confirmer & Activer'}
                                            </PrimaryButton>
                                        </div>
                                        {setupError && <InputError message={setupError} className="mt-1.5" />}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active 2FA Panel */}
                {enabled && !enabling && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <FiCheckCircle size={22} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Votre compte est protégé par l'authentification à 2 facteurs.</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Un code temporaire vous sera demandé à chaque tentative de connexion.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <SecondaryButton onClick={viewRecoveryCodes} className="text-xs">
                                    <FiKey className="mr-1.5" /> Codes de Secours
                                </SecondaryButton>
                                <DangerButton onClick={() => setConfirmingDisable(true)} className="text-xs">
                                    Désactiver le 2FA
                                </DangerButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Recovery Codes */}
            <Modal show={showCodesModal} onClose={() => setShowCodesModal(false)}>
                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <FiKey size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Codes de Récupération d'Urgence</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">À utiliser en cas de perte de votre téléphone ou appareil 2FA.</p>
                        </div>
                    </div>

                    <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                        <FiAlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <span>Chaque code de secours ne peut être utilisé qu'une seule fois. Stockez-les dans un gestionnaire de mots de passe sécurisé.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        {recoveryCodes.map((code, index) => (
                            <div key={index} className="font-mono text-xs font-bold text-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200/70 dark:border-gray-700/70 text-gray-800 dark:text-gray-200 tracking-wider">
                                {code}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                            <SecondaryButton onClick={copyRecoveryCodes} className="text-xs flex items-center gap-1.5">
                                {copiedCodes ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                                {copiedCodes ? 'Copiés !' : 'Copier'}
                            </SecondaryButton>
                            <SecondaryButton onClick={downloadRecoveryCodes} className="text-xs flex items-center gap-1.5">
                                <FiDownload /> Télécharger (.txt)
                            </SecondaryButton>
                        </div>
                        <PrimaryButton onClick={() => setShowCodesModal(false)}>
                            Terminé
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Modal: Confirm Disable 2FA */}
            <Modal show={confirmingDisable} onClose={() => setConfirmingDisable(false)}>
                <form onSubmit={handleDisable} className="p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <FiLock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Désactiver le 2FA</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Veuillez confirmer votre mot de passe actuel.</p>
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="disablePassword" value="Mot de passe actuel *" className="text-xs font-semibold" />
                        <TextInput
                            id="disablePassword"
                            type="password"
                            value={disablePassword}
                            placeholder="••••••••••••"
                            className="mt-1.5 w-full"
                            isFocused={true}
                            onChange={(e) => setDisablePassword(e.target.value)}
                        />
                        {disableError && <InputError message={disableError} className="mt-1.5" />}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                        <SecondaryButton onClick={() => setConfirmingDisable(false)}>
                            Annuler
                        </SecondaryButton>
                        <DangerButton disabled={disabling || !disablePassword}>
                            {disabling ? 'Désactivation...' : 'Confirmer la désactivation'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
