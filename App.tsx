import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Users,
  AlertCircle,
  X,
  MessageSquare,
  ListTodo,
  Activity,
  PartyPopper,
  Bell,
  Save,
  Trash2,
  Edit3,
} from 'lucide-react';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const FULL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8);

const BLOCK_TYPES = [
  'Trabajo', 'Escuela', 'Comida', 'Traslado', 'Gym', 'Tiempo juntos', 'Evento', 'Pendiente', 'Actividad', 'Otro',
] as const;

const BLOCK_COLORS: Record<string, string> = {
  Trabajo: 'bg-sky-500/30 border-sky-400',
  Escuela: 'bg-teal-500/30 border-teal-400',
  Comida: 'bg-orange-500/30 border-orange-400',
  Traslado: 'bg-zinc-500/30 border-zinc-400',
  Gym: 'bg-emerald-500/30 border-emerald-400',
  'Tiempo juntos': 'bg-pink-500/30 border-pink-400',
  Evento: 'bg-rose-500/30 border-rose-400',
  Pendiente: 'bg-amber-500/30 border-amber-400',
  Actividad: 'bg-emerald-500/30 border-emerald-400',
  Otro: 'bg-zinc-500/20 border-zinc-500',
};

interface AgendaBlock {
  id: string;
  day: number;
  person: 'damian' | 'joss' | 'ambos';
  label: string;
  type: string;
  start: number;
  end: number;
  notes: string;
  color: string;
}

interface GymDay {
  day: string;
  completed: boolean;
  type: string;
  detail: string;
}

interface QuickEntry {
  id: string;
  type: 'comentario' | 'pendiente' | 'actividad' | 'evento' | 'recordatorio';
  text: string;
  person: 'tú' | 'joss' | 'ambos';
  date: string;
  time: string;
  done: boolean;
  createdAt: string;
}

const ENTRY_TYPES = [
  { value: 'comentario', label: 'Comentario', icon: MessageSquare, color: 'text-sky-400' },
  { value: 'pendiente', label: 'Pendiente', icon: ListTodo, color: 'text-amber-400' },
  { value: 'actividad', label: 'Actividad', icon: Activity, color: 'text-emerald-400' },
  { value: 'evento', label: 'Evento', icon: PartyPopper, color: 'text-rose-400' },
  { value: 'recordatorio', label: 'Recordatorio', icon: Bell, color: 'text-teal-400' },
] as const;

function buildDefaultBlocks(): AgendaBlock[] {
  const blocks: AgendaBlock[] = [];
  let id = 1;
  const mkId = () => `def-${id++}`;

  // Mon-Fri: Damián
  for (let d = 0; d <= 4; d++) {
    blocks.push({ id: mkId(), day: d, person: 'damian', label: 'Trabajo', type: 'Trabajo', start: 8, end: 18, notes: '', color: BLOCK_COLORS.Trabajo });
    blocks.push({ id: mkId(), day: d, person: 'damian', label: 'Traslado', type: 'Traslado', start: 18, end: 18.5, notes: '', color: BLOCK_COLORS.Traslado });
  }

  // Mon-Fri: Joss
  for (let d = 0; d <= 4; d++) {
    blocks.push({ id: mkId(), day: d, person: 'joss', label: 'Trabajo', type: 'Trabajo', start: 8, end: 14.5, notes: '', color: BLOCK_COLORS.Trabajo });
    blocks.push({ id: mkId(), day: d, person: 'joss', label: 'Comida', type: 'Comida', start: 14.5, end: 15 + 1 / 6, notes: '', color: BLOCK_COLORS.Comida });
    blocks.push({ id: mkId(), day: d, person: 'joss', label: 'Escuela', type: 'Escuela', start: 15 + 1 / 6, end: 20, notes: '', color: BLOCK_COLORS.Escuela });
    blocks.push({ id: mkId(), day: d, person: 'joss', label: 'Traslado', type: 'Traslado', start: 20, end: 20 + 2 / 3, notes: '', color: BLOCK_COLORS.Traslado });
  }

  // Mon, Wed, Fri: Gym juntos + after
  for (const d of [0, 2, 4]) {
    blocks.push({ id: mkId(), day: d, person: 'ambos', label: 'Gym juntos', type: 'Gym', start: 21, end: 22, notes: '', color: BLOCK_COLORS.Gym });
    blocks.push({ id: mkId(), day: d, person: 'ambos', label: 'Cena / baño', type: 'Comida', start: 22, end: 22.5, notes: '', color: BLOCK_COLORS.Comida });
    blocks.push({ id: mkId(), day: d, person: 'ambos', label: 'Tiempo juntos', type: 'Tiempo juntos', start: 22.5, end: 23, notes: '', color: BLOCK_COLORS['Tiempo juntos'] });
  }

  // Tue, Thu: Gym individual Damián + Joss tareas
  for (const d of [1, 3]) {
    blocks.push({ id: mkId(), day: d, person: 'damian', label: 'Gym individual', type: 'Gym', start: 18.5, end: 19.5, notes: '', color: BLOCK_COLORS.Gym });
    blocks.push({ id: mkId(), day: d, person: 'joss', label: 'Tareas / Descanso', type: 'Otro', start: 20 + 2 / 3, end: 22, notes: '', color: BLOCK_COLORS.Otro });
  }

  // Saturday: Gym juntos fuerte
  blocks.push({ id: mkId(), day: 5, person: 'ambos', label: 'Gym juntos fuerte', type: 'Gym', start: 11, end: 12.5, notes: '', color: BLOCK_COLORS.Gym });

  // Sunday: Descanso
  blocks.push({ id: mkId(), day: 6, person: 'ambos', label: 'Descanso / Planeación semanal', type: 'Otro', start: 8, end: 23, notes: '', color: BLOCK_COLORS.Otro });

  return blocks;
}

