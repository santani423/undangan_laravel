import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center">
                <AppLogoIcon alt="" aria-hidden="true" className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-none font-bold tracking-wide">Undesia</span>
                <span className="truncate text-xs opacity-60 leading-none mt-0.5">Undangan Digital</span>
            </div>
        </>
    );
}
