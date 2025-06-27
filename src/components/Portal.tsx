import { Fragment, type ReactNode, useEffect, useId } from "react";
import { create } from "zustand";

type Key = string;

interface PortalState {
  portals: Record<Key, ReactNode>;
  mount: (key: Key, node: ReactNode) => void;
  update: (key: Key, node: ReactNode) => void;
  unmount: (key: Key) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  portals: {},

  mount: (key, node) =>
    set((s) => ({ portals: { ...s.portals, [key]: node } })),

  update: (key, node) =>
    set((s) => ({ portals: { ...s.portals, [key]: node } })),

  unmount: (key) =>
    set((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _removed, ...rest } = s.portals;
      return { portals: rest };
    }),
}));

export const Portal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const key = useId();

  const mount = usePortalStore((s) => s.mount);
  const update = usePortalStore((s) => s.update);
  const unmount = usePortalStore((s) => s.unmount);

  useEffect(() => {
    mount(key, children);
    return () => unmount(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    update(key, children);
  }, [children, key, update]);

  return null;
};

export const PortalContent: React.FC = () => {
  const portals = usePortalStore((s) => s.portals);

  return (
    <>
      {Object.entries(portals).map(([key, node]) => (
        <Fragment key={key}>{node}</Fragment>
      ))}
    </>
  );
};