const INITIAL_GYM: GymDay[] = [
  { day: 'Lun', completed: false, type: 'Juntos', detail: '21:00–22:00' },
  { day: 'Mar', completed: false, type: 'Individual', detail: 'Damián 18:30–19:30' },
  { day: 'Mié', completed: false, type: 'Juntos', detail: '21:00–22:00' },
  { day: 'Jue', completed: false, type: 'Individual', detail: 'Damián 18:30–19:30' },
  { day: 'Vie', completed: false, type: 'Juntos', detail: '21:00–22:00' },
  { day: 'Sáb', completed: false, type: 'Juntos fuerte', detail: '11:00–12:30' },
  { day: 'Dom', completed: false, type: 'Descanso', detail: 'Planeación semanal' },
];

function loadAgendaBlocks(): AgendaBlock[] {
  try {
    const raw = localStorage.getItem('agenda-blocks');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return buildDefaultBlocks();
}

function saveAgendaBlocks(blocks: AgendaBlock[]) {
  localStorage.setItem('agenda-blocks', JSON.stringify(blocks));
}

function loadEntries(): QuickEntry[] {
  try {
    const raw = localStorage.getItem('agenda-quick-entries');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadGymState(): GymDay[] {
  try {
    const raw = localStorage.getItem('agenda-gym-state');
    return raw ? JSON.parse(raw) : INITIAL_GYM;
  } catch {
    return INITIAL_GYM;
  }
}

function formatHour(h: number): string {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function hourToInput(h: number): string {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function inputToHour(v: string): number {
  const [h, m] = v.split(':').map(Number);
  return h + m / 60;
}

function App() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [agendaBlocks, setAgendaBlocks] = useState<AgendaBlock[]>(loadAgendaBlocks);
  const [gymDays, setGymDays] = useState<GymDay[]>(loadGymState);
  const [entries, setEntries] = useState<QuickEntry[]>(loadEntries);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'block' | 'note'>('note');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<AgendaBlock | null>(null);

  // Quick entry form
  const [newType, setNewType] = useState<QuickEntry['type']>('pendiente');
  const [newText, setNewText] = useState('');
  const [newPerson, setNewPerson] = useState<QuickEntry['person']>('ambos');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Add block form
  const [addDay, setAddDay] = useState(0);
  const [addLabel, setAddLabel] = useState('');
  const [addPerson, setAddPerson] = useState<AgendaBlock['person']>('damian');
  const [addBlockType, setAddBlockType] = useState('Otro');
  const [addStart, setAddStart] = useState('08:00');
  const [addEnd, setAddEnd] = useState('09:00');
  const [addNotes, setAddNotes] = useState('');

  // Edit form
  const [editLabel, setEditLabel] = useState('');
  const [editDay, setEditDay] = useState(0);
  const [editPerson, setEditPerson] = useState<AgendaBlock['person']>('damian');
  const [editBlockType, setEditBlockType] = useState('Otro');
  const [editStart, setEditStart] = useState('08:00');
  const [editEnd, setEditEnd] = useState('09:00');
  const [editNotes, setEditNotes] = useState('');

  // Persist
  useEffect(() => { saveAgendaBlocks(agendaBlocks); }, [agendaBlocks]);
  useEffect(() => { localStorage.setItem('agenda-quick-entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('agenda-gym-state', JSON.stringify(gymDays)); }, [gymDays]);

  // Derived: blocks for current day
  const dayBlocks = agendaBlocks.filter((b) => b.day === selectedDay);
  const damianBlocks = dayBlocks.filter((b) => b.person === 'damian' || b.person === 'ambos');
  const jossBlocks = dayBlocks.filter((b) => b.person === 'joss' || b.person === 'ambos');

  const gymCompleted = gymDays.filter((g) => g.completed).length;
  const pendingEntries = entries.filter((e) => e.type === 'pendiente' && !e.done);

  // Handlers
  const toggleGym = (day: string) => {
    setGymDays((prev) => prev.map((g) => (g.day === day ? { ...g, completed: !g.completed } : g)));
  };

  const addQuickEntry = () => {
    if (!newText.trim()) return;
    const entry: QuickEntry = {
      id: `qe-${Date.now()}`,
      type: newType,
      text: newText.trim(),
      person: newPerson,
      date: newDate,
      time: newTime,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setNewText('');
    setNewDate('');
    setNewTime('');
    setShowAddModal(false);
  };

  const toggleEntryDone = (id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e)));
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddBlock = () => {
    if (!addLabel.trim()) return;
    const start = inputToHour(addStart);
    const end = inputToHour(addEnd);
    if (end <= start) return;

    const block: AgendaBlock = {
      id: `blk-${Date.now()}`,
      day: addDay,
      person: addPerson,
      label: addLabel.trim(),
      type: addBlockType,
      start,
      end,
      notes: addNotes.trim(),
      color: BLOCK_COLORS[addBlockType] || BLOCK_COLORS.Otro,
    };
    setAgendaBlocks((prev) => [...prev, block]);
    setAddLabel('');
    setAddNotes('');
    setShowAddModal(false);
  };

  const openEditModal = (block: AgendaBlock) => {
    setEditingBlock(block);
    setEditLabel(block.label);
    setEditDay(block.day);
    setEditPerson(block.person);
    setEditBlockType(block.type);
    setEditStart(hourToInput(block.start));
    setEditEnd(hourToInput(block.end));
    setEditNotes(block.notes);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingBlock || !editLabel.trim()) return;
    const start = inputToHour(editStart);
    const end = inputToHour(editEnd);
    if (end <= start) return;

    setAgendaBlocks((prev) =>
      prev.map((b) =>
        b.id === editingBlock.id
          ? {
              ...b,
              label: editLabel.trim(),
              day: editDay,
              person: editPerson,
              type: editBlockType,
              start,
              end,
              notes: editNotes.trim(),
              color: BLOCK_COLORS[editBlockType] || BLOCK_COLORS.Otro,
            }
          : b
      )
    );
    setShowEditModal(false);
    setEditingBlock(null);
  };

  const handleDeleteBlock = () => {
    if (!editingBlock) return;
    setAgendaBlocks((prev) => prev.filter((b) => b.id !== editingBlock.id));
    setShowEditModal(false);
    setEditingBlock(null);
  };

  const openAddBlockModal = () => {
    setAddDay(selectedDay);
    setAddLabel('');
    setAddPerson('damian');
    setAddBlockType('Otro');
    setAddStart('08:00');
    setAddEnd('09:00');
    setAddNotes('');
    setShowAddModal(true);
    setModalTab('block');
  };

  const getEntryIcon = (type: QuickEntry['type']) => {
    const found = ENTRY_TYPES.find((t) => t.value === type);
    return found ? found.icon : MessageSquare;
  };

  const getEntryColor = (type: QuickEntry['type']) => {
    const found = ENTRY_TYPES.find((t) => t.value === type);
    return found ? found.color : 'text-zinc-400';
  };

  const getPersonLabel = (person: 'tú' | 'joss' | 'ambos') => {
    if (person === 'tú') return 'Damián';
    if (person === 'joss') return 'Joss';
    return 'Ambos';
  };

  const getBlockPersonLabel = (person: AgendaBlock['person']) => {
    if (person === 'damian') return 'Damián';
    if (person === 'joss') return 'Joss';
    return 'Ambos';
  };

  const renderBlock = (block: AgendaBlock) => {
    const top = (block.start - 8) * 48;
    const height = (block.end - block.start) * 48;
    return (
      <div
        key={block.id}
        className={`absolute left-1 right-1 rounded-lg border ${block.color} cursor-pointer transition-all hover:brightness-125 group`}
        style={{ top: `${top + 24}px`, height: `${Math.max(height - 4, 16)}px` }}
        onClick={() => openEditModal(block)}
      >
        <div className="p-1.5 overflow-hidden h-full relative">
          <p className="text-xs font-medium text-zinc-100 truncate">{block.label}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {formatHour(block.start)} - {formatHour(block.end)}
          </p>
          <Edit3 className="w-3 h-3 text-zinc-500 absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-50">Agenda compartida</h1>
              <p className="text-xs text-zinc-500">Damián & Joss</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
              <Users className="w-3.5 h-3.5" />
              <span>2 personas</span>
            </div>
            <button
              onClick={openAddBlockModal}
              className="w-8 h-8 rounded-lg bg-emerald-600 border border-emerald-500 flex items-center justify-center hover:bg-emerald-500 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h3 className="text-sm font-semibold text-zinc-200">Agregar</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => setModalTab('note')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${modalTab === 'note' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Nota rápida
              </button>
              <button
                onClick={() => setModalTab('block')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${modalTab === 'block' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Bloque de horario
              </button>
            </div>

            <div className="p-5 space-y-4">
              {modalTab === 'note' ? (
                <>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Tipo</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value as QuickEntry['type'])} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                      {ENTRY_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Comentario / título</label>
                    <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Ej: Hoy salí tarde del trabajo" className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500 placeholder:text-zinc-600" />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Responsable</label>
                    <select value={newPerson} onChange={(e) => setNewPerson(e.target.value as QuickEntry['person'])} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                      <option value="tú">Damián</option>
                      <option value="joss">Joss</option>
                      <option value="ambos">Ambos</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Fecha (opcional)</label>
                      <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Hora (opcional)</label>
                      <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <button onClick={addQuickEntry} disabled={!newText.trim()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs font-medium transition-colors">
                    <Save className="w-3.5 h-3.5" />Guardar
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Día</label>
                    <select value={addDay} onChange={(e) => setAddDay(Number(e.target.value))} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                      {DAYS.map((d, i) => (<option key={i} value={i}>{FULL_DAYS[i]}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Título</label>
                    <input value={addLabel} onChange={(e) => setAddLabel(e.target.value)} placeholder="Ej: Partido de basket" className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500 placeholder:text-zinc-600" />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Responsable</label>
                    <select value={addPerson} onChange={(e) => setAddPerson(e.target.value as AgendaBlock['person'])} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                      <option value="damian">Damián</option>
                      <option value="joss">Joss</option>
                      <option value="ambos">Ambos</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Tipo</label>
                    <select value={addBlockType} onChange={(e) => setAddBlockType(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                      {BLOCK_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Inicio</label>
                      <input type="time" value={addStart} onChange={(e) => setAddStart(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Fin</label>
                      <input type="time" value={addEnd} onChange={(e) => setAddEnd(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Notas (opcional)</label>
                    <input value={addNotes} onChange={(e) => setAddNotes(e.target.value)} placeholder="Ej: Llevar documentos" className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500 placeholder:text-zinc-600" />
                  </div>
                  <button onClick={handleAddBlock} disabled={!addLabel.trim()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs font-medium transition-colors">
                    <Save className="w-3.5 h-3.5" />Agregar bloque
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      {showEditModal && editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h3 className="text-sm font-semibold text-zinc-200">Editar bloque</h3>
              <button onClick={() => { setShowEditModal(false); setEditingBlock(null); }} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Título</label>
                <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Día</label>
                <select value={editDay} onChange={(e) => setEditDay(Number(e.target.value))} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                  {DAYS.map((d, i) => (<option key={i} value={i}>{FULL_DAYS[i]}</option>))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Responsable</label>
                <select value={editPerson} onChange={(e) => setEditPerson(e.target.value as AgendaBlock['person'])} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                  <option value="damian">Damián</option>
                  <option value="joss">Joss</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Tipo</label>
                <select value={editBlockType} onChange={(e) => setEditBlockType(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500">
                  {BLOCK_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Inicio</label>
                  <input type="time" value={editStart} onChange={(e) => setEditStart(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Fin</label>
                  <input type="time" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Notas</label>
                <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notas opcionales" className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500 placeholder:text-zinc-600" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteBlock}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />Eliminar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editLabel.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs font-medium transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Day Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0">
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </button>
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl border transition-all shrink-0 ${
                selectedDay === i
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              <span className="text-xs font-medium">{day}</span>
              <span className={`text-sm font-semibold mt-0.5 ${selectedDay === i ? 'text-emerald-400' : 'text-zinc-300'}`}>
                {14 + i}
              </span>
            </button>
          ))}
          <button className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-200">{FULL_DAYS[selectedDay]}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Haz clic en un bloque para editar</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    Damián
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    Joss
                  </span>
                </div>
              </div>

              <div className="flex overflow-x-auto">
                {/* Time labels */}
                <div className="w-14 shrink-0 border-r border-zinc-800">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-12 flex items-start justify-end pr-2 pt-0.5 text-[10px] text-zinc-600">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Two columns */}
                <div className="flex-1 grid grid-cols-2 min-w-[320px]">
                  {/* Damián column */}
                  <div className="relative border-r border-zinc-800">
                    <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-[10px] font-medium text-sky-400/70 bg-zinc-900/80 border-b border-zinc-800 z-10">
                      <User className="w-3 h-3 inline mr-1" />Damián
                    </div>
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-12 border-b border-zinc-800/50" />
                    ))}
                    {damianBlocks.map(renderBlock)}
                  </div>

                  {/* Joss column */}
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-[10px] font-medium text-rose-400/70 bg-zinc-900/80 border-b border-zinc-800 z-10">
                      <User className="w-3 h-3 inline mr-1" />Joss
                    </div>
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-12 border-b border-zinc-800/50" />
                    ))}
                    {jossBlocks.map(renderBlock)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Tasks from Quick Entries */}
            {pendingEntries.length > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">Pendientes</h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {pendingEntries.length}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {pendingEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => toggleEntryDone(entry.id)}
                      className="w-full flex items-start gap-2.5 text-left group hover:bg-zinc-800/50 rounded-lg p-1.5 -m-1.5 transition-colors"
                    >
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5 group-hover:text-amber-400 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 truncate">{entry.text}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{getPersonLabel(entry.person)}{entry.date ? ` - ${entry.date}` : ''}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gym Weekly Tracker */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Gimnasio semanal</h3>
                </div>
                <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                  {gymCompleted}/7
                </span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                  {gymDays.map((g) => (
                    <button
                      key={g.day}
                      onClick={() => toggleGym(g.day)}
                      className={`flex flex-col items-center py-2 rounded-lg border transition-all ${
                        g.completed
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[10px] font-medium">{g.day}</span>
                      <span className="text-[8px] mt-0.5 opacity-70">{g.type}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5 mb-4">
                  {gymDays.map((g) => (
                    <div key={g.day} className="flex items-center gap-2 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${g.completed ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                      <span className="text-zinc-500 w-6">{g.day}</span>
                      <span className="text-zinc-400">{g.detail}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${(gymCompleted / 7) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 text-center">
                  {gymCompleted === 7 ? 'Semana completada' : `${7 - gymCompleted} días restantes`}
                </p>
              </div>
            </div>

            {/* Notas y pendientes */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Notas y pendientes</h3>
                </div>
                <button
                  onClick={() => { setShowAddModal(true); setModalTab('note'); }}
                  className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="w-3 h-3 text-zinc-400" />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {entries.length === 0 && (
                  <p className="text-xs text-zinc-600 text-center py-4">Sin entradas. Agrega una nota o pendiente.</p>
                )}
                {entries.map((entry) => {
                  const Icon = getEntryIcon(entry.type);
                  const color = getEntryColor(entry.type);
                  return (
                    <div key={entry.id} className="flex items-start gap-2.5 group hover:bg-zinc-800/50 rounded-lg p-2 -m-1 transition-colors">
                      <button
                        onClick={() => entry.type === 'pendiente' && toggleEntryDone(entry.id)}
                        className="shrink-0 mt-0.5"
                      >
                        {entry.type === 'pendiente' ? (
                          entry.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600 hover:text-amber-400 transition-colors" />
                          )
                        ) : (
                          <Icon className={`w-4 h-4 ${color}`} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${entry.type === 'pendiente' && entry.done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                          {entry.text}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                            {ENTRY_TYPES.find((t) => t.value === entry.type)?.label}
                          </span>
                          <span className="text-[9px] text-zinc-600">{getPersonLabel(entry.person)}</span>
                          {entry.date && <span className="text-[9px] text-zinc-600">{entry.date}</span>}
                          {entry.time && <span className="text-[9px] text-zinc-600">{entry.time}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5 text-zinc-600 hover:text-rose-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
