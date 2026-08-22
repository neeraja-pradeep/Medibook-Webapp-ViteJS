import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';

import type { OpsStaticView, OpsView } from '@/app/router/paths';

import { OPS_NAV } from './ops-nav';

interface OpsSidebarProps {
  active: OpsView;
  onNavigate: (view: OpsStaticView) => void;
  collapsed?: boolean;
}

/** Ops console sidebar (design `OpsSidebar` in `Ops.jsx`). */
export function OpsSidebar({ active, onNavigate, collapsed = false }: OpsSidebarProps) {
  return (
    <aside
      className={cn(
        'border-border flex h-full flex-none flex-col overflow-y-auto border-r bg-white pt-5.5 pb-5 transition-[width] duration-200',
        collapsed ? 'w-sidebar-compact' : 'w-sidebar',
      )}
    >
      <div className={cn('flex items-center justify-center gap-2.25 pb-4', !collapsed && 'px-4')}>
        <img src="/assets/medibook-mark.svg" alt="Medibook" className="size-8.5 flex-none" />
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-body-lg font-bold whitespace-nowrap text-black">Medibook</div>
            <div className="text-text-faint text-[10.5px] font-medium tracking-[.04em]">
              Operations Console
            </div>
          </div>
        )}
      </div>
      <div className="bg-border mb-2 h-px" />
      {OPS_NAV.map((s, si) => (
        <div key={s.section} className={si === 0 ? 'mt-1' : 'mt-3'}>
          {collapsed ? (
            si > 0 && <div className="bg-border-soft mx-4.5 mb-2.5 h-px" />
          ) : (
            <div className="text-tiny text-text-muted px-6.5 pb-1.75 font-semibold tracking-[.07em] uppercase">
              {s.section}
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {s.items.map((i) => {
              const isActive = active === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => onNavigate(i.id)}
                  title={collapsed ? i.label : undefined}
                  className={cn(
                    'text-body mx-2.5 flex cursor-pointer items-center gap-3.5 rounded-md transition-colors duration-150',
                    collapsed ? 'justify-center py-2.75' : 'justify-start px-4 py-2.5',
                    isActive
                      ? 'bg-blue-soft-bg text-text-navy font-semibold'
                      : 'text-text-muted hover:bg-grey-200 font-medium',
                  )}
                >
                  <Icon name={i.icon} size={20} />
                  {!collapsed && i.label}
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
