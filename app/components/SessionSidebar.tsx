import {
  Plus,
  BookOpen,
  Trash2,
  Pencil,
  X,
  Check,
  TriangleAlert,
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface Session {
  id: string
  name: string
  create_at: string
}

interface SessionSidebarProps {
  currentSessionId: string
  onSelect: (id: string) => void
  onNew: (id: string) => void
}

const SessionSidebar = forwardRef(function SessionSidebar(
  { currentSessionId, onSelect, onNew }: SessionSidebarProps,
  ref
) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [removeId, setRemoveId] = useState<string | null>(null)

  async function fetchSessions() {
    try {
      const res = await fetch('/api/chat/sessions')
      const data = await res.json()
      if (Array.isArray(data.sessions)) {
        setSessions(data.sessions)
      }
    } catch {}
  }

  useImperativeHandle(ref, () => ({ fetchSessions }), [])

  useEffect(() => {
    fetchSessions()
  }, [currentSessionId])

  async function handleNew() {
    const res = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试会话1' }),
    })
    const data = await res.json()
    if (data.id) {
      onNew(data.id)
      fetchSessions()
    }
  }

  async function handleDelete(id: string) {
    await fetch('/api/chat/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setRemoveId(null)
    fetchSessions()
  }

  async function handleRename(id: string) {
    if (!renameValue.trim()) return
    await fetch('/api/chat/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: renameValue.trim() }),
    })
    setRenameId(null)
    setRenameValue('')
    fetchSessions()
  }
  function closeModal() {
    setRenameId(null)
    setRenameValue('')
  }
  function closeRemoveModal() {
    setRemoveId(null)
  }

  return (
    <>
      <aside className="w-64 bg-sidebar-bg h-full flex flex-col">
        {/* 新建会话 */}
        <div className="flex items-center justify-center p-4">
          <button
            className="text-alchemy-gold flex items-center justify-center border border-alchemy-gold/30 w-full text-sm gap-2 px-4 py-2 italic tracking-widest hover:bg-alchemy-gold/10 cursor-pointer rounded transition-all"
            onClick={handleNew}
          >
            <Plus className="h-3.5 w-3.5" />
            新的研究
          </button>
        </div>
        {/* 会话列表 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-alchemy-gold flex w-full items-center justify-center text-sm h-full">
              暂无历史会话
            </div>
          ) : (
            <ul className="p-2">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  className={`flex items-center justify-between group border-l-[2px] text-sm cursor-pointer px-4 py-3 transition-all duration-300 ${
                    session.id === currentSessionId
                      ? 'bg-sidebar-active/20 font-bold text-paper-dark rounded border-alchemy-gold'
                      : 'border-transparent text-sidebar-color hover:bg-sidebar-active/10'
                  }`}
                >
                  <div className="flex items-center truncate flex-1 gap-1.5">
                    <BookOpen className="shrink-0 w-3.5 h-3.5" />
                    <span className="truncate">{session.name}</span>
                  </div>
                  <div className="shrink-0 items-center group-hover:flex gap-2 hidden">
                    <button
                      title="重命名"
                      onClick={(e) => {
                        e.stopPropagation()
                        setRenameId(session.id)
                        setRenameValue(session.name)
                      }}
                      className="cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="删除"
                      onClick={(e) => {
                        e.stopPropagation()
                        setRemoveId(session.id)
                      }}
                      className="cursor-pointer hover:text-seal-red"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
      {renameId && (
        <div className="backdrop-blur-sm fixed inset-8 flex items-center justify-center z-50 font-serif">
          <div
            className="absolute inset-0 backdrop-blur-md animate-in fade-in duration-500"
            onClick={closeModal}
          ></div>
          <div className="p-8 rounded-sm flex flex-col w-120 bg-paper animate-modal-in">
            <h2 className="text-alchemy-gold text-xl italic font-bold tracking-widest uppercase mb-6  animate-slide-down">
              T 重塑课题之名
            </h2>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              className="border-b-2 border-alchemy-gold outline-none transition-all italic animate-slide-up"
              placeholder="在此输入新的真理..."
            />
            <div className="flex items-center justify-center gap-4 mt-8 animate-slide-up">
              <button
                className="py-3 shadow-lg rounded-sm font-bold flex-1 cursor-pointer hover:bg-text-main/5  flex items-center justify-center gap-2"
                onClick={() => setRenameId(null)}
              >
                <X className="w-4.5 h-4.5" />
                维持现状
              </button>
              <button
                className="py-3 shadow-lg rounded-sm font-bold flex-1 bg-seal-red text-paper cursor-pointer hover:bg-seal-red-hover flex items-center justify-center gap-2"
                onClick={() => handleRename(renameId)}
              >
                <Check className="w-4.5 h-4.5" />
                确立契约
              </button>
            </div>
          </div>
        </div>
      )}
      {removeId && (
        <div className="backdrop-blur-sm fixed inset-8 flex items-center justify-center z-50 font-serif animate-modal-in">
          <div
            className="absolute inset-0 fade-in duration-500"
            onClick={closeRemoveModal}
          ></div>
          <div className="absolute p-8 rounded-sm flex flex-col w-90 bg-delete-bg shadow-[0_0_60px_rgba(139,0,0,0.4)] border border-seal-red/5 text-center">
            <div className="rounded-full mb-6 bg-seal-red/20 p-4 animate-pulse flex items-center justify-center mx-auto">
              <TriangleAlert className="w-8 h-8 text-[#ff4d4d]" />
            </div>
            <div className="text-xl text-paper-dark font-bold tracking-widest mb-4 uppercase">
              归于尘埃？
            </div>
            <div className="inline-block text-sidebar-color italic text-sm mb-8 leading-relaxed">
              一旦触碰虚无，此段关于{' '}
              <span className="text-[#ff4d4d]">星辰与真理的奥秘</span>{' '}
              的真理记录将永久消散在以太之中。
            </div>
            <div className="flex flex-col gap-3">
              <button
                className="w-full bg-seal-red text-paper py-3 rounded-sm font-bold tracking-widest hover:bg-[#cc0000] transition-all border border-[#ff4d4d]/20 cursor-pointer"
                onClick={() => handleDelete(removeId)}
              >
                确认为虚无
              </button>
              <button
                className="w-full bg-transparent text-sidebar-color py-3 rounded-sm font-bold tracking-widest hover:text-[#e9d9af] transition-all cursor-pointer"
                onClick={() => {
                  setRemoveId(null)
                }}
              >
                保留此页
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

export default SessionSidebar
