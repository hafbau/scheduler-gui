export function getAppointmentsForDay(state, day) {
  const found = state.days.find(d => day === d.name);

  if (state.days.length === 0 || found === undefined) return [];

  return found.appointments.map(id => state.appointments[id]);
}
