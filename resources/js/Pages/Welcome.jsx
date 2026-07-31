import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bientôt Disponible - La Voie Job" />
            <div className="relative min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white flex items-center justify-center overflow-hidden font-sans">
                
                {/* Background shapes */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-50"></div>
                <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-cyan-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-50"></div>

                <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-10 sm:p-16 rounded-3xl text-center max-w-2xl w-[90%] shadow-2xl">
                    <div className="text-2xl font-extrabold tracking-widest uppercase mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        La Voie Job
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                        Bientôt Disponible
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-200 mb-10 leading-relaxed">
                        Nous préparons la meilleure plateforme de recrutement. <br className="hidden sm:block"/>
                        Restez à l'écoute, nous arrivons très vite avec quelque chose d'incroyable !
                    </p>
                    
                    <a href="mailto:contact@lavoiejob.ma" className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        Nous contacter
                    </a>

                    <div className="mt-12 text-sm opacity-50 hover:opacity-100 transition-opacity">
                        <Link href={route('login')} className="text-white hover:underline">Accès Admin</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
