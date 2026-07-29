import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome to Lavoiejob" />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
                
                {/* Navbar */}
                <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20 items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight">
                                    Lavoiejob
                                </span>
                            </div>
                            <div className="hidden sm:flex items-center space-x-8">
                                <a href="#services" className="text-sm font-medium hover:text-indigo-500 transition-colors">Services</a>
                                <a href="#about" className="text-sm font-medium hover:text-indigo-500 transition-colors">About Us</a>
                                <a href="#contact" className="text-sm font-medium hover:text-indigo-500 transition-colors">Contact</a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="text-sm font-medium hover:text-indigo-500 transition-colors">Log in</Link>
                                        <Link href={route('register')} className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
                            Premium Care & <br/> 
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                                Professional Services
                            </span>
                        </h1>
                        <p className="mt-4 text-xl sm:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Discover the perfect match for your home, family, and business. From dedicated nannies to specialized professionals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-xl hover:scale-105 transition-transform duration-300">
                                Find a Professional
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                Join as a Worker
                            </button>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div id="services" className="py-24 bg-white dark:bg-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Dedicated Platforms</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Specialized services tailored to meet your exact needs with precision and care.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ServiceCard title="Lalla lghalia" desc="Premium maid and housekeeping services." color="from-pink-400 to-rose-500" />
                            <ServiceCard title="Domicare" desc="Compassionate home healthcare and nursing." color="from-emerald-400 to-teal-500" />
                            <ServiceCard title="Nounou Daba" desc="Trusted babysitting and nanny services." color="from-amber-400 to-orange-500" />
                            <ServiceCard title="Pro Pro" desc="Skilled professionals for specialized tasks." color="from-blue-400 to-indigo-500" />
                            <ServiceCard title="Yallah nkhedmo" desc="General workforce and employment matching." color="from-purple-400 to-fuchsia-500" />
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

function ServiceCard({ title, desc, color }) {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-800 p-8 hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{desc}</p>
            <a href="#" className={`inline-flex items-center text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${color} group-hover:translate-x-2 transition-transform duration-300`}>
                Explore Service &rarr;
            </a>
        </div>
    );
}
