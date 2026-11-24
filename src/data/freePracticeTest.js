// Free 10-question safety practice test (original questions; not from any certification body).
const QUESTIONS = [
  { domain: 'Risk management', q: 'A risk assessment finds workers are exposed to solvent vapour during parts cleaning. Which control is the MOST effective according to the hierarchy of controls?',
    o: ['Provide half-mask respirators with organic vapour cartridges', 'Replace the solvent with a water-based cleaner', 'Rotate workers every two hours', 'Post warning signs at the cleaning station'], a: 1,
    e: 'Substitution removes the hazard at source, so it ranks above engineering controls, administrative controls (rotation, signs) and PPE.' },
  { domain: 'Safety calculations', q: 'A site had 6 recordable injuries and 400,000 hours worked this year. What is its OSHA total recordable incident rate (TRIR)?',
    o: ['1.5', '3.0', '6.0', '15.0'], a: 1, e: 'TRIR = recordable cases x 200,000 / hours worked = 6 x 200,000 / 400,000 = 3.0.' },
  { domain: 'Industrial hygiene', q: 'Using the OSHA criteria (90 dBA for 8 hours, 5 dB exchange rate), how long may a worker be exposed to 100 dBA without hearing protection?',
    o: ['1 hour', '2 hours', '4 hours', '8 hours'], a: 1, e: 'Each 5 dB increase halves the allowed time: 90 dBA = 8 h, 95 dBA = 4 h, 100 dBA = 2 h.' },
  { domain: 'Confined spaces', q: 'In what order should the atmosphere of a permit-required confined space be tested before entry?',
    o: ['Toxic gases, flammable gases, oxygen', 'Flammable gases, oxygen, toxic gases', 'Oxygen, flammable gases and vapours, toxic contaminants', 'The order does not matter'], a: 2,
    e: 'Oxygen is tested first because most combustible-gas meters need enough oxygen to read correctly, then flammables, then toxics.' },
  { domain: 'Incident investigation', q: 'During a 5-Whys investigation the team concludes that "the worker was careless". What should the team do next?',
    o: ['Close the investigation and retrain the worker', 'Keep asking why: look for the system conditions that allowed the error', 'Issue a disciplinary letter', 'Record human error as the root cause'], a: 1,
    e: 'Human error is usually a symptom. A good investigation continues to management-system causes such as supervision, design, workload or procedures.' },
  { domain: 'Fall protection', q: 'Under OSHA construction rules (29 CFR 1926 Subpart M), at what height is fall protection generally required?',
    o: ['4 feet (1.2 m)', '6 feet (1.8 m)', '10 feet (3 m)', '15 feet (4.6 m)'], a: 1,
    e: 'The general construction trigger height is 6 feet. General industry uses 4 feet, and scaffolds have their own 10-foot rule.' },
  { domain: 'Management systems', q: 'In ISO 45001, which of the following BEST describes the purpose of worker consultation and participation?',
    o: ['To inform workers about decisions already taken', 'To involve workers, including non-managers, in OH&S decisions and processes', 'To transfer legal responsibility to workers', 'To replace management review'], a: 1,
    e: 'ISO 45001 clause 5.4 requires processes for consultation and participation of workers at all levels, with emphasis on non-managerial workers.' },
  { domain: 'Energy control', q: 'After locks and tags are applied and stored energy is released, what must the authorised employee do BEFORE starting work?',
    o: ['Sign the shift log', 'Verify isolation, for example by trying the start control', 'Remove the tag', 'Ask the operator whether the machine is off'], a: 1,
    e: 'Verification of isolation (the "try" step) is required before servicing; controls are then returned to off or neutral.' },
  { domain: 'Emergency preparedness', q: 'Using SLOPE + 1 safety-in-depth thinking, which measure is a MITIGATION barrier rather than a PREVENTION barrier for a flammable liquid fire?',
    o: ['Bonding and grounding during transfer', 'A fixed foam suppression system', 'Hot work permits', 'Vapour-tight storage containers'], a: 1,
    e: 'Suppression acts after ignition and reduces consequences. The other measures reduce the chance of ignition or release.' },
  { domain: 'Ethics', q: 'A manager asks you to reclassify a recordable injury as first aid so that the team keeps its safety bonus. What is the BEST response?',
    o: ['Reclassify it because the injury was minor', 'Record it correctly, explain why, and raise the bonus design as a concern', 'Delay the record until after the bonus is paid', 'Ask the worker to agree to the change'], a: 1,
    e: 'Accurate records are a legal and professional duty. Bonuses tied to low injury counts encourage under-reporting and should be challenged.' },
];

// spread the correct answer over A-D so a pattern cannot be guessed
const SLOT = [1, 3, 0, 2, 3, 1, 0, 2, 3, 0];
export const FREE_TEST = QUESTIONS.map((q, i) => {
  const rest = q.o.filter((x, k) => k !== q.a);
  return { ...q, o: [...rest.slice(0, SLOT[i]), q.o[q.a], ...rest.slice(SLOT[i])], a: SLOT[i] };
});
