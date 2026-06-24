// Mock data for admin pages - realistic Italian hospitality data

export const mockStructures = [
  { id: 1, name: 'Ristorante Il Torchio', code: 'RIST-BN-0012', type: 'Ristorante', status: 'Attiva', shiftsMonth: 32, revenueMonth: 4800, address: 'Via Roma 45, Benevento', zone: 'Centro', fee: 900, piva: 'IT01234567890', contact: 'Mario Rossi', phone: '+39 0824 123456', contractSigned: true, joinDate: '2025-01-15' },
  { id: 2, name: 'Hotel Palazzo', code: 'HOTEL-BN-0003', type: 'Hotel', status: 'Attiva', shiftsMonth: 48, revenueMonth: 7200, address: 'Corso Garibaldi 88, Benevento', zone: 'Centro', fee: 1200, piva: 'IT09876543210', contact: 'Laura Bianchi', phone: '+39 0824 654321', contractSigned: true, joinDate: '2024-11-20' },
  { id: 3, name: 'Bar Centrale', code: 'BAR-BN-0001', type: 'Bar', status: 'In attesa', shiftsMonth: 0, revenueMonth: 0, address: 'Piazza Roma 1, Benevento', zone: 'Centro', fee: 700, piva: 'IT05555555555', contact: 'Giuseppe Verdi', phone: '+39 0824 111222', contractSigned: false, joinDate: '2026-05-01' },
  { id: 4, name: 'Spa Relax', code: 'SPA-BN-0002', type: 'SPA', status: 'Attiva', shiftsMonth: 12, revenueMonth: 1800, address: 'Via Delle Terme 12, Benevento', zone: 'Periferia', fee: 900, piva: 'IT06666666666', contact: 'Anna Fontana', phone: '+39 0824 333444', contractSigned: true, joinDate: '2025-03-10' },
  { id: 5, name: 'Location Villa Rossi', code: 'LOC-BN-0005', type: 'Location', status: 'Sospesa', shiftsMonth: 0, revenueMonth: 0, address: 'Contrada Villa Rossi, Benevento', zone: 'Periferia', fee: 1200, piva: 'IT07777777777', contact: 'Roberto Rossi', phone: '+39 0824 555666', contractSigned: true, joinDate: '2024-08-15' },
  { id: 6, name: 'Ristorante Da Marco', code: 'RIST-BN-0047', type: 'Ristorante', status: 'In attesa', shiftsMonth: 0, revenueMonth: 0, address: 'Via Napoli 23, Benevento', zone: 'Centro', fee: 900, piva: 'IT08888888888', contact: 'Marco De Luca', phone: '+39 0824 777888', contractSigned: false, joinDate: '2026-05-03' },
  { id: 7, name: 'Boutique Hotel Luna', code: 'HOTEL-BN-0008', type: 'Hotel', status: 'Attiva', shiftsMonth: 24, revenueMonth: 3600, address: 'Via delle Stelle 7, Benevento', zone: 'Centro', fee: 1200, piva: 'IT09999999999', contact: 'Sara Luna', phone: '+39 0824 999000', contractSigned: true, joinDate: '2025-02-01' },
  { id: 8, name: 'Bar Sport', code: 'BAR-BN-0003', type: 'Bar', status: 'Attiva', shiftsMonth: 16, revenueMonth: 2400, address: 'Via dello Sport 15, Benevento', zone: 'Periferia', fee: 700, piva: 'IT01111111111', contact: 'Luca Marino', phone: '+39 0824 222333', contractSigned: true, joinDate: '2025-04-12' },
  { id: 9, name: 'Trattoria La Campagna', code: 'RIST-BN-0023', type: 'Ristorante', status: 'Attiva', shiftsMonth: 28, revenueMonth: 4200, address: 'Via Campagna 45, Benevento', zone: 'Periferia', fee: 900, piva: 'IT02222222222', contact: 'Paolo Ferrara', phone: '+39 0824 444555', contractSigned: true, joinDate: '2025-01-20' },
  { id: 10, name: 'Grand Hotel Terme', code: 'HOTEL-BN-0012', type: 'Hotel', status: 'Attiva', shiftsMonth: 56, revenueMonth: 8400, address: 'Via Terme 100, Benevento', zone: 'Centro', fee: 1200, piva: 'IT03333333333', contact: 'Elena Terme', phone: '+39 0824 666777', contractSigned: true, joinDate: '2024-09-01' },
  { id: 11, name: 'Bar del Corso', code: 'BAR-BN-0005', type: 'Bar', status: 'Attiva', shiftsMonth: 20, revenueMonth: 3000, address: 'Corso Dante 55, Benevento', zone: 'Centro', fee: 700, piva: 'IT04444444444', contact: 'Antonio Russo', phone: '+39 0824 888999', contractSigned: true, joinDate: '2025-03-22' },
  { id: 12, name: 'Resort Le Colline', code: 'HOTEL-BN-0018', type: 'Resort', status: 'Attiva', shiftsMonth: 36, revenueMonth: 5400, address: 'SS7 Km 12, Benevento', zone: 'Periferia', fee: 1200, piva: 'IT05555555551', contact: 'Chiara Monti', phone: '+39 0824 000111', contractSigned: true, joinDate: '2025-02-14' },
  { id: 13, name: 'Pizzeria Napoli Mia', code: 'RIST-BN-0034', type: 'Ristorante', status: 'Attiva', shiftsMonth: 22, revenueMonth: 3300, address: 'Via Napoli 78, Benevento', zone: 'Centro', fee: 900, piva: 'IT06666666661', contact: 'Giovanni Napoli', phone: '+39 0824 123123', contractSigned: true, joinDate: '2025-04-01' },
  { id: 14, name: 'Lounge Bar 21', code: 'BAR-BN-0007', type: 'Bar', status: 'Attiva', shiftsMonth: 18, revenueMonth: 2700, address: 'Via XXI Maggio 21, Benevento', zone: 'Centro', fee: 700, piva: 'IT07777777771', contact: 'Francesca Luna', phone: '+39 0824 456456', contractSigned: true, joinDate: '2025-05-10' },
  { id: 15, name: 'Agriturismo Il Ulivo', code: 'RIST-BN-0056', type: 'Ristorante', status: 'In attesa', shiftsMonth: 0, revenueMonth: 0, address: 'Contrada Ulivi 15, Benevento', zone: 'Periferia', fee: 900, piva: 'IT08888888881', contact: 'Pietro Ulivi', phone: '+39 0824 789789', contractSigned: false, joinDate: '2026-05-04' },
  { id: 16, name: 'Hotel Sant\'Elmo', code: 'HOTEL-BN-0025', type: 'Hotel', status: 'Attiva', shiftsMonth: 40, revenueMonth: 6000, address: 'Via Sant\'Elmo 33, Benevento', zone: 'Centro', fee: 1200, piva: 'IT09999999991', contact: 'Cristina Santini', phone: '+39 0824 321321', contractSigned: true, joinDate: '2024-12-01' },
  { id: 17, name: 'Cocktail Bar Metropolis', code: 'BAR-BN-0009', type: 'Bar', status: 'Attiva', shiftsMonth: 14, revenueMonth: 2100, address: 'Viale degli Atlantici 12, Benevento', zone: 'Periferia', fee: 700, piva: 'IT01111111111', contact: 'Alessandro Metro', phone: '+39 0824 654654', contractSigned: true, joinDate: '2025-03-01' },
  { id: 18, name: 'Villa Regina Eventi', code: 'LOC-BN-0012', type: 'Location', status: 'Attiva', shiftsMonth: 20, revenueMonth: 3000, address: 'Via Regina 50, Benevento', zone: 'Periferia', fee: 1200, piva: 'IT02222222221', contact: 'Valentina Regina', phone: '+39 0824 987987', contractSigned: true, joinDate: '2025-01-08' },
  { id: 19, name: 'Osteria del Ponte', code: 'RIST-BN-0067', type: 'Ristorante', status: 'Sospesa', shiftsMonth: 0, revenueMonth: 0, address: 'Via del Ponte 9, Benevento', zone: 'Centro', fee: 900, piva: 'IT03333333331', contact: 'Bruno Ponte', phone: '+39 0824 147147', contractSigned: true, joinDate: '2024-10-15' },
  { id: 20, name: 'Centro Benessere Harmony', code: 'SPA-BN-0005', type: 'SPA', status: 'Attiva', shiftsMonth: 10, revenueMonth: 1500, address: 'Via Harmony 20, Benevento', zone: 'Centro', fee: 900, piva: 'IT04444444441', contact: 'Serena Harm', phone: '+39 0824 258258', contractSigned: true, joinDate: '2025-06-01' },
];

