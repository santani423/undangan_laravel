export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.5 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3.5-7-7-7z" fill="currentColor" opacity="0.9"/>
                    <circle cx="12" cy="9" r="2.5" fill="currentColor" opacity="0.4"/>
                </svg>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-none font-bold tracking-wide">Undesia</span>
                <span className="truncate text-xs opacity-60 leading-none mt-0.5">Undangan Digital</span>
            </div>
        </>
    );
}
