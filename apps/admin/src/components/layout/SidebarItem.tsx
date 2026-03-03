import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavChild {
  title: string;
  path: string;
}

interface SidebarItemProps {
  item: {
    title: string;
    path: string;
    icon: string;
    children?: NavChild[];
  };
  isSidebarOpen: boolean;
  Icon: React.ElementType;
  isActiveParent?: boolean;
  location: ReturnType<typeof useLocation>;
}

export const SidebarItem = ({ item, isSidebarOpen, Icon, isActiveParent, location }: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(!!isActiveParent);

  useEffect(() => {
    if (isActiveParent) setIsOpen(true);
  }, [isActiveParent]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  // --- Parent with children ---
  if (item.children) {
    return (
      <li>
        <button
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group",
            isActiveParent
              ? "text-white bg-sidebar-hover"
              : "text-slate-400 hover:text-slate-200 hover:bg-sidebar-hover"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {isSidebarOpen && <span>{item.title}</span>}
          </div>
          {isSidebarOpen && (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 opacity-40 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          )}
        </button>

        {isSidebarOpen && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              isOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
            )}
          >
            <ul className="ml-[30px] border-l border-slate-700/50 pl-3 space-y-0.5">
              {item.children.map((child) => (
                <li key={child.path}>
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      cn(
                        "block px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "text-primary-light bg-sidebar-active"
                          : "text-slate-500 hover:text-slate-300 hover:bg-sidebar-hover"
                      )
                    }
                  >
                    {child.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  // --- Single item ---
  return (
    <li>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group",
            isActive
              ? "text-white bg-primary/15 border-l-2 border-primary-light -ml-px"
              : "text-slate-400 hover:text-slate-200 hover:bg-sidebar-hover"
          )
        }
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {isSidebarOpen && <span>{item.title}</span>}
      </NavLink>
    </li>
  );
};