export const mockEmployees = [
  { id: 1, firstName: 'Marco', lastName: 'Ricci', code: 'ATS-D-0047', role: 'Cameriere', rank: 'Senior', rankLevel: 3, rankPoints: 1240, status: 'Attivo', shifts: 24, joinDate: '2024-06-15', phone: '+39 333 1234567', zone: 'Centro', driver: true },
  { id: 2, firstName: 'Giulia', lastName: 'De Luca', code: 'ATS-D-0012', role: 'Chef de Partie', rank: 'Elite', rankLevel: 4, rankPoints: 2890, status: 'Attivo', shifts: 32, joinDate: '2023-09-01', phone: '+39 333 2345678', zone: 'Centro', driver: false },
  { id: 3, firstName: 'Luca', lastName: 'Bianchi', code: 'ATS-D-0089', role: 'Barman', rank: 'Affidabile', rankLevel: 2, rankPoints: 680, status: 'Attivo', shifts: 18, joinDate: '2025-01-10', phone: '+39 333 3456789', zone: 'Periferia', driver: true },
  { id: 4, firstName: 'Anna', lastName: 'Moretti', code: 'ATS-D-0023', role: 'Receptionist', rank: 'Rookie', rankLevel: 1, rankPoints: 120, status: 'In attesa', shifts: 0, joinDate: '2026-05-01', phone: '+39 333 4567890', zone: 'Centro', driver: false },
  { id: 5, firstName: 'Paolo', lastName: 'Santini', code: 'ATS-D-0156', role: 'Chef', rank: 'Senior', rankLevel: 3, rankPoints: 1560, status: 'Colloquio fissato', shifts: 0, joinDate: '2026-04-15', phone: '+39 333 5678901', zone: 'Centro', driver: false },
  { id: 6, firstName: 'Sara', lastName: 'Ferrara', code: 'ATS-D-0078', role: 'Cameriere', rank: 'Affidabile', rankLevel: 2, rankPoints: 890, status: 'Sospeso', shifts: 0, joinDate: '2024-03-20', phone: '+39 333 6789012', zone: 'Periferia', driver: true },
  { id: 7, firstName: 'Davide', lastName: 'Conti', code: 'ATS-D-0034', role: 'Barista', rank: 'Elite', rankLevel: 4, rankPoints: 3100, status: 'Attivo', shifts: 28, joinDate: '2023-11-01', phone: '+39 333 7890123', zone: 'Centro', driver: false },
  { id: 8, firstName: 'Elena', lastName: 'Rossi', code: 'ATS-D-0056', role: 'Cameriere', rank: 'Senior', rankLevel: 3, rankPoints: 1450, status: 'Attivo', shifts: 26, joinDate: '2024-08-15', phone: '+39 333 8901234', zone: 'Centro', driver: true },
  { id: 9, firstName: 'Francesco', lastName: 'Marino', code: 'ATS-D-0091', role: 'Barman', rank: 'Affidabile', rankLevel: 2, rankPoints: 720, status: 'Attivo', shifts: 20, joinDate: '2025-02-01', phone: '+39 333 9012345', zone: 'Periferia', driver: false },
  { id: 10, firstName: 'Chiara', lastName: 'Greco', code: 'ATS-D-0018', role: 'SPA Staff', rank: 'Rookie', rankLevel: 1, rankPoints: 80, status: 'In attesa', shifts: 0, joinDate: '2026-05-02', phone: '+39 333 0123456', zone: 'Centro', driver: false },
  { id: 11, firstName: 'Roberto', lastName: 'Lombardi', code: 'ATS-D-0067', role: 'Chef', rank: 'Senior', rankLevel: 3, rankPoints: 1890, status: 'Attivo', shifts: 30, joinDate: '2023-12-01', phone: '+39 333 1122334', zone: 'Centro', driver: false },
  { id: 12, firstName: 'Martina', lastName: 'Fontana', code: 'ATS-D-0045', role: 'Receptionist', rank: 'Affidabile', rankLevel: 2, rankPoints: 560, status: 'Colloquio da fissare', shifts: 0, joinDate: '2026-04-20', phone: '+39 333 2233445', zone: 'Periferia', driver: false },
  { id: 13, firstName: 'Andrea', lastName: 'Galli', code: 'ATS-D-0082', role: 'Cameriere', rank: 'Elite', rankLevel: 4, rankPoints: 2750, status: 'Attivo', shifts: 34, joinDate: '2023-10-15', phone: '+39 333 3344556', zone: 'Centro', driver: true },
  { id: 14, firstName: 'Laura', lastName: 'Mancini', code: 'ATS-D-0029', role: 'Barista', rank: 'Senior', rankLevel: 3, rankPoints: 1320, status: 'Attivo', shifts: 22, joinDate: '2024-09-01', phone: '+39 333 4455667', zone: 'Centro', driver: false },
  { id: 15, firstName: 'Simone', lastName: 'Rizzo', code: 'ATS-D-0112', role: 'Sous Chef', rank: 'Affidabile', rankLevel: 2, rankPoints: 890, status: 'In valutazione', shifts: 0, joinDate: '2026-04-25', phone: '+39 333 5566778', zone: 'Periferia', driver: false },
  { id: 16, firstName: 'Valentina', lastName: 'Caruso', code: 'ATS-D-0073', role: 'Cameriere', rank: 'Ambassador', rankLevel: 5, rankPoints: 5200, status: 'Attivo', shifts: 36, joinDate: '2023-01-15', phone: '+39 333 6677889', zone: 'Centro', driver: true },
  { id: 17, firstName: 'Matteo', lastName: 'Serra', code: 'ATS-D-0099', role: 'Barman', rank: 'Rookie', rankLevel: 1, rankPoints: 200, status: 'Attivo', shifts: 12, joinDate: '2025-03-01', phone: '+39 333 7788990', zone: 'Periferia', driver: false },
  { id: 18, firstName: 'Federica', lastName: 'Marchetti', code: 'ATS-D-0038', role: 'Receptionist', rank: 'Affidabile', rankLevel: 2, rankPoints: 610, status: 'Attivo', shifts: 16, joinDate: '2025-01-20', phone: '+39 333 8899001', zone: 'Centro', driver: false },
  { id: 19, firstName: 'Alessio', lastName: 'Parisi', code: 'ATS-D-0145', role: 'Chef de Partie', rank: 'Senior', rankLevel: 3, rankPoints: 1680, status: 'Attivo', shifts: 28, joinDate: '2024-04-01', phone: '+39 333 9900112', zone: 'Centro', driver: false },
  { id: 20, firstName: 'Beatrice', lastName: 'Amato', code: 'ATS-D-0061', role: 'SPA Staff', rank: 'Affidabile', rankLevel: 2, rankPoints: 450, status: 'Colloquio fissato', shifts: 0, joinDate: '2026-04-28', phone: '+39 333 0011223', zone: 'Periferia', driver: false },
  { id: 21, firstName: 'Giacomo', lastName: 'Longo', code: 'ATS-D-0108', role: 'Cameriere', rank: 'Elite', rankLevel: 4, rankPoints: 2950, status: 'Attivo', shifts: 32, joinDate: '2023-08-15', phone: '+39 333 1122445', zone: 'Centro', driver: true },
  { id: 22, firstName: 'Ilaria', lastName: 'Martini', code: 'ATS-D-0052', role: 'Barista', rank: 'Senior', rankLevel: 3, rankPoints: 1480, status: 'Sospeso', shifts: 0, joinDate: '2024-02-01', phone: '+39 333 2233556', zone: 'Periferia', driver: false },
  { id: 23, firstName: 'Tommaso', lastName: 'Gatti', code: 'ATS-D-0134', role: 'Barman', rank: 'Affidabile', rankLevel: 2, rankPoints: 780, status: 'Attivo', shifts: 18, joinDate: '2025-04-01', phone: '+39 333 3344667', zone: 'Centro', driver: true },
  { id: 24, firstName: 'Camilla', lastName: 'Ferrari', code: 'ATS-D-0021', role: 'Cameriere', rank: 'Rookie', rankLevel: 1, rankPoints: 150, status: 'Attivo', shifts: 8, joinDate: '2025-06-01', phone: '+39 333 4455778', zone: 'Centro', driver: false },
  { id: 25, firstName: 'Edoardo', lastName: 'Pellegrini', code: 'ATS-D-0178', role: 'Chef', rank: 'Senior', rankLevel: 3, rankPoints: 1720, status: 'In attesa', shifts: 0, joinDate: '2026-05-05', phone: '+39 333 5566889', zone: 'Periferia', driver: false },
];

