export default function ApplicationLogo({ variant = 'default', ...props }) {
    const isLight = variant === 'light';
    
    return (
        <div className="flex flex-col items-center justify-center select-none w-full" {...props}>
            <div className="flex items-baseline justify-center gap-1.5 w-full">
                <span className={`text-2xl font-semibold tracking-tight uppercase ${isLight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    La Voie
                </span>
                <span className="text-2xl font-black tracking-tight text-[#D4AF37] uppercase">
                    Job
                </span>
            </div>
            <span className={`whitespace-nowrap text-[0.50rem] font-bold tracking-[0.15em] uppercase mt-[-2px] text-center w-full block ${isLight ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                Recrutement <span className={`${isLight ? 'text-indigo-300' : 'text-gray-300 dark:text-gray-600'} mx-0.5`}>•</span> Formation <span className={`${isLight ? 'text-indigo-300' : 'text-gray-300 dark:text-gray-600'} mx-0.5`}>•</span> Gestion
            </span>
        </div>
    );
}
