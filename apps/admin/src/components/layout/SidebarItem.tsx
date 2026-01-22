import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export const SidebarItem = ({ item, isSidebarOpen, Icon, isActiveParent, location }: any) => {
    // Initialize open state based on whether it is currently active path
    const [isOpen, setIsOpen] = useState(isActiveParent);

    // Effect to auto-open if a child becomes active (e.g. via direct URL access)
    useEffect(() => {
        if (isActiveParent) {
            setIsOpen(true);
        }
    }, [isActiveParent]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    if (item.children) {
        return (
            <li>
                <div className="space-y-1">
                    <button
                        onClick={handleToggle}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none group",
                            isActiveParent ? "text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className={cn("h-5 w-5 shrink-0 group-hover:text-white", isActiveParent ? "text-white" : "text-slate-400")} />
                            {isSidebarOpen && <span>{item.title}</span>}
                        </div>
                        {isSidebarOpen && (
                            isOpen ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />
                        )}
                    </button>
                    {isSidebarOpen && isOpen && (
                        <ul className="pl-10 space-y-1 relative">
                            {/* Vertical connection line styling could go here */}
                            {/* <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-800" /> */}
                            {item.children.map((child: any) => (
                                <li key={child.path}>
                                    <NavLink
                                        to={child.path}
                                        className={({ isActive }) =>
                                            cn(
                                                "block px-3 py-2 rounded-lg transition-colors text-sm font-medium relative",
                                                isActive
                                                    ? "bg-indigo-600 text-white"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                                            )
                                        }
                                    >
                                        {child.title}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </li>
        );
    }

    return (
        <li>
            <NavLink
                to={item.path}
                className={({ isActive }) =>
                    cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group",
                        isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )
                }
            >
                <Icon className={cn("h-5 w-5 shrink-0 group-hover:text-white", ({ isActive }: any) => isActive ? "text-white" : "text-slate-400")} />
                {isSidebarOpen && <span>{item.title}</span>}
            </NavLink>
        </li>
    );
};