export const mockActiveShifts = [
  { id: 1, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0047', role: 'Cameriere', time: '08:00 - 16:00', status: 'check-in', checkInTime: '08:03', day: 'Lun' },
  { id: 2, structureCode: 'HOTEL-BN-0003', employeeCode: 'ATS-D-0012', role: 'Receptionist', time: '14:00 - 22:00', status: 'in-attesa', checkInTime: null, day: 'Lun' },
  { id: 3, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0089', role: 'Chef de Partie', time: '06:00 - 14:00', status: 'check-in', checkInTime: '06:01', day: 'Lun' },
  { id: 4, structureCode: 'BAR-BN-0001', employeeCode: 'ATS-D-0023', role: 'Barman', time: '18:00 - 02:00', status: 'check-in', checkInTime: '18:05', day: 'Lun' },
];

export const mockShifts = [
  { id: 1, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0047', role: 'Cameriere', time: '08:00 - 16:00', status: 'In corso', day: 0, date: '12 Maggio' },
  { id: 2, structureCode: 'HOTEL-BN-0003', employeeCode: 'ATS-D-0012', role: 'Receptionist', time: '14:00 - 22:00', status: 'Programmato', day: 0, date: '12 Maggio' },
  { id: 3, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0089', role: 'Chef de Partie', time: '06:00 - 14:00', status: 'In corso', day: 0, date: '12 Maggio' },
  { id: 4, structureCode: 'BAR-BN-0001', employeeCode: 'ATS-D-0023', role: 'Barman', time: '18:00 - 02:00', status: 'In corso', day: 0, date: '12 Maggio' },
  { id: 5, structureCode: 'RIST-BN-0047', employeeCode: null, role: 'Cameriere', time: '12:00 - 20:00', status: 'Da assegnare', day: 0, date: '12 Maggio' },
  { id: 6, structureCode: 'SPA-BN-0002', employeeCode: 'ATS-D-0078', role: 'SPA Staff', time: '09:00 - 17:00', status: 'Programmato', day: 0, date: '12 Maggio' },
  { id: 7, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0067', role: 'Chef', time: '10:00 - 18:00', status: 'Programmato', day: 1, date: '13 Maggio' },
  { id: 8, structureCode: 'HOTEL-BN-0008', employeeCode: 'ATS-D-0056', role: 'Receptionist', time: '08:00 - 16:00', status: 'Programmato', day: 1, date: '13 Maggio' },
  { id: 9, structureCode: 'BAR-BN-0003', employeeCode: 'ATS-D-0091', role: 'Barman', time: '20:00 - 04:00', status: 'Programmato', day: 1, date: '13 Maggio' },
  { id: 10, structureCode: 'RIST-BN-0023', employeeCode: null, role: 'Cameriere', time: '12:00 - 20:00', status: 'Da assegnare', day: 1, date: '13 Maggio' },
  { id: 11, structureCode: 'HOTEL-BN-0012', employeeCode: 'ATS-D-0047', role: 'Cameriere', time: '07:00 - 15:00', status: 'Programmato', day: 2, date: '14 Maggio' },
  { id: 12, structureCode: 'BAR-BN-0005', employeeCode: 'ATS-D-0034', role: 'Barista', time: '06:00 - 14:00', status: 'Programmato', day: 2, date: '14 Maggio' },
  { id: 13, structureCode: 'RIST-BN-0034', employeeCode: 'ATS-D-0082', role: 'Cameriere', time: '11:00 - 19:00', status: 'Programmato', day: 2, date: '14 Maggio' },
  { id: 14, structureCode: 'LOC-BN-0005', employeeCode: 'ATS-D-0073', role: 'Cameriere', time: '15:00 - 23:00', status: 'No-show', day: 2, date: '14 Maggio' },
  { id: 15, structureCode: 'HOTEL-BN-0018', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', time: '09:00 - 17:00', status: 'Programmato', day: 3, date: '15 Maggio' },
  { id: 16, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0045', role: 'Cameriere', time: '18:00 - 02:00', status: 'Programmato', day: 3, date: '15 Maggio' },
  { id: 17, structureCode: 'BAR-BN-0007', employeeCode: 'ATS-D-0099', role: 'Barman', time: '20:00 - 04:00', status: 'Programmato', day: 3, date: '15 Maggio' },
  { id: 18, structureCode: 'SPA-BN-0002', employeeCode: 'ATS-D-0038', role: 'SPA Staff', time: '08:00 - 16:00', status: 'Programmato', day: 4, date: '16 Maggio' },
  { id: 19, structureCode: 'RIST-BN-0056', employeeCode: null, role: 'Chef', time: '11:00 - 19:00', status: 'Da assegnare', day: 4, date: '16 Maggio' },
  { id: 20, structureCode: 'HOTEL-BN-0025', employeeCode: 'ATS-D-0145', role: 'Receptionist', time: '14:00 - 22:00', status: 'Programmato', day: 4, date: '16 Maggio' },
  { id: 21, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0112', role: 'Cameriere', time: '08:00 - 16:00', status: 'Programmato', day: 5, date: '17 Maggio' },
  { id: 22, structureCode: 'BAR-BN-0009', employeeCode: 'ATS-D-0108', role: 'Barman', time: '18:00 - 02:00', status: 'Programmato', day: 5, date: '17 Maggio' },
  { id: 23, structureCode: 'LOC-BN-0012', employeeCode: 'ATS-D-0052', role: 'Cameriere', time: '10:00 - 18:00', status: 'Programmato', day: 5, date: '17 Maggio' },
  { id: 24, structureCode: 'RIST-BN-0012', employeeCode: 'ATS-D-0047', role: 'Cameriere', time: '09:00 - 17:00', status: 'Programmato', day: 6, date: '18 Maggio' },
  { id: 25, structureCode: 'HOTEL-BN-0003', employeeCode: 'ATS-D-0012', role: 'Receptionist', time: '08:00 - 16:00', status: 'Programmato', day: 6, date: '18 Maggio' },
];

export const mockNotifications = [
  { id: 1, type: 'success', icon: 'check-circle', title: 'Check-in confermato', description: 'ATS-D-0047 presso RIST-BN-0012 — 08:03', time: '2 min fa', read: false },
  { id: 2, type: 'alert', icon: 'alert-triangle', title: 'No-show rilevato', description: 'RIST-BN-0047 — nessun check-in entro 15 min', time: '5 min fa', read: false },
  { id: 3, type: 'info', icon: 'credit-card', title: 'Pagamento ricevuto', description: '\u20AC240,00 da Hotel Palazzo', time: '1h fa', read: false },
  { id: 4, type: 'success', icon: 'user-plus', title: 'Nuova struttura registrata', description: 'Ristorante Da Marco — in attesa di approvazione', time: '3h fa', read: true },
  { id: 5, type: 'info', icon: 'message-circle', title: 'Nuovo messaggio chat', description: 'Da RIST-BN-0012 — richiesta modifica turno', time: '5h fa', read: true },
  { id: 6, type: 'alert', icon: 'alert-triangle', title: 'Documenti in scadenza', description: 'HACCP di ATS-D-0089 scade tra 5 giorni', time: '6h fa', read: true },
  { id: 7, type: 'success', icon: 'check-circle', title: 'Turno completato', description: 'ATS-D-0067 ha completato il turno a RIST-BN-0012', time: '8h fa', read: true },
];

export const mockAlerts = [
  { id: 1, type: 'noshow', message: 'No-show in corso: RIST-BN-0047 \u2014 turno senza check-in. Pool reperibili attivato.', priority: 'critical' },
  { id: 2, type: 'payment', message: 'Pagamento fallito: Hotel Palazzo \u2014 carta scaduta. Struttura sospesa.', priority: 'high' },
];

export const mockWeeklyDays = [
  { day: 'LUN', date: '12', fullDate: '12 Maggio', shiftCount: 6 },
  { day: 'MAR', date: '13', fullDate: '13 Maggio', shiftCount: 4 },
  { day: 'MER', date: '14', fullDate: '14 Maggio', shiftCount: 4 },
  { day: 'GIO', date: '15', fullDate: '15 Maggio', shiftCount: 3 },
  { day: 'VEN', date: '16', fullDate: '16 Maggio', shiftCount: 3 },
  { day: 'SAB', date: '17', fullDate: '17 Maggio', shiftCount: 3 },
  { day: 'DOM', date: '18', fullDate: '18 Maggio', shiftCount: 2 },
];

export const revenueData = [
  { day: '1', revenue: 380, hours: 95 },
  { day: '2', revenue: 420, hours: 105 },
  { day: '3', revenue: 350, hours: 88 },
  { day: '4', revenue: 510, hours: 128 },
  { day: '5', revenue: 480, hours: 120 },
  { day: '6', revenue: 620, hours: 155 },
  { day: '7', revenue: 580, hours: 145 },
  { day: '8', revenue: 450, hours: 112 },
  { day: '9', revenue: 390, hours: 98 },
  { day: '10', revenue: 520, hours: 130 },
  { day: '11', revenue: 470, hours: 118 },
  { day: '12', revenue: 580, hours: 145 },
  { day: '13', revenue: 610, hours: 152 },
  { day: '14', revenue: 440, hours: 110 },
  { day: '15', revenue: 530, hours: 132 },
  { day: '16', revenue: 490, hours: 122 },
  { day: '17', revenue: 560, hours: 140 },
  { day: '18', revenue: 420, hours: 105 },
  { day: '19', revenue: 380, hours: 95 },
  { day: '20', revenue: 550, hours: 138 },
];

export const roleDistribution = [
  { name: 'Cameriere', value: 35, color: '#5BB8F5' },
  { name: 'Chef', value: 20, color: '#3AA3E8' },
  { name: 'Barista', value: 18, color: '#1A56A0' },
  { name: 'Barman', value: 12, color: '#1EC99A' },
  { name: 'Receptionist', value: 10, color: '#F5B800' },
  { name: 'Altro', value: 5, color: '#94A3B8' },
];

export const rankColors: Record<string, string> = {
  Rookie: '#94A3B8',
  Affidabile: '#5BB8F5',
  Senior: '#3AA3E8',
  Elite: '#1EC99A',
  Ambassador: '#F5B800',
};

export const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Attiva': { bg: 'rgba(30,201,154,0.15)', text: '#1EC99A', dot: '#1EC99A' },
  'Attivo': { bg: 'rgba(30,201,154,0.15)', text: '#1EC99A', dot: '#1EC99A' },
  'In attesa': { bg: 'rgba(245,184,0,0.15)', text: '#F5B800', dot: '#F5B800' },
  'Sospesa': { bg: 'rgba(240,69,69,0.15)', text: '#F04545', dot: '#F04545' },
  'Sospeso': { bg: 'rgba(240,69,69,0.15)', text: '#F04545', dot: '#F04545' },
  'Programmato': { bg: 'rgba(91,184,245,0.15)', text: '#5BB8F5', dot: '#5BB8F5' },
  'In corso': { bg: 'rgba(30,201,154,0.15)', text: '#1EC99A', dot: '#1EC99A' },
  'Completato': { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8', dot: '#94A3B8' },
  'No-show': { bg: 'rgba(240,69,69,0.15)', text: '#F04545', dot: '#F04545' },
  'Da assegnare': { bg: 'rgba(245,184,0,0.15)', text: '#F5B800', dot: '#F5B800' },
  'Colloquio fissato': { bg: 'rgba(91,184,245,0.15)', text: '#5BB8F5', dot: '#5BB8F5' },
  'Colloquio da fissare': { bg: 'rgba(91,184,245,0.15)', text: '#5BB8F5', dot: '#5BB8F5' },
  'In valutazione': { bg: 'rgba(91,184,245,0.15)', text: '#5BB8F5', dot: '#5BB8F5' },
};

export const mockPenalties = [
  { id: 1, type: 'Cancellazione < 24h', amount: 150, condition: 'Last minute', status: 'Pagata', date: '2026-04-15', structure: 'RIST-BN-0012' },
  { id: 2, type: 'Cancellazione 24-48h', amount: 75, condition: 'Preavviso ridotto', status: 'In attesa', date: '2026-05-02', structure: 'HOTEL-BN-0003' },
  { id: 3, type: 'Rapporto diretto', amount: 3000, condition: 'Post-match < 24 mesi', status: 'Contestata', date: '2026-03-20', structure: 'BAR-BN-0003' },
];

export const roleRates = [
  { role: 'Cameriere', baseRate: 8.0, holiday: 50, night: 30, overtime: 40 },
  { role: 'Chef', baseRate: 10.0, holiday: 50, night: 30, overtime: 40 },
  { role: 'Sous Chef', baseRate: 9.5, holiday: 50, night: 30, overtime: 40 },
  { role: 'Chef de Partie', baseRate: 9.0, holiday: 50, night: 30, overtime: 40 },
  { role: 'Barista', baseRate: 8.5, holiday: 50, night: 30, overtime: 40 },
  { role: 'Barman', baseRate: 9.0, holiday: 50, night: 30, overtime: 40 },
  { role: 'Receptionist', baseRate: 8.5, holiday: 50, night: 30, overtime: 40 },
  { role: 'SPA Staff', baseRate: 8.0, holiday: 50, night: 30, overtime: 40 },
];

export const rankThresholds = [
  { level: 1, name: 'Rookie', points: 0, bonus: 0, benefits: '\u2014' },
  { level: 2, name: 'Affidabile', points: 500, bonus: 0.50, benefits: 'Priorit\u00E0 notifiche' },
  { level: 3, name: 'Senior', points: 1500, bonus: 1.00, benefits: 'Pool reperibili, turni premium' },
  { level: 4, name: 'Elite', points: 3000, bonus: 1.50, benefits: 'Notifiche prime, turni esclusivi' },
  { level: 5, name: 'Ambassador', points: 5000, bonus: 2.00, benefits: 'Gestione team, onboarding, compenso extra' },
];

export const penaltyRules = [
  { penalty: 'Cancellazione 24-48h', amount: '50% ore', condition: 'Preavviso ridotto', editable: true },
  { penalty: 'Cancellazione < 24h', amount: '100% ore', condition: 'Last minute', editable: true },
  { penalty: 'Tentativo contatto diretto', amount: 'Ammonimento', condition: 'Prima volta', editable: false },
  { penalty: 'Rapporto diretto < 24 mesi', amount: '\u20AC3.000', condition: 'Post-match', editable: true },
  { penalty: 'Assunzione diretta', amount: '\u20AC5.000', condition: 'Qualsiasi forma', editable: true },
];

export const feeTiers = [
  { type: 'Bar, piccolo ristorante', fee: 700, volume: 'Basso' },
  { type: 'Ristorante medio, boutique hotel', fee: 900, volume: 'Medio' },
  { type: 'Hotel, resort, location', fee: 1200, volume: 'Alto' },
];

export const discountTiers = [
  { range: '0-50 turni', discount: '0%' },
  { range: '51-150 turni', discount: '-10%' },
  { range: '151-300 turni', discount: '-20%' },
  { range: '300+ turni', discount: '-30%' },
];

export const positivePoints = [
  { action: 'Turno completato feriale', points: 10 },
  { action: 'Turno completato festivo', points: 20 },
  { action: 'Turno urgente completato', points: 30 },
  { action: 'Risposta notifica < 2h', points: 5 },
  { action: 'Valutazione positiva per tag', points: 3 },
  { action: 'Corso completato', points: 50 },
  { action: 'Mese no-show free', points: 25 },
  { action: 'Disponibilit\u00E0 driver navetta', points: 10 },
];

export const negativePoints = [
  { action: 'No-show', points: -100 },
  { action: 'Mancata risposta nei tempi', points: -20 },
  { action: 'Valutazione negativa per tag', points: -5 },
  { action: 'Ritardo check-in', points: -10 },
  { action: 'Richiamo formale', points: -50 },
];

export const mockReperibili = [
  { id: 1, code: 'ATS-D-0067', name: 'Roberto L.', rank: 'Senior', distance: '2.3 km', phone: '+39 333 1122334', available: true },
  { id: 2, code: 'ATS-D-0082', name: 'Andrea G.', rank: 'Elite', distance: '1.5 km', phone: '+39 333 3344556', available: true },
  { id: 3, code: 'ATS-D-0099', name: 'Matteo S.', rank: 'Rookie', distance: '4.2 km', phone: '+39 333 7788990', available: true },
  { id: 4, code: 'ATS-D-0052', name: 'Laura M.', rank: 'Senior', distance: '3.1 km', phone: '+39 333 4455667', available: false },
  { id: 5, code: 'ATS-D-0112', name: 'Simone R.', rank: 'Affidabile', distance: '5.0 km', phone: '+39 333 5566778', available: true },
  { id: 6, code: 'ATS-D-0034', name: 'Davide C.', rank: 'Elite', distance: '1.8 km', phone: '+39 333 7890123', available: true },
];

// ─── Zonal Hourly Rate Data Model ───────────────────────────────

export const zoneRates = [
  { zone: 'Centro', baseRate: 18.00, description: 'Zone centrali di Benevento' },
  { zone: 'Periferia', baseRate: 15.00, description: 'Zone periferiche e suburbane' },
  { zone: 'Industriale', baseRate: 16.00, description: 'Zone industriali e artigianali' },
  { zone: 'Eventi', baseRate: 22.00, description: 'Location eventi e fiere' },
  { zone: 'Resort', baseRate: 20.00, description: 'Resort, spa e strutture ricettive' },
] as const;

export type ZoneName = typeof zoneRates[number]['zone'];

export const roleMultipliers: Record<string, number> = {
  'Cameriere': 1.0,
  'Chef': 1.15,
  'Sous Chef': 1.12,
  'Chef de Partie': 1.08,
  'Barista': 1.10,
  'Barman': 1.10,
  'Receptionist': 1.05,
  'SPA Staff': 1.0,
};

export function getHourlyRate(zone: string, role: string, rankBonus: number = 0): number {
  const zoneBase = zoneRates.find(z => z.zone === zone)?.baseRate || 15.00;
  const multiplier = roleMultipliers[role] || 1.0;
  return parseFloat((zoneBase * multiplier + rankBonus).toFixed(2));
}

// Employee photos mapping (8 avatars for 25 employees, cycling)
export const employeePhotos: Record<number, string> = {
  1: '/avatar-employee-1.jpg',
  2: '/avatar-employee-2.jpg',
  3: '/avatar-employee-3.jpg',
  4: '/avatar-employee-4.jpg',
  5: '/avatar-employee-5.jpg',
  6: '/avatar-employee-6.jpg',
  7: '/avatar-employee-7.jpg',
  8: '/avatar-employee-8.jpg',
  9: '/avatar-employee-1.jpg',
  10: '/avatar-employee-2.jpg',
  11: '/avatar-employee-3.jpg',
  12: '/avatar-employee-4.jpg',
  13: '/avatar-employee-5.jpg',
  14: '/avatar-employee-6.jpg',
  15: '/avatar-employee-7.jpg',
  16: '/avatar-employee-8.jpg',
  17: '/avatar-employee-1.jpg',
  18: '/avatar-employee-2.jpg',
  19: '/avatar-employee-3.jpg',
  20: '/avatar-employee-4.jpg',
  21: '/avatar-employee-5.jpg',
  22: '/avatar-employee-6.jpg',
  23: '/avatar-employee-7.jpg',
  24: '/avatar-employee-8.jpg',
  25: '/avatar-employee-1.jpg',
};

// Structure photos mapping (8 structure photos for 20 structures, cycling)
export const structurePhotos: Record<number, string> = {
  1: '/structure-1.jpg',
  2: '/structure-2.jpg',
  3: '/structure-3.jpg',
  4: '/structure-4.jpg',
  5: '/structure-5.jpg',
  6: '/structure-6.jpg',
  7: '/structure-7.jpg',
  8: '/structure-8.jpg',
  9: '/structure-1.jpg',
  10: '/structure-2.jpg',
  11: '/structure-3.jpg',
  12: '/structure-4.jpg',
  13: '/structure-5.jpg',
  14: '/structure-6.jpg',
  15: '/structure-7.jpg',
  16: '/structure-8.jpg',
  17: '/structure-1.jpg',
  18: '/structure-2.jpg',
  19: '/structure-3.jpg',
  20: '/structure-4.jpg',
};

// Helper: get employee with photo and hourly rate
export function enrichEmployee(emp: typeof mockEmployees[number]) {
  const photo = employeePhotos[emp.id] || '/avatar-employee-1.jpg';
  const rankBonus = rankThresholds.find(r => r.name === emp.rank)?.bonus || 0;
  const hourlyRate = getHourlyRate(emp.zone as ZoneName, emp.role, rankBonus);
  return { ...emp, photo, hourlyRate };
}

// Helper: get structure with photo
export function enrichStructure(str: typeof mockStructures[number]) {
  const photo = structurePhotos[str.id] || '/structure-1.jpg';
  return { ...str, photo };
}
