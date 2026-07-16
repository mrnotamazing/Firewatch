/**
 * PLACEHOLDER contact addresses. These are NOT verified official grievance emails — replace
 * with the real, current public grievance/escalation address for each department before using
 * this in an actual deployment.
 */
export const departmentContacts = {
  BESCOM: 'grievance.bescom@example.gov.in',
  BBMP: 'grievance.bbmp@example.gov.in',
  'Fire Dept': 'control.room@karnatakafire.example.gov.in',
};

export function contactFor(department) {
  return departmentContacts[department] || 'grievance@example.gov.in';
}
