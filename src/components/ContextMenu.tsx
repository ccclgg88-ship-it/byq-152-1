import { useEffect, useRef } from 'react'

interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={`context-menu-item ${item.danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
          onClick={() => {
            item.onClick()
            onClose()
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
