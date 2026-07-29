export default function ApplicationLogo(props) {
    return (
        <div className="flex flex-col justify-center items-start" {...props}>
            <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase drop-shadow-sm">
                    La Voie
                </span>
                <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm uppercase">
                    Job
                </span>
            </div>
            <span className="text-[0.50rem] mt-[-4px] font-bold tracking-[0.2em] text-indigo-500/80 dark:text-indigo-400/80 uppercase">
                Recrutement - Formation - Gestion
            </span>
        </div>
    );
}
