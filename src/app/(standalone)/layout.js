export default function StandaloneLayout({ children }) {
    return (
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
            {children}
        </main>
    );
}
