import React, { useState, useEffect } from 'react';
import { db } from '../../utils/database';
import type { Teacher } from '../../types';

const days = [
  'Samedi', 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'
];

const EmploiDuTemps: React.FC = () => {
  // تعديل جلسة
  const [editSession, setEditSession] = useState<{ day: string, hour: string, idx: number } | null>(null);

  const handleDeleteSession = (day: string, hour: string, idx: number) => {
    setEmploi(prev => {
      const sessions = prev[day]?.[hour] || [];
      const newSessions = sessions.filter((_, i) => i !== idx);
      return {
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [hour]: newSessions
        }
      };
    });
  };

  const handleEditSession = (day: string, hour: string, idx: number) => {
    const session = emploi[day]?.[hour]?.[idx];
    if (session) {
      setModal({ day, hour });
      setForm({ ...session });
      setEditSession({ day, hour, idx });
    }
  };
  const defaultHours = [
    '08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'
  ];
  const [hours, setHours] = useState<string[]>(defaultHours);
  const [editHours, setEditHours] = useState(false);
  const [hoursInput, setHoursInput] = useState<string[]>(defaultHours);
  // Structure: emploi[day][hour] = { teacher, class, room }
  type Session = { teacher: string; class: string; room: string };
  // emploi[day][hour] = Session[]
  const [emploi, setEmploi] = useState<{ [day: string]: { [hour: string]: Session[] } }>({});
  const [modal, setModal] = useState<{ day: string, hour: string } | null>(null);
  const [form, setForm] = useState({ teacher: '', class: '', room: '' });

  // جلب الأساتذة من قاعدة البيانات
  const [teachers, setTeachers] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      try {
  const allTeachers: Teacher[] = await db.getAllTeachers();
  setTeachers(allTeachers.map((t: Teacher) => t.fullName));
      } catch {
        setTeachers([]);
      }
    })();
  }, []);

  const handleCellClick = (day: string, hour: string) => {
    setModal({ day, hour });
    setForm({ teacher: '', class: '', room: '' });
  };

  const handleAddSession = () => {
    if (editSession) {
      setEmploi(prev => {
        const sessions = prev[editSession.day]?.[editSession.hour] || [];
        const newSessions = [...sessions];
        newSessions[editSession.idx] = { ...form };
        return {
          ...prev,
          [editSession.day]: {
            ...(prev[editSession.day] || {}),
            [editSession.hour]: newSessions
          }
        };
      });
      setEditSession(null);
    } else {
      setEmploi(prev => ({
        ...prev,
        [modal!.day]: {
          ...(prev[modal!.day] || {}),
          [modal!.hour]: [ ...(prev[modal!.day]?.[modal!.hour] || []), { ...form } ]
        }
      }));
    }
    setModal(null);
  };

  const handleSave = () => {
    // TODO: Save emploi to DB
    alert('Emploi du temps enregistré!');
  };

  // Removed unused handleDownloadPDF function

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Emploi du temps</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold"
          onClick={() => setEditHours(e => !e)}
        >
          {editHours ? 'Valider les horaires' : 'Modifier les horaires'}
        </button>
      </div>
      {editHours && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {hoursInput.map((h, idx) => (
            <input
              key={idx}
              className="border rounded-lg p-2 text-center"
              value={h}
              onChange={e => {
                const arr = [...hoursInput];
                arr[idx] = e.target.value;
                setHoursInput(arr);
              }}
              placeholder={`Horaire ${idx + 1}`}
            />
          ))}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 col-span-full"
            onClick={() => { setHours(hoursInput); setEditHours(false); }}
          >
            Appliquer
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg shadow-lg bg-white">
          <thead>
            <tr>
              <th className="border px-6 py-4 bg-gray-100 text-lg text-gray-700">Les jours</th>
              {hours.map(h => (
                <th key={h} className="border px-6 py-4 bg-gray-100 text-lg text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td className="border px-6 py-4 font-semibold text-base bg-gray-50">{day}</td>
                {hours.map(hour => (
                  <td
                    key={hour}
                    className={`border px-6 py-4 cursor-pointer hover:bg-blue-50 min-w-[160px] align-top transition-all duration-150`}
                    onClick={() => handleCellClick(day, hour)}
                  >
                    {emploi[day]?.[hour] && emploi[day][hour].length > 0 ? (
                      <ul className="space-y-2">
                        {emploi[day][hour].map((session, idx) => (
                          <li key={idx} className="border rounded-lg p-2 bg-blue-50 flex flex-col gap-1 shadow-sm relative">
                            <div className="absolute top-1 right-2 flex gap-1">
                              <button
                                className="text-xs text-gray-400 hover:text-red-600 px-1 rounded focus:outline-none"
                                title="Supprimer"
                                onClick={e => { e.stopPropagation(); handleDeleteSession(day, hour, idx); }}
                              >✕</button>
                              <button
                                className="text-xs text-gray-400 hover:text-blue-600 px-1 rounded focus:outline-none"
                                title="Modifier"
                                onClick={e => { e.stopPropagation(); handleEditSession(day, hour, idx); }}
                              >✎</button>
                            </div>
                            <span className="font-semibold text-blue-800">{session.teacher}</span>
                            <span className="text-xs text-gray-700">{session.class}</span>
                            <span className="text-xs text-gray-500">Salle: {session.room}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[60px]">
                        <span className="text-gray-300 italic text-lg select-none" style={{
                          background: 'repeating-linear-gradient(135deg, #e5e7eb 0px, #e5e7eb 8px, transparent 8px, transparent 16px)',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          display: 'inline-block',
                          width: '100%'
                        }}>
                          // Vide
                        </span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          Enregistrer
        </button>
        <button
          onClick={async () => {
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            // Header: TCC name and Emploi du temps
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 62, 80);
            doc.setFontSize(28);
            doc.text('TCC', doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
            doc.setFontSize(18);
            doc.setTextColor(41, 128, 185);
            doc.text('Emploi du temps', doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
            doc.setFontSize(11);
            doc.setTextColor(44, 62, 80);
            // Prepare table columns (days)
            const columns = [{ header: 'Heure/Jour', dataKey: 'hour' }, ...days.map(day => ({ header: day, dataKey: day }))];
            // Prepare table rows with improved formatting
            const rows = hours.map(hour => {
              const row: Record<string, string> = { hour };
              days.forEach(day => {
                const sessions = emploi[day]?.[hour] || [];
                if (sessions.length > 0) {
                  // Format each session as a bullet point, separated by a line
                  row[day] = sessions.map(s => `• ${s.teacher} | ${s.class} | Salle: ${s.room}`).join('\n');
                } else {
                  row[day] = '—';
                }
              });
              return row;
            });
            // إعداد columnStyles مع خط فاصل بين الأعمدة (الأيام)
            const columnStyles: Record<number, object> = {
              0: { cellWidth: 60, fontStyle: 'bold', textColor: [41, 128, 185], halign: 'center' },
            };
            for (let i = 1; i < columns.length; i++) {
              columnStyles[i] = {
                cellWidth: undefined,
                cellPadding: 6,
                valign: 'top',
                halign: 'left',
                fontSize: 9,
                font: 'helvetica',
                textColor: [44, 62, 80],
                lineWidth: 1,
                lineColor: [41, 128, 185], // خط فاصل بلون أزرق بين الأعمدة
              };
            }
            autoTable(doc, {
              head: [columns.map(col => col.header)],
              body: rows.map(row => columns.map(col => row[col.dataKey])),
              startY: 100,
              margin: { left: 40, right: 40 },
              styles: {
                cellPadding: 6,
                fontSize: 9,
                valign: 'top',
                halign: 'left',
                minCellHeight: 24,
                textColor: [44, 62, 80],
                font: 'helvetica',
                overflow: 'linebreak',
              },
              headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 13,
                halign: 'center',
                lineWidth: 1,
                lineColor: [41, 128, 185],
              },
              alternateRowStyles: {
                fillColor: [230, 240, 255],
              },
              columnStyles,
              tableLineColor: [41, 128, 185],
              tableLineWidth: 0.7,
            });
            // Footer: date and signature
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setFontSize(10);
            doc.setTextColor(120, 120, 120);
            doc.text(`Créé le: 26/09/2025`, doc.internal.pageSize.getWidth() - 120, pageHeight - 30);
            doc.text('Signature: ___________________', 40, pageHeight - 30);
            doc.save('emploi-du-temps.pdf');
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Télécharger PDF
        </button>
      </div>
      {/* Modal d'ajout */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Nouvelle séance</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Enseignant</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={form.teacher}
                  onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}
                >
                  <option value="">Sélectionner...</option>
                  {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Langue / Matière</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={form.class}
                  onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                  placeholder="Saisir la langue ou matière"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salle</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={form.room}
                  onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                  placeholder="Numéro ou nom de la salle"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddSession}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                Ajouter
              </button>
              <button
                onClick={() => setModal(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploiDuTemps;
