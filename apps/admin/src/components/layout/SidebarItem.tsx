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
            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-150 group",
            isActiveParent
              ? "text-zinc-900 bg-sidebar-hover shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 hover:bg-sidebar-hover"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActiveParent ? 2.5 : 2} />
            {isSidebarOpen && <span>{item.title}</span>}
          </div>
          {isSidebarOpen && (
            <ChevronDown
              className={cn(
                "h-4 w-4 opacity-50 transition-transform duration-200",
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
            <ul className="ml-[30px] border-l-2 border-zinc-200 pl-3 space-y-1 py-1">
              {item.children.map((child) => {
                const isChildActive = child.path === item.path
                  ? location.pathname === child.path || (location.pathname.startsWith(child.path) && !item.children!.some(c => c.path !== child.path && location.pathname.startsWith(c.path)))
                  : location.pathname.startsWith(child.path);

                return (
                <li key={child.path}>
                  <NavLink
                    to={child.path}
                    className={cn(
                        "block px-3 py-2 rounded-md text-[13px] font-semibold transition-all duration-150",
                        isChildActive
                          ? "text-zinc-900 bg-sidebar-active/50 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-sidebar-hover"
                      )}
                  >
                    {child.title}
                  </NavLink>
                </li>
                );
              })}
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
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-150 group",
            isActive
              ? "text-primary-dark bg-white border border-sidebar-active shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 hover:bg-sidebar-hover"
          )
        }
      >
        {({ isActive }) => (
            <>
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {isSidebarOpen && <span>{item.title}</span>}
            </>
        )}
      </NavLink>
    </li>
  );
};
