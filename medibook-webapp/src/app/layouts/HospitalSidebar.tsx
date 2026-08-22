import { cn } from '@/shared/lib/cn';

import type { HospitalRole, HospitalView } from '@/app/router/paths';

import { NAV_MODEL, type HospitalNavView } from './hospital-nav';
import { HospitalNavItem } from './HospitalNavItem';

interface HospitalSidebarProps {
  active: HospitalView;
  onNavigate: (view: HospitalNavView) => void;
  role: HospitalRole;
  hospitalName: string;
  collapsed?: boolean;
}

/** Hospital shell sidebar (design `Sidebar` in `Sidebar.jsx`). */
export function HospitalSidebar({
  active,
  onNavigate,
  role,
  hospitalName,
  collapsed = false,
}: HospitalSidebarProps) {
  const sections = NAV_MODEL.map((s) => ({
    ...s,
    items: s.items.filter((i) => i.roles.includes(role)),
  })).filter((s) => s.items.length > 0);
  return (
    <aside
      className={cn(
        'border-border flex h-full flex-none flex-col overflow-y-auto border-r bg-white pt-5.5 pb-5 transition-[width] duration-200',
        collapsed ? 'w-sidebar-compact' : 'w-sidebar',
      )}
    >
      <div className={cn('flex items-center justify-center gap-2.25 pb-4', !collapsed && 'px-4')}>
        <img src="/assets/apollo-logo.png" alt="logo" className="size-8.5 flex-none" />
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-body-lg truncate font-bold text-black">{hospitalName}</div>
            <div className="text-text-faint text-[10.5px] font-medium tracking-[.04em]">
              Medibook · mbAdmin
            </div>
          </div>
        )}
      </div>
      <div className="bg-border mb-2 h-px" />
      {sections.map((s, si) => (
        <div key={s.section} className={si === 0 ? 'mt-1' : 'mt-3'}>
          {collapsed ? (
            si > 0 && <div className="bg-border-soft mx-4.5 mb-2.5 h-px" />
          ) : (
            <div className="text-tiny text-text-muted px-6.5 pb-1.75 font-semibold tracking-[.07em] uppercase">
              {s.section}
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {s.items.map((i) => (
              <HospitalNavItem
                key={i.id}
                item={i}
                active={active}
                onClick={onNavigate}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}
