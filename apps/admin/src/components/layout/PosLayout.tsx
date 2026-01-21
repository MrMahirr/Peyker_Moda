import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export const PosLayout = () => {
    const navigate = useNavigate();

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
            {/* Top Bar */}
            <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0 shadow-md">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Panele Dön
                    </Button>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <h1 className="font-bold text-lg tracking-wide">PEYKER <span className="text-indigo-400">POS</span></h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-slate-800 px-3 py-1 rounded text-sm text-slate-300">
                        Kasa: <span className="text-white font-medium">Ana Kasa (01)</span>
                    </div>
                    <div className="bg-slate-800 px-3 py-1 rounded text-sm text-slate-300">
                        Kullanıcı: <span className="text-white font-medium">Mahir G.</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => window.location.reload()}>
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={toggleFullScreen}>
                        <Maximize2 className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};
