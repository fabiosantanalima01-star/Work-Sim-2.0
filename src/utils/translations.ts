/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Translation dictionary for Portuguese (PT) vs English (EN)
export interface TranslationMap {
  [key: string]: {
    pt: string;
    en: string;
  };
}

export const UI_TRANSLATIONS: TranslationMap = {
  // Mobile Topbar
  "app_title": { pt: "WorkSim", en: "WorkSim" },
  "bathroom": { pt: "🚽 Banheiro", en: "🚽 Bathroom" },
  "go_to_prof": { pt: "🚶‍♂️ Ir ao Prof.", en: "🚶‍♂️ Go to Prof" },
  "physical_doubt": { pt: "Dúvida Física", en: "In-Person Help" },
  "intrachat": { pt: "IntraChat Direto (Sem Pausa)", en: "Direct IntraChat (No Pause)" },
  "manager_station": { pt: "Estação de Marcos (Gestor)", en: "Marcos' Station (Manager)" },
  "manager_note": {
    pt: "\"Sua matrícula foi integrada ao e-Social. Use a calculadora lateral para analisar os erros!\"",
    en: "\"Your enrollment has been integrated into e-Social. Use the side calculator to analyze errors!\""
  },
  "manager_key": { pt: "Chave: marcos.gerente / clt2026", en: "Key: marcos.gerente / clt2026" },

  // Navigation Tabs
  "active_challenges_gira": { pt: "🔥 Casos de Treta", en: "🔥 Case Files" },
  "active_challenges": { pt: "Desafios Ativos", en: "Active Challenges" },
  "my_career_gira": { pt: "🌟 Subir na Vida", en: "🌟 Career Climb" },
  "my_career": { pt: "Minha Carreira", en: "My Career" },
  "translator_gira": { pt: "💬 Tradutor DP (Gírias)", en: "💬 Glossary & Terms" },
  "translator_clt": { pt: "Tradutor CLT", en: "CLT Glossary" },
  "government_chart_gira": { pt: "📈 Gráfico do Governo", en: "📈 Government Chart" },
  "government_chart": { pt: "Gráfico e-Social", en: "e-Social Metrics" },
  "my_yield_gira": { pt: "⏱️ Meu Rendimento", en: "⏱️ My Yield" },
  "my_yield": { pt: "Desempenho Pessoal", en: "Personal Performance" },
  "sandbox_gira": { pt: "🎮 Lab. RH Simulator", en: "🎮 HR Sandbox Lab" },
  "sandbox": { pt: "Laboratório Técnico", en: "Technical Laboratory" },
  "sandbox_blocked_gira": { pt: "🔒 Lab. Bloqueado", en: "🔒 Lab Locked" },
  "sandbox_blocked": { pt: "Laboratório Técnico", en: "Technical Laboratory" },
  "prof_desk_gira": { pt: "🎓 Painel do Professor/Monitoria", en: "🎓 Professor/Monitoring Panel" },
  "prof_desk": { pt: "Painel do Professor/Monitoria", en: "Professor/Monitoring Panel" },
  "bug_mapper_gira": { pt: "👾 Mapeador de Bugs", en: "👾 Bug Tracker" },
  "bug_mapper": { pt: "Canal do Veterano", en: "Veteran Channel" },

  // Theme Modes
  "toggle_theme_title": { pt: "Alternar Tema", en: "Toggle Theme" },
  "diurno": { pt: "DIURNO", en: "LIGHT" },
  "noturno": { pt: "NOTURNO", en: "DARK" },
  "day": { pt: "DIA", en: "LIGHT" },
  "night": { pt: "NOT", en: "DARK" },

  // User details & metrics
  "user_xp": { pt: "XP Total", en: "Total XP" },
  "user_precision": { pt: "Precisão Geral", en: "Overall Accuracy" },
  "logged_as": { pt: "Logado como:", en: "Logged in as:" },
  "registration": { pt: "Matrícula:", en: "ID / Reg:" },
  "current_role": { pt: "Cargo:", en: "Role:" },
  "admin_access": { pt: "Acesso Administrativo", en: "Admin Access" },

  // Workstation Header Banner
  "active_station_label": { pt: "ESTAÇÃO ATIVA PC-04 — LOGÍSTICA", en: "ACTIVE WORKSTATION PC-04 — LOGISTICS" },
  "phase_prefix": { pt: "Fase", en: "Phase" },
  "foco_label": { pt: "Foco Principal:", en: "Main Focus:" },
  "completed_desafios": { pt: "concluído", en: "completed" },
  "challenge_unlocked": { pt: "Desbloqueado", en: "Unlocked" },
  "challenge_locked": { pt: "Bloqueado", en: "Locked" },

  // Active Challenge Panel
  "no_active_challenge": { pt: "Nenhum desafio ativo selecionado.", en: "No active challenge selected." },
  "select_challenge_msg": { pt: "Selecione um caso na lista lateral para iniciar a análise técnica e submeter sua solução ao e-Social.", en: "Select a case from the side list to begin technical analysis and submit your solution to e-Social." },
  "case_officer": { pt: "Oficial de Caso:", en: "Case Officer:" },
  "time_limit": { pt: "Tempo Limite:", en: "Time Limit:" },
  "minutes_unit": { pt: "minutos", en: "minutes" },
  "xp_reward": { pt: "Recompensa:", en: "Reward:" },
  "employee_complaint": { pt: "Queixa Formal do Empregado / Situação Fato:", en: "Employee's Formal Complaint / Incident Context:" },
  "employee_data_card": { pt: "Ficha Cadastral do Empregado (e-Social)", en: "Employee Registry Card (e-Social)" },
  "form_actions": { pt: "Ação Obrigatória do Operador de DP:", en: "Required DP Handler Action:" },
  "submit_solution": { pt: "Transmitir Evento ao e-Social", en: "Transmit Event to e-Social" },
  "challenge_completed_badge": { pt: "DESAFIO CONCLUÍDO COM SUCESSO PERANTE O MINISTÉRIO DO TRABALHO", en: "CHALLENGE SUCCESSFULLY RESOLVED BEFORE THE MINISTRY OF LABOR" },
  "your_answer_was": { pt: "Sua resposta transmitida:", en: "Your submitted answer:" },
  "correct_legal_basis": { pt: "Fundamentação Legal Correta (Gabarito Oficial):", en: "Correct Legal Grounding (Official Answer Key):" },

  // Phase Tracker
  "cbo_track": { pt: "🎯 Trilha de Trampo do DP", en: "🎯 DP Career Target Track" },
  "cbo_track_detailed": { pt: "Abaixo estão os cargos oficiais na hierarquia do departamento pessoal de acordo com a classificação brasileira (CBO). Avance nas fases resolvendo os desafios ativos.", en: "Below are the official ranks in the department of personnel hierarchy. Advance through the phases by resolving cases." },

  // General calculator
  "calc_title": { pt: "🧮 Calculadora de Bolso CLT", en: "🧮 Handheld CLT Calculator" },

  // Chat window
  "intrachat_title": { pt: "IntraChat - Conexão Direta de Suporte", en: "IntraChat - Live Trainer Assistance" }
};

// Maps dynamic translations for Brazilian-context challenge data when EN is active.
// Includes Phase 0, Phase 3, and core challenges so they render fully in English.
export const CHALLENGE_TRANSLATIONS: Record<string, {
  titulo: string;
  queixa: string;
  focoTecnico: string;
  opcoes: string[];
  gabaritoExplicacao?: string;
}> = {
  "0.1": {
    titulo: "The Elements of the Employment Relationship",
    queixa: "Hello Team, for my registration contract, I need to make sure my activities fulfill all the criteria of a legal employment relationship (vínculo trabalhista) under Brazilian law. What are the 5 fundamental requirements described in Article 3 of the CLT?",
    focoTecnico: "Article 3 of the CLT",
    opcoes: [
      "Personality (Pessoalidade), Habituality (Habitualidade), Subordination (Subordinação), Onerousness (Onerosidade), and being an Individual (Pessoa Física).",
      "Personality, Exclusivity, Profitability, High Revenue, and Force Majeure.",
      "Direct Partnership, Informality, Micro-entrepreneur ID (MEI), On-demand services, and being a Corporate Entity (PJ)."
    ]
  },
  "0.2": {
    titulo: "Hiring and the Nature of FGTS",
    queixa: "Hello, I am being registered with a full base salary of R$ 2,300.00. I would like to know if the FGTS (Severance Fund) deposit is deducted from my paycheck, what is the exact percentage rate, and how much the employer must deposit monthly into my FGTS savings account.",
    focoTecnico: "Calculating Monthly FGTS",
    opcoes: [
      "FGTS is NOT deducted from your salary; it is an exclusive employer obligation. The company must deposit R$ 184.00 (8% of R$ 2,300) monthly into your linked account.",
      "FGTS is fully deducted from the worker's salary in the payroll at an 8% rate, generating a monthly deduction of R$ 184.00 on your paycheck.",
      "FGTS is co-funded: the company can deduct up to 6% of your salary (R$ 138.00) and complement the rest as its own employer charge.",
      "The company deducts half (4% = R$ 92.00) from the employee and pays the other R$ 92.00 from its own funds."
    ]
  },
  "0.3": {
    titulo: "Clock-In Grace Period",
    queixa: "I punched in at 08:06 AM instead of 08:00 AM (6 minutes late). At the end of the month, the company docked a whole hour from my pay! Is this deduction allowed under the CLT rules?",
    focoTecnico: "Article 58 CLT §1º",
    opcoes: [
      "No, the deduction is illegal. The CLT allows a daily variation of up to 10 minutes total (maximum 5 minutes per punch) without any salary deduction or overtime calculation.",
      "Yes, any minute of delay overrides grace limits and allows the company to dock up to 1 full hour as an administrative fee.",
      "The deduction is correct, since the 5-minute limit applies only to departures, while morning clock-ins must be exact to the second."
    ]
  },
  "0.4": {
    titulo: "Overtime Rate (Horas Extras)",
    queixa: "I worked 4 hours of overtime on a normal Tuesday. How is the cost of my overtime calculated? Is there a minimum premium percentage required by the Constitution?",
    focoTecnico: "Art. 7, XVI of CF/88",
    opcoes: [
      "Overtime must pay at least 50% more than the value of your normal working hour. For example, if your normal hour is R$ 10, the overtime hour must cost at least R$ 15.",
      "All normal weekday overtime is paid exactly at the flat rate of your normal working hour (0% premium). Only Sunday work earns a premium.",
      "Overtime always requires a mandatory 100% premium on weekdays, and 200% premium if performed after 6:00 PM."
    ]
  },
  "0.5": {
    titulo: "Paid Weekly Rest (DSR)",
    queixa: "I missed one day of work last week (on Thursday) without showing a doctor's note or any justification. The company docked both the missed Thursday AND my Sunday Rest (DSR) on my payslip. Can they dock my paid Sunday just for 1 day of unexcused absence?",
    focoTecnico: "Article 6 of Law 605/49",
    opcoes: [
      "Yes, the deduction is correct. To earn the paid weekly rest (DSR), the worker must complete their full weekly scheduled hours without unexcused absences.",
      "No. An unexcused absence only allows docking the exact day missed. Docking the Sunday DSR represents double punishment and is forbidden.",
      "DSR can only be docked if the worker misses 3 or more days in the same calendar week."
    ]
  },
  "0.6": {
    titulo: "Minimum Inter-Shift Rest (Interjornada)",
    queixa: "I finished my shift at 11:00 PM on Monday and the manager scheduled me to start again at 07:00 AM on Tuesday (only 8 hours of rest). Does this schedule violate the minimum legal rest interval between shifts?",
    focoTecnico: "Article 66 of the CLT",
    opcoes: [
      "Yes, it violates the law. The CLT establishes a mandatory minimum rest interval of 11 consecutive hours between two working days. The 3 missing hours must be paid as overtime.",
      "The schedule is correct. The legal minimum rest between shifts is only 6 hours, which is the standard rest window for industrial workers.",
      "The 11-hour rule is optional and can be waived by the manager whenever there is high production demand at the factory."
    ]
  },
  "0.7": {
    titulo: "Meal Break (Intrajornada)",
    queixa: "I work 8 hours a day as an assistant. My manager said that, to finish earlier, we will reduce our lunch break to only 15 minutes instead of 1 hour. Is this allowed?",
    focoTecnico: "Article 71 of the CLT",
    opcoes: [
      "No. For any shift exceeding 6 hours, a minimum break of 1 hour for meals/rest is mandatory. Reducing it to 15 minutes is illegal without a proper union agreement.",
      "Yes, reducing lunch is highly encouraged by the CLT for employees who prefer to go home earlier.",
      "The meal break is entirely at the employer's discretion and can be suspended at any time without compensation."
    ]
  },
  "0.8": {
    titulo: "Concept of Employer",
    queixa: "Hello! During my onboarding process, I was asked about the correct legal definition of an employer under the Consolidation of Labor Laws (CLT). Analyze the alternatives below and choose the CORRECT one regarding the concept of 'EMPLOYER' in Brazilian labor law.",
    focoTecnico: "Article 2 of the CLT",
    opcoes: [
      "An employer is considered to be the company, of a collective nature only, which, assuming the risks of the economic activity, admits, pays, and directs the personal provision of service.",
      "An employer is considered to be the company, individual or collective, which, assuming the risks of the economic activity, admits and directs the personal provision of service, independent of salary.",
      "An employer is considered to be the company, individual or collective, which, assuming the risks of the economic activity, admits, pays, and directs the personal provision of service.",
      "An employer is considered to be the company, of a collective nature only, which, assuming the risks of the economic activity, admits and directs the personal provision of service, independent of salary."
    ]
  },
  "1.7": {
    titulo: "10 Minutes Late, 1 Hour Deducted",
    queixa: "Hello! On April 10, I arrived at 08:30 AM instead of 08:20 AM (exceeding the daily tolerance limit by 10 minutes). However, my paycheck shows a deduction of 1 full hour of my salary, plus the DSR! Is this fair?",
    focoTecnico: "Proportionality of Deductions",
    opcoes: [
      "Ignore the complaint, claiming punishment for collective unpunctuality.",
      "Keep the full hour deducted for disciplinary purposes and pedagogical correction of work behavior.",
      "Rectify the payroll entry, deducting exclusively the exact fraction of 10 minutes of delay on the employee's paycheck and reversing the DSR deduction."
    ]
  },
  "1.8": {
    titulo: "Sunday Worked Paid as Normal Day",
    queixa: "Hello, I am Carlos the Valet. I worked 8 hours last Sunday and did not receive any compensatory day off during the week. In my pay, they paid my normal regular hours without any legal premium. Is it true that Sundays are double pay?",
    focoTecnico: "Addition of DSR / Sunday Double Pay",
    opcoes: [
      "Calculate the amount due (8 hours with 100% premium) and rectify the payroll to include a credit for Sunday Overtime 100%.",
      "Inform the mobile shift worker that Sunday is tacitly compensated by an hours bank with a 4-month validity.",
      "Proceed with indirect retirement through agreements negotiated in disadvantageous terms for both parties."
    ]
  },
  "1.9": {
    titulo: "The Night Shift Premium That Turned to Dust",
    queixa: "Hello, I work in the night shift patrol from 10 PM to 5 AM. The HR department calculated my overtime and allowances as 7 common daytime hours, ignoring the reduced night hours. I feel like I'm losing money.",
    focoTecnico: "Calculation of Reduced Night Hours",
    opcoes: [
      "Rectify to calculate the reduced night hour (8 hours counted for every 7 physical hours on the clock) and pay the correct 20% premium on the entirety of the legal base shift.",
      "Explain that the shift is floating and therefore does not encompass nocturnal hour amortizations in urban areas.",
      "Promote a unilateral contract change, converting the night watch into an exclusively daytime shift."
    ]
  },
  "1.10": {
    titulo: "Hours Bank Without Agreement",
    queixa: "I did 12 overtime hours this month under the claim that 'it went into the hours bank'. But I never signed any contract agreeing to this, and our store has no collective agreement with the union. I demand to receive payment!",
    focoTecnico: "Hours Bank Agreement Legality",
    opcoes: [
      "Keep the hours bank under the excuse of using a proprietary internal app without any signed legal basis.",
      "Arrange the calculation and immediate payment of the 12 overtime hours in payroll as H.E. 50% due to the lack of an existing written legal agreement.",
      "Admit arbitrary future day-off compensation at the manager's sole discretion without any monetary reimbursement."
    ]
  },
  "1.11": {
    titulo: "Double Pay for Overdue Vacation",
    queixa: "My vacation has been overdue for 2 years because the company hasn't let me take my 30 days of annual rest. I scheduled it for next month, but my vacation slip doesn't contain any additional payment beyond the normal period. My colleague said I'm entitled to double pay.",
    focoTecnico: "Double Pay for Undrawn Vacation (Art. 137)",
    opcoes: [
      "Rectify the vacation receipt to include the mandatory double vacation pay along with the corresponding 1/3 additional bonus due to the expiration of the concession period.",
      "Inform that double vacation payment is only due if there is an amicable termination via a judicial ruling.",
      "Substitute the financial entitlement with an extra 15 floating off-days during periods of lower corporate demand."
    ]
  },
  "1.12": {
    titulo: "The Hidden Equal Pay Case",
    queixa: "I work side-by-side with Ricardo at Global Logistics, performing the EXACT same tasks of receiving and sorting, in the same department and with the same productivity. I earn R$ 1,980.00 and he has been earning R$ 2,117.91 for months. Why this discrepancy if our roles are identical in practice?",
    focoTecnico: "Equal Pay Compliance (Art. 461 CLT)",
    opcoes: [
      "Explain that Ricardo has more emotional seniority and internal network contacts through a direct reference.",
      "Treat the case as a strong indicator of non-compliance: Notify HR Management about the need for salary equalization to prevent robust judicial labor liabilities.",
      "Instruct Juliano to request a lateral transfer to put an end to his current functional non-conformity."
    ]
  },
  "1.13": {
    titulo: "My Overtime is Calculated Wrong on Saturdays",
    queixa: "I work Monday through Friday, totaling 40 hours of effective labor. The HR department used a divisor of 220 to estimate my mid-month overtime hours, but I do not work on Saturdays! Shouldn't they use the divisor 200?",
    focoTecnico: "Overtime Saturday Divisor Rules",
    opcoes: [
      "Reject the worker's request, explaining that the general divisor of 220 is sovereign and applicable to any employee with Saturdays off or compensated.",
      "Accept the request and change the employee's divisor to 200 in the system, recalculating overtime in a legally correct manner to avoid labor liabilities.",
      "Indicate that Saturdays are administratively deducted as part of automatic proportional annual vacations, keeping the current calculation."
    ]
  },
  "1.14": {
    titulo: "Unused Meal Break (Intrajornada)",
    queixa: "For two consecutive weeks this month, due to the high volume of incoming shipments, my manager asked me to take only 20 minutes for lunch instead of my regular 1 hour break. I didn't see any financial compensation or adjustment on my paycheck.",
    focoTecnico: "Indemnitory Nature of Meal Break",
    opcoes: [
      "Deny any reimbursement because the employee agreed to eat a quick snack at the parcel sorting station.",
      "Inform that fractionated lunches correspond to a full day off agreed upon during the subsequent week.",
      "Rectify the worker's payroll, calculating the suppressed break hours (daily fraction) as an indemnitory meal break with the legal 50% premium."
    ]
  },
  "1.15": {
    titulo: "Resignation During Probationary Contract",
    queixa: "Hello. I was hired under a 90-day experience contract. But I decided to resign yesterday after working exactly 45 days. What is the treatment for my severance pay and is there any legal penalty?",
    focoTecnico: "Prior Severance Clauses on Trial Contracts",
    opcoes: [
      "Explain that the employee is entitled to salary balance, proportional 13th salary, and proportional vacations plus 1/3, but subject to an indemnitory deduction limited to 50% of the remaining contract days (CLT Art. 480).",
      "Explain that resigning from an experience contract fully forfeits the salary balance of the actual days worked.",
      "Agree to convert the request into a mutual separation agreement with a full 30-day indemnified notice bonus."
    ]
  },
  "1.16": {
    titulo: "Medical Certificate Without ICD (CID) — Ethical Dilemma",
    queixa: "I had a gynecological consultation due to severe pain. On my official medical certificate, the doctor did not write the ICD (CID) code to ensure my medical privacy, following medical ethics. The DP team notified me that if I don't deliver it with CID, my two absences will be deducted. Are they correct?",
    focoTecnico: "Valid Certificate Without Disease Code",
    opcoes: [
      "Excuse the absences and validate the medical certificate. Inform the DP clerk that the ICD (CID) is not a mandatory requirement for legal validity.",
      "Reject the document until the employee provides an additional declaration specifying the underlying infectious ICD.",
      "Deny the excuse, logging unjustified absences to curb attendance flurries in the factory."
    ]
  },
  "1.17": {
    titulo: "Dentist's Certificate (CRO) Excuses Absence?",
    queixa: "I needed an emergency wisdom tooth extraction on Monday. The dentist signed my 1-day certificate with his CRO stamp. The DP team said dentist notes only excuse the hours of the procedure, not the whole day. Is this correct?",
    focoTecnico: "Dental Certificate Validity (CRO)",
    opcoes: [
      "Limit the excused absence to only 2 hours for the actual procedure, keeping the rest of the daily shift as a deduction.",
      "Fully excuse the logged absence. A certificate issued by a licensed dentist with an active CRO is legally robust and validates a full-day absence.",
      "Invalidate the document, indicating that only medical certificates issued by the public health network are valid for 24 hours."
    ]
  },
  "1.18": {
    titulo: "Medical Certificate for Child Care",
    queixa: "My 3-year-old daughter had a high fever and vomited yesterday. I had to rush her to the children's emergency room and spent the day there as her companion. I obtained a care certificate signed by the pediatrician. HR refused to excuse my absence, saying the law only covers the worker's own illness.",
    focoTecnico: "Allowance for Dependents' Companions",
    opcoes: [
      "Deduct the hours due to the absence of unrestricted legal backing for secondary family sicknesses.",
      "Explain that accompanying dependents on medical visits has no statutory backing or reference under the CLT.",
      "Validate and excuse the absence, explaining to the employee that Art. 473, XI guarantees the right for 1 day per year, and check if the local union agreement expands this coverage to more days."
    ]
  },
  "1.19": {
    titulo: "Multiple Certificates, Same Doctor, Same ICD",
    queixa: "I presented 3 sequential medical notes of 5 days each under the same back pain diagnoses. The DP division warned me that this last certificate will not be paid by Global Logistics and I will be referred to federal social security (INSS). Is this correct?",
    focoTecnico: "Accrual of Leave and Social Security",
    opcoes: [
      "Explain that the first 15 days of sickness leaf are paid by the company, and starting from the 16th day of the related health history, the employee receives official allowances directly from the INSS following a government medical audit.",
      "Cut off all transportation vouchers and monthly salary as a preventive measure for partial job abandonment.",
      "Ignore the cumulative count, forcing the employee to sign manual lunch break compensation waivers."
    ]
  },
  "1.20": {
    titulo: "Bereavement Leave — Father's Passing",
    queixa: "Unfortunately, my father passed away two weeks ago. I was absent for 2 consecutive days for his funeral and to support my family. I attached the death certificate. The DP department deducted those 2 days, claiming I should have requested leave in advance. I want a adjustment.",
    focoTecnico: "Bereavement Leave Compliance",
    opcoes: [
      "Explain that bereavement requires initiating internal collective agreement clauses for flexible hours compensation.",
      "Proceed with rectification and fully refund the absence deductions. Art. 473, I ensures the employee a guaranteed right of up to 2 consecutive excused days.",
      "State that the bereavement leave cancels the grocery vouchers corresponding to that weekend."
    ]
  },
  "1.21": {
    titulo: "Leave Under 15 Days – Who Pays?",
    queixa: "I got a 4-day medical certificate for chronic gastritis issued by the emergency clinic. The warehouse crew said that for leaves exceeding 3 days, the company can ask me to file directly with the INSS so it doesn't weigh on our logistics unit's internal accounting. Is this correct?",
    focoTecnico: "Employer's Responsibility under 15 Days",
    opcoes: [
      "Explain robustly and politely that the first 15 days of certified medical leave are under the direct financial responsibility of the employer, requiring no prior social security filings.",
      "Guide the employee to schedule an exam at the national social security institute before the 5-day deadline expires.",
      "Exclude employee shuttle meal subsidies of the operational facility during the medical leave period."
    ]
  },
  "1.22": {
    titulo: "Certificate with Non-Existent CRM",
    queixa: "Team, I handed in my 5-day medical certificate signed by the private doctor who visited me at home. I am afraid they want to deduct it because my supervisor said the signature looked suspicious. Everything is active under the law and you have a duty to accept it.",
    focoTecnico: "Submission of Fabricated Document",
    opcoes: [
      "Check the medical registry base. Upon receiving the NON-EXISTENT/FABRICATED CRM report, notify coordinators for immediate Just Cause Termination (Art. 482, 'a').",
      "Excuse the absence normally, assuming an orthographic typo from the issuing doctor.",
      "Only deduct the weekly rest days of the absences without filing any legal complaint for safety."
    ]
  },
  "1.23": {
    titulo: "Third-Party CRM (Name Doesn't Match)",
    queixa: "Hello. I left my 3-day conjunctivitis medical note at the reception. The practitioner gave me the stamped blue slip. I just want to check if the corresponding excused absence has already been logged in my payroll sheets.",
    focoTecnico: "Ideological Falsification of Certificate",
    opcoes: [
      "Search the registry. Having verified the critical divergence of the CRM practitioner, notify the department and assist in executing immediate Just Cause Termination.",
      "Neglect nominal differences considering that doctors cooperate across multiple public clinics.",
      "Suspend the employee preventively from work for 60 days without pay."
    ]
  },
  "1.24": {
    titulo: "Forged Certificate — 1 Day Turned to 3",
    queixa: "Dearest colleagues, I emailed the scan of my medical note showing 3 days of leave. My supervisor questioned whether the original paper was altered. I assert with conviction that the doctor rewrote over it in black pen and I demand my full excused pay.",
    focoTecnico: "Altering a Physical Medical Certificate",
    opcoes: [
      "Rewrite the paycheck, excusing only 1 work day and applying an informal moral warning.",
      "Accept the employee's word without conducting audits with the issuing clinic or hospital.",
      "Inquire protectively with the medical clinic to verify the actual days granted. Once fraud is identified, proceed with immediate Just Cause Termination due to unresolved breach of trust (Art. 482, 'a')."
    ]
  },
  "1.25": {
    titulo: "Suspended CRM Medical Certificate",
    queixa: "I was in poor cardiovascular health and attended a fast clinic in the neighborhood, the doctor prescribed 2 days of absolute rest. I found out they said his CRM registration is suspended. But it's not my fault, I was sick and got care!",
    focoTecnico: "Accounting Invalidity of Document",
    opcoes: [
      "Verify that the CRM is suspended/impeded. Deny the excuses and log them as common unjustified absences. Do not apply Just Cause since the employee was simply a patient of a third party and had no evident fraudulent intent.",
      "Initiate an immediate termination process based on presumed fraud and salary withholding.",
      "Ignore the Regional Medical Council's report, legitimizing the payments of the fortnight."
    ]
  },
  "1.26": {
    titulo: "Attendance Statement vs. Full Day",
    queixa: "I had a scheduled dental consultation in the afternoon. I took an 'Attendance Statement' proving my presence at the clinic from 2:00 PM to 4:30 PM. However, I decided to miss the entire day because the travel would be exhausting. HR wants to deduct the rest of the day from me. Can they do that?",
    focoTecnico: "Limitation of Hours Attendance Certificate",
    opcoes: [
      "Excuse the entire day unconditionally on behalf of the dignity of the ill worker.",
      "Rectify the absences to excuse only the designated period (from 2 PM to 4:30 PM plus reasonable transit), applying a payroll deduction for the remaining unjustified hours of the shift.",
      "State that a declaration of attendance is valid for up to 10 business days of continuous leave."
    ]
  },
  // Phase 3 calculations
  "3.2": {
    titulo: "Commission Worksheets & DSR Calculation",
    queixa: "Employee Lucas gained R$ 1,500.00 in sales commissions this month. He worked all month without missing days (26 working days, and 5 holidays/Sundays). What is the exact value of Lucas' paid weekly rest (DSR) on these commissions that we must record?",
    focoTecnico: "DSR on Commissions",
    opcoes: [
      "R$ 288.46 (Formula: Commissions / Working Days * Sundays = 1500 / 26 * 5)",
      "R$ 150.00 (Flat 10% rate on sales commissions)",
      "Zero, commissions do not generate DSR payments."
    ]
  },
  "3.6": {
    titulo: "Health Sickness Allowance (Auxílio-Doença)",
    queixa: "Our employee Ana Paula submitted a valid doctor's note prescribing 18 days of medical leave. Who is responsible for paying these days? How many days are paid by the employer, and when does the INSS take over?",
    focoTecnico: "Law 8.213/91 Art. 60",
    opcoes: [
      "The employer pays the first 15 days of leave (R$ 1,150.00 base cost). From the 16th day onward, the contract is suspended, and the worker must receive sickness benefits from the government (INSS).",
      "The employer must pay for all 18 days of sickness leave out of pocket, without government help.",
      "The government (INSS) pays for the entire 18 days starting from day 1, leaving zero cost for the company."
    ]
  },
  // Phase -1: Review Simulation (Simulado de Revisão)
  "-1.1": {
    titulo: "Question 1: Elements of the Employment Relationship",
    queixa: "For an employment relationship to be configured, according to Art. 3 of the CLT, it is necessary, cumulatively:",
    focoTecnico: "Article 3 of the CLT",
    opcoes: [
      "a) Subordination, eventuality, onerousness, and legal entity.",
      "b) Pessoalidade (Personality), subordination, onerosidade (onerousness), não eventualidade (habituality), and being an individual person.",
      "c) Personality, autonomy, gratuity, and habituality.",
      "d) Subordination, eventuality, individual person, and fixed salary."
    ],
    gabaritoExplicacao: "Art. 3 of the CLT defines an employee as any individual person who provides services of a non-eventual nature to an employer, under their dependency and for a salary. Requirements: Personality, non-eventuality, onerousness, subordination, and being an individual person."
  },
  "-1.2": {
    titulo: "Question 2: Workday Divisor",
    queixa: "The standard divisor for calculating the normal hourly rate for an employee with a 44-hour workweek is:",
    focoTecnico: "Workday / Shift",
    opcoes: ["a) 200", "b) 180", "c) 220", "d) 240"],
    gabaritoExplicacao: "For a 44-hour workweek, we multiply by 5 monthly weeks (on average, considering rest), resulting in the 220 divisor. (44 / 6 workdays * 30 days = 220)."
  },
  "-1.3": {
    titulo: "Question 3: Danger Premium",
    queixa: "The danger premium (adicional de periculosidade) is due to employees working in risky conditions and corresponds to:",
    focoTecnico: "Salary Premiums",
    opcoes: [
      "a) 20% on the minimum wage.",
      "b) 30% on the base salary.",
      "c) 40% on the normal hour.",
      "d) 50% on the contractual salary."
    ],
    gabaritoExplicacao: "The danger premium is 30% on the employee's base salary, without the additions resulting from bonuses, awards, or profit sharing."
  },
  "-1.4": {
    titulo: "Question 4: Unexcused Absence & DSR",
    queixa: "Regarding unexcused absence, select the correct option:",
    focoTecnico: "Absences and DSR",
    opcoes: [
      "a) The employee loses only the salary for the day of the absence but keeps the DSR.",
      "b) The employee loses the payment for the day of absence and also the DSR for that week.",
      "c) The employee only loses the DSR if they have 3 absences in the same month.",
      "d) Unexcused absence does not generate any financial deduction, only a warning."
    ],
    gabaritoExplicacao: "The employee who is absent without excuse loses the payment for the day of the absence and also the right to the Paid Weekly Rest (DSR) of that week."
  },
  "-1.5": {
    titulo: "Question 5: 13th Salary Deadline",
    queixa: "The deadline for payment of the 1st installment of the 13th salary (gratificação natalina) is:",
    focoTecnico: "13th Salary",
    opcoes: [
      "a) Between February 1st and November 30th.",
      "b) Always in the employee's birthday month.",
      "c) Up to December 20th.",
      "d) At the employer's discretion, at any time of the year."
    ],
    gabaritoExplicacao: "The 1st installment of the 13th salary must be paid between February 1st and November 30th of each year."
  },
  "-1.6": {
    titulo: "Question 6: Young Apprentice FGTS",
    queixa: "The FGTS deposit rate for a Young Apprentice (Jovem Apprentice) contract is:",
    focoTecnico: "Young Apprentice",
    opcoes: ["a) 8%", "b) 11%", "c) 2%", "d) 4%"],
    gabaritoExplicacao: "In the Young Apprentice contract (Law 10.097/2000), the FGTS rate is reduced to 2%."
  },
  "-1.7": {
    titulo: "Question 7: Urban Night Shift Differential",
    queixa: "The night shift premium (adicional noturno) for urban workers corresponds to at least:",
    focoTecnico: "Urban Night Shift",
    opcoes: [
      "a) 10% on the normal hour.",
      "b) 20% on the normal hour.",
      "c) 25% on the normal hour.",
      "d) 50% on the normal hour."
    ],
    gabaritoExplicacao: "For urban workers, the night shift premium is 20% on the value of the daytime hour."
  },
  "-1.8": {
    titulo: "Question 8: INSS Ceiling",
    queixa: "The ceiling (teto) for the contribution salary to the INSS in 2024 is approximately:",
    focoTecnico: "Social Security (INSS)",
    opcoes: ["a) R$ 1,412.00", "b) R$ 5,000.00", "c) R$ 7,786.02", "d) R$ 10,000.00"],
    gabaritoExplicacao: "The INSS ceiling for 2024 is R$ 7,786.02."
  },
  "-1.9": {
    titulo: "Question 9: IRRF Tax Calculation Base",
    queixa: "To calculate the Income Tax (IRRF) base, which of the following is deducted from the gross salary?",
    focoTecnico: "Withholding Tax (IRRF)",
    opcoes: [
      "a) Only the FGTS.",
      "b) The INSS contribution and dependent allowances.",
      "c) Nothing is deducted from the gross salary.",
      "d) Only the union contribution."
    ],
    gabaritoExplicacao: "The calculation base for IRRF is the gross salary minus the INSS contribution and the fixed deduction per dependent."
  },
  "-1.10": {
    titulo: "Question 10: Just Cause and Severance",
    queixa: "In a termination for Just Cause (Justa Causa), the employee is only entitled to receive:",
    focoTecnico: "Just Cause Termination",
    opcoes: [
      "a) Salary balance and overdue vacations + 1/3.",
      "b) Salary balance, 13th salary, and vacations.",
      "c) Only the 40% FGTS fine.",
      "d) Nothing, all rights are forfeited."
    ],
    gabaritoExplicacao: "In Just Cause, the employee only receives the salary balance (days worked) and any overdue vacations + 1/3 (if they have completed a full year). They lose 13th salary, proportional vacations, and the right to FGTS withdrawal/fine."
  },
  "-1.11": {
    titulo: "Question 11: Internship Act Compliance",
    queixa: "The Internship Law (Law 11.788/08) establishes that the internship relationship:",
    focoTecnico: "Internship Law",
    opcoes: [
      "a) Creates an employment relationship (vínculo de emprego) automatically.",
      "b) Does NOT create an employment relationship with the granting company.",
      "c) Requires the payment of the 40% FGTS fine.",
      "d) Gives the right to unemployment insurance."
    ],
    gabaritoExplicacao: "Art. 3 of Law 11.788/2008 expressly states that the internship does not create an employment relationship of any nature between the student and the granting company."
  },
  "-1.12": {
    titulo: "Question 12: Interns and 13th Salary",
    queixa: "According to Law 11.788/08, is the intern entitled to the 13th salary (gratificação natalina)?",
    focoTecnico: "Internship Rights",
    opcoes: [
      "a) Yes, after 6 months of internship.",
      "b) No, the law does not provide for 13th salary for interns, only a paid recess.",
      "c) Yes, but only 50% of the value.",
      "d) Only if the internship is non-mandatory."
    ],
    gabaritoExplicacao: "The Internship Law does not provide for the 13th salary. It only guarantees a paid recess of 30 days for every 1 year of internship (or proportional)."
  },
  "-1.13": {
    titulo: "Question 13: Transportation Voucher Deduction",
    queixa: "The maximum percentage that the employer can deduct from the employee's base salary for providing Vale-Transporte is:",
    focoTecnico: "Transportation Voucher",
    opcoes: ["a) 3%", "b) 10%", "c) 6%", "d) 8%"],
    gabaritoExplicacao: "According to Law 7.418/85, the employer can deduct up to 6% of the employee's base salary for the Vale-Transporte cost."
  },
  "-1.14": {
    titulo: "Question 14: Importance of CBO",
    queixa: "What is the primary function of the CBO (Brazilian Classification of Occupations) in the employment contract?",
    focoTecnico: "Job Classification (CBO)",
    opcoes: [
      "a) Defining the employee's monthly salary.",
      "b) Identifying and standardizing the occupation for administrative and statistical purposes.",
      "c) Replacing the job description in the contract.",
      "d) Calculating the amount of Income Tax."
    ],
    gabaritoExplicacao: "The CBO identifies and standardizes occupations in the labor market, being mandatory for registration in the Work Booklet (CTPS) and e-Social."
  },
  "-1.15": {
    titulo: "Question 15: Just Cause Requirements",
    queixa: "For the application of Just Cause, the employer must respect the principle of:",
    focoTecnico: "Labor Law Principles",
    opcoes: [
      "a) Optionality (it can be applied whenever desired).",
      "b) Immediacy (applying the penalty as soon as the fault is known).",
      "c) Retroactivity (punishing old facts).",
      "d) Uncertainty (not explaining the reason)."
    ],
    gabaritoExplicacao: "The application of Just Cause requires Immediacy, Proportionality, and the absence of Double Punishment (Non bis in idem)."
  },
  "-1.16": {
    titulo: "Question 16: Double Vacation Pay",
    queixa: "Vacations paid 'in double' (férias em dobro) occur when:",
    focoTecnico: "Vacation Compliance",
    opcoes: [
      "a) The employee works during vacations.",
      "b) The employer grants vacations after the concessive period has ended.",
      "c) The employee resigns before taking vacations.",
      "d) The employee has more than 5 absences."
    ],
    gabaritoExplicacao: "If the employer fails to grant vacations within the 12 months following the acquisition period, they must pay them in double (Art. 137 CLT)."
  },
  "-1.17": {
    titulo: "Question 17: INSS Calculation",
    queixa: "The INSS contribution of the employee is calculated based on:",
    focoTecnico: "Social Security Taxes",
    opcoes: [
      "a) Fixed progressive rates on the contribution salary.",
      "b) A single 20% rate for everyone.",
      "c) Only on the minimum wage.",
      "d) Only on the net salary."
    ],
    gabaritoExplicacao: "INSS uses progressive rates (7.5%, 9%, 12%, 14%) applied to each salary bracket, up to the social security ceiling."
  },
  "-1.18": {
    titulo: "Question 18: FGTS and Just Cause",
    queixa: "In a termination for Just Cause, what happens to the FGTS account?",
    focoTecnico: "FGTS Rules",
    opcoes: [
      "a) The employee can withdraw the balance and receive a 40% fine.",
      "b) The employee CANNOT withdraw the balance and does not receive the 40% fine.",
      "c) The balance is returned to the employer.",
      "d) The government confiscates the balance."
    ],
    gabaritoExplicacao: "In Just Cause, the right to withdraw the FGTS and the 40% fine are forfeited by the employee."
  },
  "-1.19": {
    titulo: "Question 19: Intern Working Hours",
    queixa: "The maximum daily working hours for an intern in higher education is:",
    focoTecnico: "Internship Hours",
    opcoes: ["a) 4 hours", "b) 8 hours", "c) 6 hours", "d) 10 hours"],
    gabaritoExplicacao: "For students in higher education or secondary vocational education, the daily limit is 6 hours (30 hours weekly)."
  },
  "-1.20": {
    titulo: "Question 20: Reduced Night Hour Conversion",
    queixa: "In urban night work, 52 minutes and 30 seconds are counted as:",
    focoTecnico: "Night Shift Rules",
    opcoes: ["a) 1 full hour (60 minutes).", "b) 45 minutes.", "c) 30 minutes.", "d) 50 minutes."],
    gabaritoExplicacao: "According to Art. 73, §1º of the CLT, the urban night hour is reduced: 52 minutes and 30 seconds correspond to 1 legal hour."
  }
};

export function t(key: string, lang: "pt" | "en"): string {
  if (lang === "en" && UI_TRANSLATIONS[key]) {
    return UI_TRANSLATIONS[key].en;
  }
  if (UI_TRANSLATIONS[key]) {
    return UI_TRANSLATIONS[key].pt;
  }
  return key;
}

export function translateModuleName(id: number, name: string, lang: "pt" | "en"): string {
  if (lang === "pt") return name;
  const translations: Record<number, string> = {
    0: "Enrollment & Onboarding (ADM)",
    1: "Screening & Alignment",
    2: "CLT Compliance & Audits",
    3: "FGTS Fund Approvals (FGTS)",
    4: "Special Contracts (CES)",
    5: "Termination & Severance (RES)",
    6: "CBO & Compliance Opinions (PAR)",
    7: "Strategy & Placement (EST)"
  };
  return translations[id] || name;
}

export const ALL_CHALLENGE_TITLES_EN: Record<string, string> = {
  // Fase -1: Simulado de Revisão
  "-1.1": "Question 1: Elements of the Employment Relationship",
  "-1.2": "Question 2: Workday Divisor",
  "-1.3": "Question 3: Danger Premium / Hazard Pay",
  "-1.4": "Question 4: Unexcused Absence & DSR",
  "-1.5": "Question 5: 13th Salary Deadline",
  "-1.6": "Question 6: Apprentice FGTS",
  "-1.7": "Question 7: Urban Night Shift Differential",
  "-1.8": "Question 8: 2024 INSS Ceiling",
  "-1.9": "Question 9: IRRF Tax Calculation Base",
  "-1.10": "Question 10: Just Cause and Severance Payments",
  "-1.11": "Question 11: Internship Act Compliance",
  "-1.12": "Question 12: Interns and 13th Salary Rights",
  "-1.13": "Question 13: Transportation Voucher Deduction Limit",
  "-1.14": "Question 14: Importance of CBO",
  "-1.15": "Question 15: Just Cause Requirements",
  "-1.16": "Question 16: Double Vacation Pay",
  "-1.17": "Question 17: INSS Calculation",
  "-1.18": "Question 18: FGTS and Just Cause",
  "-1.19": "Question 19: Intern Working Hours",
  "-1.20": "Question 20: Reduced Night Hour Conversion",
  "-1.21": "Question 21: Reduced Night Hour Duration",
  "-1.22": "Question 22: Fictional Hour Benefit",
  "-1.23": "Question 23: Real Night Pay Calculation",
  "-1.24": "Question 24: Urban Night Labor Rules",
  "-1.25": "Question 25: TST Precedent 60 (Súmula 60)",
  "-1.26": "Question 26: Forfeited Rights in Just Cause",
  "-1.27": "Question 27: Criteria for Just Cause",
  "-1.28": "Question 28: Nature of Article 482",
  "-1.29": "Question 29: Concept of Immediacy",
  "-1.30": "Question 30: Burden of Proof",
  "-1.31": "Question 31: Divisor Formula",
  "-1.32": "Question 32: Divisor 220 Basis",
  "-1.33": "Question 33: Divisor for 40h workweek",
  "-1.34": "Question 34: TST Precedent 431 (Súmula 431)",
  "-1.35": "Question 35: Divisor for 36h workweek",
  "-1.36": "Question 36: Divisor for 30h workweek",
  "-1.37": "Question 37: Divisor for 42h workweek",
  "-1.38": "Question 38: Divisor for 24h workweek",
  "-1.39": "Question 39: Origin of the 220 Divisor",
  "-1.40": "Question 40: Bank Worker 40h Divisor",
  "-1.41": "Question 41: Hourly Rate Calculation for 36h",
  "-1.42": "Question 42: Hourly Rate Calculation for 30h",
  "-1.43": "Question 43: Impact of Precedent 431",
  "-1.44": "Question 44: Just Cause Scenarios",
  "-1.45": "Question 45: Improbity",
  "-1.46": "Question 46: Incontinence of Conduct",
  "-1.47": "Question 47: Habitual Commercial Trade",
  "-1.48": "Question 48: Criminal Conviction",
  "-1.49": "Question 49: Slothfulness / Desídia",
  "-1.50": "Question 50: Inebriation / Drunkenness",
  "-1.51": "Question 51: Violation of Corporate Secrecy",
  "-1.52": "Question 52: Indiscipline vs Insubordination",
  "-1.53": "Question 53: Job Abandonment",
  "-1.54": "Question 54: Honor and Physical Offenses",
  "-1.55": "Question 55: Gambling Games",

  // Fase 0
  "0.1": "The Elements of the Employment Relationship",
  "0.2": "Hiring and the Nature of FGTS",
  "0.3": "Clock-In Grace Period",
  "0.4": "Overtime Rate (Horas Extras)",
  "0.5": "Paid Weekly Rest (DSR)",
  "0.6": "Minimum Inter-Shift Rest (Interjornada)",
  "0.7": "Meal Break (Intrajornada)",
  "0.8": "Concept of Employer",

  // Fase 1
  "1.1": "The Deduction That Shouldn't Be There",
  "1.2": "My Overtime Disappeared",
  "1.3": "My Transportation Voucher is Wrong",
  "1.4": "Day Off Swapped Without Paperwork",
  "1.5": "Family Allowance Not Received",
  "1.6": "Uniform Deduction on Paycheck",
  "1.7": "10 Minutes Late, 1 Hour Deducted",
  "1.8": "Sunday Worked Paid as Normal Day",
  "1.9": "Night Shift Premium Turned to Dust",
  "1.10": "Hours Bank Without Agreement",
  "1.11": "Double Pay for Overdue Vacation",
  "1.12": "The Hidden Equal Pay Case",
  "1.13": "Overtime Computation Wrong on Saturday",
  "1.14": "Unused Meal Break (Intrajornada)",
  "1.15": "Resignation During Probationary Contract",
  "1.16": "Medical Certificate Without ICD — Ethical Dilemma",
  "1.17": "Dentist's Certificate (CRO) Excuses Absence?",
  "1.18": "Medical Certificate for Child Care",
  "1.19": "Multiple Certificates, Same Doctor, Same ICD",
  "1.20": "Bereavement Leave — Father's Passing",
  "1.21": "Leave Under 15 Days – Who Pays?",
  "1.22": "Certificate with Non-Existent CRM",
  "1.23": "Third-Party CRM (Name Doesn't Match)",
  "1.24": "Forged Certificate — 1 Day Turned to 3",
  "1.25": "Suspended CRM Medical Certificate",
  "1.26": "Attendance Statement vs. Full Day",

  // Fase 2 (FGTS)
  "FGTS-001": "Unjustified Dismissal Analysis",
  "FGTS-002": "Employee Resignation Request",
  "FGTS-003": "Experience Contract Ended",
  "FGTS-004": "Dismissal with Just Cause (Improbity)",
  "FGTS-005": "Retirement After Long Tenure",
  "FGTS-006": "Consensual Termination (Mutual Agreement)",
  "FGTS-007": "Severe Disease in the Family",

  // Fase 3
  "3.1": "RES-001 — Admissional Compliance Check",
  "3.2": "RES-002 — Fernanda Costa: Administrative Assistant",
  "3.3": "RES-003 — Ricardo Alves: Watchman with Hazard Pay & Absences",
  "3.4": "RES-004 — Compliance Check Second Round",
  "3.5": "RES-005 — Mário César: Electrician with High Overtime",
  "3.6": "RES-006 — Tânia Regina: Veterinary Assistant with Heavy Absences",
  "3.7": "RES-007 — Sérgio Nascimento: Logistics Assistant Night Shift",
  "3.8": "RES-008 — Lúcia Helena: Cleaner with Maximum Health Hazard Premium",
  "3.9": "RES-009 — Fábio Mendes: Clerk with High Commissions",
  "3.10": "RES-010 — Ana Clara: Refueler with Crisis Paycheck Audit",

  // Fase 4
  "4.1": "Grave Case: Harassment and Bereavement vs. Directive Power",
  "4.2": "Stagiary Contract Compliance Rules (Lei 11.788)",
  "4.3": "Intermittent Contract Call Compliance (CLT)",

  // Fase 5
  "5.1": "RES-001 — Filipe Santos: Layoff Without Just Cause",
  "5.2": "RES-002 — Mariana Costa: Terminated for Just Cause",
  "5.3": "RES-003 — Roberto Andrade: Request for Indirect Resignation",
  "5.4": "RES-004 — Ana Júlia: Termination by Mutual Agreement",
  "5.5": "RES-005 — Carlos Eduardo: Employee Resignation Request",
  "5.6": "RES-006 — Beatriz Nogueira: Termination by Reciprocal Fault",
};

export const ALL_TECHNICAL_FOCUSES_EN: Record<string, string> = {
  "Artigo 3º CLT": "Article 3 of the CLT Rules",
  "Apurar FGTS Mensal": "FGTS Monthly Calculation",
  "Artigo 58 CLT §1º": "Article 58 CLT § 1 - Grace Periods",
  "Falta Justificada com Atestado Válido": "Excused Absence with Valid Medical Certificate",
  "Apurador de Holerite": "Paycheck / Payroll Auditor",
  "Desconto Limite VT": "Transportation Voucher Deductions Limit",
  "Compensação de Folgas": "Day Off Compensation",
  "Acesso ao Benefício Legal": "Access to Legal Benefit",
  "Gratuidade do EPI": "EPI Cost Relief",
  "Tolerância Ponto": "Time Clock Grace Period",
  "Remuneração Domingo": "Sunday Pay & DSR Premium",
  "Adicional Noturno": "Night Shift Differential",
  "Compensação de Horas": "Overtime Compensation",
  "Férias em Dobro": "Double Pay for Overdue Vacation",
  "Equiparação Salarial": "Equal Pay Compliance",
  "Apurar Horas Extras": "Overtime Hour Computation",
  "Intervalo Intrajornada": "Meal Break Compliance",
  "Atestado de CRO": "Dentist Certificate Validity",
  "Acompanhamento de Filho": "Absence for Child Care",
  "Série de Atestados": "Consecutive Medical Certificates",
  "Licença Nojo": "Bereavement Leave",
  "Responsabilidade de Pagamento": "Payment Liability for Leave",
  "CRM Inexistente": "Invalid Medical Board Registration",
  "Fraude de Fatos": "Fabricated Document Check",
  "Atestado Rasurado": "Altered Certificate Audit",
  "CRM Suspenso": "Suspended Medical Registration",
  "Declaração de Horas": "Attendance Statement Hours Deductions",
  "Artigo 20, I da Lei 8.036/90": "Article 20, I of Law 8.036/90",
  "Artigo 20 da Lei 8.036/90": "Article 20 of Law 8.036/90",
  "Artigo 20, IX da Lei 8.036/90": "Article 20, IX of Law 8.036/90",
  "Artigo 20, VIII da Lei 8.036/90": "Article 20, VIII of Law 8.036/90",
  "Artigo 20, XV da Lei 8.036/90": "Article 20, XV of Law 8.036/90",
  "Direitos na Dispensa Sem Justa Causa (CLT)": "Severance Rights Without Just Cause",
  "Punição e Perda de Verbas Rescisórias (Art. 482 CLT)": "Just Cause Severance Forfeiture (Art. 482 CLT)",
  "Rescisão Indireta por Descumprimento Patronal": "Indirect Resignation for Employer Default",
  "Rescisão por Acordo Comum (Art. 484-A CLT)": "Mutual Agreement Termination (Art. 484-A CLT)",
  "Direitos no Pedido de Demissão (CLT)": "Rights in Resignation (CLT)",
  "Culpa Recíproca e Redução de Indenização": "Reciprocal Fault and Reduced Indemnity",
  "Direito à Dignidade e Limites do Poder Diretivo": "Right to Dignity & Boundaries of Directive Power",
  "Lei nº 11.788/2008 (Lei do Estágio)": "Estágio Contract Compliance Rules",
  "Artigo 452-A da CLT (Reforma Trabalhista)": "Intermittent Contract Work Rules",
};

export const ALL_CHALLENGE_QUEIXAS_EN: Record<string, string> = {
  // Phase 1 (selected ones)
  "1.1": "I went to the clinic with lower back pain. I properly handed in my 1-day medical certificate to the HR office the next day. However, they deducted R$ 70.60 as an unjustified absence and another R$ 70.60 for DSR on my paycheck! Can you help me?",
  "1.2": "Hi, I reviewed my paycheck this month. I did 5 hours of overtime and thought they didn't pay me because I didn't see the line named 'Overtime 50%'. There is a line called 'Overtime Reflex on DSR', and I'm worried I was treated unfairly.",
  "1.3": "Dear portal team, I got my paychecks this month and saw they deducted R$ 144.00 for Vale-Transporte. But my salary is R$ 1,800.00! That's 8% of my salary! They are overcharging me, right?",
  "1.4": "I agreed verbally with my shift supervisor to work on my scheduled Sunday shift and take a day off the following Tuesday. But HR registered an unjustified absence on Sunday! I talked to my boss and he told me to resolve it with you.",
  "1.5": "I have 2 children (4 and 6 years old), and I handed in their birth certificates at the time of hiring. My base salary is R$ 1,710.00, but I have never received the Family Allowance (Salário-Família) shares. Money is tight and I need this support.",
  "1.6": "Hello. I started this month as a mechanic, they gave me steel-toed boots, safety glasses, and overalls. But they deducted R$ 150.00 on my paycheck under the code 'Safety and Uniform'. Is this correct?",
  "1.7": "I arrived 10 minutes late on a Monday morning because the subway was delayed. On my monthly payslip, the company docked 1 whole hour of my work as an administrative penalty! Is this allowed under the CLT?",
  "1.8": "I worked on my rostered Sunday shift last week. At the end of the month, I was paid normal hours without any additional rate. Since Sunday is a rest day, shouldn't it have been paid at 100% plus my DSR?",
  "1.9": "I work in the warehouse night shift from 10 PM to 6 AM. This month my night premium (adicional noturno) was missing from my paycheck. The coordinator claimed that since my productivity was lower, the company didn't owe me the premium.",
  "1.10": "The company scheduled me to work 2 hours of overtime every day this month. When I asked for the payment, they said it was all posted to a 'Hours Bank' to be used next year. But I never signed any agreement for a hours bank!",
  "1.11": "My 30-day vacation expired 14 months ago and I still haven't been allowed to take it. The manager says they are understaffed. Under Brazilian law, is there a penalty for overdue vacation?",
  "1.12": "I do the exact same work as my colleague, with the exact same productivity. We started together, but she earns 25% more than me. There's no job classification system here. Is this wage disparity legal?",
  "1.13": "I worked 4 hours on Saturday. The payroll deducted 1 hour as an absence because Saturday is a 4-hour shift, and they claimed the DSR is docked because of it. Can they dock my DSR if I worked on Saturday?",
  "1.14": "I work 8 hours daily. My manager scheduled only a 15-minute lunch break so we can leave earlier. I would prefer to have my full 1 hour. Can this meal break (intrajornada) be reduced to 15 minutes?",
  "1.15": "I was hired under a 90-day experience contract. After 45 days, I found a better job and resigned. Can I leave immediately without paying any fine, or will the company deduct a penalty?",
  "1.16": "I submitted a doctor's certificate for 2 days of sickness leave, but the HR team rejected it because the doctor didn't write the ICD (CID) code on the note. Is the doctor's certificate invalid without the ICD?",
  "1.17": "I had a wisdom tooth extraction and submitted a valid dentist's certificate (CRO) for 2 days of rest. The HR clerk said dental notes only excuse the hours of the appointment and not full days. Is this correct?",
  "1.18": "My 5-year-old son was hospitalized with severe flu. I had to stay with him at the hospital all day and missed work. I submitted the medical note confirming I accompanied him. Can the company dock my day?",
  "1.19": "I had a flu and missed 5 days, then returned, and two days later I got sick again with the same flu and missed another 12 days. Does the company pay the entire period, or does INSS take over because it exceeds 15 days total?",
  "1.20": "My father passed away last week. I missed 3 consecutive work days to organize the funeral and console my family. The company docked 1 day, claiming the CLT only allows 2 days of bereavement leave. What is the rule?",
  "1.21": "I got a medical certificate for 10 days of leave due to a fracture. The manager says the company will deduct these 10 days from my base salary and that the INSS should reimburse me. Is this correct?",
  "1.22": "I suspect an employee submitted a fake medical certificate. The doctor's name is on it, but when I searched the CRM database, the registry number was non-existent. What is the legally correct action?",
  "1.23": "I received a medical certificate with CRM 12345 in the name of 'Dr. Marcos'. But when querying CRM 12345, the registered practitioner is 'Dr. Julia'. How should the HR office process this?",
  "1.24": "An employee submitted a medical certificate for a 1-day absence. However, upon checking the doc, the number 1 was clearly erased and changed to 3. What is the legally correct corporate response?",
  "1.25": "An employee got a medical statement from a clinics and stayed away. Upon audit, we found this doctor's CRM is currently suspended by the Regional Medical Council. Should we accept this certificate?",
  "1.26": "I had a dentist appointment at 2 PM. I submitted an attendance statement showing I was there from 2 PM to 4:30 PM. The supervisor docked my entire day's salary. Can they do this?",

  // Phase 2 (FGTS)
  "FGTS-001": "Carlos worked for 3 years and 2 months. On May 20, he was let go due to corporate restructuring without just cause. Carlos received his TRCT with all severance items. He is now at the bank asking to withdraw his FGTS balance.",
  "FGTS-002": "Fernanda worked 1 year and 8 months. She got a better offer and manually submitted her resignation letter. She completed her 30-day notice and left. She is now at the bank trying to withdraw her FGTS for a downpayment.",
  "FGTS-003": "Roberto's 90-day experience contract ended. The company decided not to hire him permanently due to low business demand. He turned up at HR to process his papers and wants to know if he can withdraw his FGTS.",
  "FGTS-004": "Rodrigo was fired with Just Cause due to documented theft in the company warehouse. He is now asking the HR office for the FGTS withdrawal authorization code. Is his withdrawal right guaranteed?",
  "FGTS-005": "Mrs. Lúcia, 62 years old, retired officially under the INSS rules after decades of labor. She wants to know if she can withdraw her historical FGTS balance from all her accounts.",
  "FGTS-006": "Beatriz and the employer signed a mutual consensus termination (Art. 484-A CLT). She wants to know if she can withdraw her FGTS, and if so, what percentage of the total balance is available for withdrawal.",
  "FGTS-007": "Juliana's 8-year-old child was diagnosed with a severe cancer. She submitted medical reports to the HR department requesting an immediate authorization code to withdraw her FGTS balance to cover clinical costs.",

  // Phase 3
  "3.1": "Review safety items and trace historical audits with the payroll team.",
  "3.2": "Audit Fernanda Costa's TRCT: Administrative Assistant with 1 year of tenure, laid off without just cause. No special overtime, bonuses or absences. Check if base salary and standard proportional severances conform.",
  "3.3": "Audit Ricardo Alves' TRCT: Watchman entitled to a 30% risk premium (Periculosidade). The employee was dismissed without just cause, having missed 3 days of work during the month. Audit the deductions and net balance.",
  "3.4": "Examine overall time logs and address unresolved entries.",
  "3.5": "Audit Mário César's TRCT: Electrician who worked 25 overtime hours on weekdays (50% premium) and 8 hours on Sunday (100% premium). Discharged without just cause. Ensure the overtime reflections on DSR and base are correct.",
  "3.6": "Audit Tânia Regina's TRCT: Veterinary Assistant. She was absent for half of the month without justification. Fired without just cause. Calculate the massive absence deductions on salary, proportional vacations and 13th salary.",
  "3.7": "Audit Sérgio Nascimento's TRCT: Logistics Assistant who worked night shifts and received a 20% night shift premium (adicional noturno). Dismissed without just cause. Audit the night premium propagation over his severances.",
  "3.8": "Audit Lúcia Helena's TRCT: Cleaner entitled to a 40% maximum health hazard premium (Insalubridade) calculated on the minimum wage. Laid off without just cause. Verify if the hazard premium is correctly paid.",
  "3.9": "Audit Fábio Mendes' TRCT: Sales Clerk who earned R$ 2,500 in base salary plus R$ 3,200 in monthly commissions. Discharged with unexcused weekly absences. Monitor how commissions and weekly absences influence the DSR.",
  "3.10": "Audit Ana Clara's TRCT: Refueler working during high company crisis. Terminated in mutual common agreement (Art. 484-A CLT). Check if proportional vacation, 13th salary and FGTS fine are strictly halved.",

  // Phase 4
  "4.1": "Dear compliance and HR team, I am suffering from ongoing workplace harassment and verbal abuse by my direct manager, who pressures us by shouting and threatening lay-offs in public. To make matters worse, after my mother passed away, I was away under statutory bereavement leave (Art. 473, I of CLT) and medical certificates for anxiety/depression. Upon my return, the manager humiliated me in front of everyone, saying I am unproductive. The Labor Judge just ruled this case as vertical descending moral harassment and failure of the employer to monitor health, resulting in a R$ 20,000 moral damages fine. Given this severe court ruling, what is the immediate and legally correct course of action our company must take against the manager and in relation to the grieving victim?",
  "4.2": "Hello, I am an intern and they asked me to work 2 overtime hours daily to cover the high demand of the payroll closure and said they would pay me under-the-table. In addition, they said I am not entitled to paid recess (vacation) because my internship contract is only 6 months. Is this correct?",
  "4.3": "Hi! I am hired as an intermittent employee. The company called me via WhatsApp with 12 hours notice to work the next day. I accepted, but due to force majeure I was unable to attend. The company now wants to charge me a 50% fine on the amount I would receive for the shift. Is this legal?",

  // Phase 5
  "5.1": "Filipe Santos, Process Engineer, was dismissed without just cause due to market reasons. Audit the contract and select which severance benefits (verbas rescisórias) he is legally entitled to receive in his TRCT.",
  "5.2": "Mariana Costa, Warehouse Assistant, committed severe corporate theft and was terminated with Just Cause under Art. 482 of CLT. Select which rights remain valid for her to collect on her final paycheck.",
  "5.3": "Roberto Andrade, Forklift Operator, requests Indirect Resignation (Rescisão Indireta) due to severe employer non-compliance (missing payroll for 3 months and lack of PPE). What are his legal severance rights?",
  "5.4": "Ana Júlia and the company agreed to terminate the contract by mutual common agreement under Art. 484-A of CLT. Select which severance verbas are paid in full and which are reduced/halved.",
  "5.5": "Carlos Eduardo, Administrative Assistant, proactively resigned (Pedido de Demissão) to work elsewhere. Select which severance verbas are guaranteed and which are forfeited.",
  "5.6": "Beatriz Nogueira's contract was terminated by Reciprocal Fault (Culpa Recíproca - Art. 484 of CLT) declared by a Labor Court. Select which severances are paid in full and which are halved.",
};

export function translateTextToEnglish(text: string): string {
  if (!text) return "";
  let translated = text;

  // Exact Match translations for common options & validations across scenarios
  const replacements: [RegExp, string][] = [
    // Phase 1 Option translations
    [/Orientar o funcionário a ver no holerite e localizar a rubrica principal de HE 50% \(código 104\), explicando que o DSR é apenas o reflexo sobre os descansos remunerados\./g,
     "Instruct the employee to look at the paycheck and locate the main H.E. Diurnas 50% (code 104) rubric, explaining that DSR is just the proportional reflex on paid weekly rest."],
    [/Proceder com alteração imediata: admitir erro de lançamento e reembolsar em dobro para evitar processo trabalhista\./g,
     "Adjust immediately: admit launch error and refund double on paycheck to avoid a labor lawsuit."],
    [/Informar que a jornada flutuante absorve as horas extras em regime de compensação compulsória de banco de horas semanal\./g,
     "Inform that the floating shift absorbs overtime in a weekly compulsory hours bank compensation regime."],
    [/Dizer que o vale transporte passou por aumento integral devido à taxa do sistema regional de ônibus, ultrapassando os limites previstos\./g,
     "Say that the transportation voucher underwent a full increase due to local bus rates, exceeding the statutory limits."],
    [/Retificar o desconto para R\$ 108,00 \(Exatidão dos 6% legais limites\) e proceder com a restituição dos R\$ 36,00 lançados erroneamente\./g,
     "Rectify the deduction to R$ 108.00 (exactly the 6% statutory limit) and proceed with the refund of the R$ 36.00 drafted incorrectly."],
    [/Abonar o auxílio na íntegra para diminuir a carga tributária do trabalhador por meio de bonificação interna\./g,
     "Excuse/grant the aid in full to decrease the worker's tax burden through an internal bonus."],
    [/Punir o funcionário por fazer arranjos sem avisar formalmente aos canais do e-Social, retendo o desconto\./g,
     "Punish the employee for making verbal agreements without formally notifying e-Social, retaining the deduction."],
    [/Ignorar o pedido por falta de acordo coletivo sindical da categoria profissional\./g,
     "Ignore the request due to the absence of a labor union collective bargaining agreement."],
    [/Requerer ao supervisor a assinatura urgente do formulário de justificativa ou compensação interna, estornando temporariamente o desconto indevido de falta\./g,
     "Request the supervisor's urgent signature on the justification or internal compensation form, temporarily reversing the undue absence deduction."],
    [/Verificar documentação entregue e retificar a folha de pagamentos imediatamente para lançar as 2 cotas vigentes do benefício governamental\./g,
     "Verify the submitted documentation and rectify the payroll immediately to record the 2 active shares of the government benefit."],
    [/Explicar que o salário excede o teto previdenciário, retirando-lhe legalmente o direito às cotas públicas\./g,
     "Explain that the salary exceeds the social security ceiling, legally stripping the right to public shares."],
    [/Injetar apenas um vale-alimentação avulso de emergência sem registro contábil de encargos fiscais\./g,
     "Inject only an emergency grocery voucher with no accounting records or fiscal charges."],
    [/Manter o desconto pois o profissional é proprietário perpétuo daquela fiação têxtil sob termo de entrega\./g,
     "Keep the deduction because the professional has perpetual ownership of that equipment once hand receipt is signed."],
    [/Retificar o desconto para R\$ 0,00, efetuando o estorno integral dos R\$ 150,00 lançados indevidamente sobre as ferramentas gratuitas/g,
     "Rectify the deduction to R$ 0.00, triggering a full refund of the R$ 150.00 wrongly deducted for free occupational tools."],
    [/Orientar que a empresa desconta apenas depreciação média do fardamento sem lucro comercial na folha\./g,
     "Explain that the company only deducts the average depreciation of the uniforms with no profit markup on payroll."],
    
    // Checkboxes Feedback translations for Phase 5 / 3
    [/Sua marcação de verbas rescisórias está perfeitamente em conformidade legal!/g,
     "Your selection of severance items is in perfect compliance with Brazilian labor law!"],
    [/Sua marcação de verbas rescisórias está incorreta! Algumas verbas que você indicou são indevidas para este tipo de desligamento, ou você deixou de atribuir um direito legítimo do trabalhador\./g,
     "Your selection of severance items is incorrect! Some items you indicated are not due, or you failed to assign a legitimate worker right. Analyze current CLT regulations and try again."],
    [/Sua auditoria de verbas rescisórias obteve homologação total perante a fiscalização do trabalho!/g,
     "Your compliance check of final severance has successfully matched all labor standards!"],
    [/Você homologou verbas indevidas ou suprimiu direitos líquidos do trabalhador, gerando inconformidade fiscal!/g,
     "You assigned unapproved terms or suppressed legitimate rights, triggering compliance failures."],
  ];

  for (const [reg, rep] of replacements) {
    translated = translated.replace(reg, rep);
  }

  // General dictionary replacement of labor law terms
  const terms: [string, string][] = [
    ["Questão ", "Question "],
    ["Questao ", "Question "],
    ["divisor padrão", "standard divisor"],
    ["divisor de jornada", "workday divisor"],
    ["divisor geral", "general divisor"],
    ["é necessário", "is required"],
    ["não se aplica", "does not apply"],
    ["corresponde a", "corresponds to"],
    ["assinale a opção", "select the option"],
    ["qual o ", "what is the "],
    ["com base na", "based on the"],
    ["segundo a", "according to the"],
    ["de acordo com", "according to"],
    ["nos termos do", "under the terms of"],
    ["conforme o", "as per the"],
    ["Artigo ", "Article "],
    ["Art. ", "Art. "],
    ["Lei ", "Law "],
    ["Lei nº ", "Law No. "],
    ["Súmula ", "Precedent / Súmula "],
    ["jornada de trabalho", "workday / work shift"],
    ["adicional de periculosidade", "danger premium (periculosidade)"],
    ["adicional de insalubridade", "health hazard premium (insalubridade)"],
    ["sobre o salário-base", "on base salary"],
    ["sobre o salário mínimo", "on minimum wage"],
    ["falta injustificada", "unexcused absence"],
    ["faltas injustificadas", "unexcused absences"],
    ["perde a remuneração", "forfeits payment"],
    ["DSR daquela semana", "DSR of that week"],
    ["prazo para pagamento", "payment deadline"],
    ["1ª parcela", "1st installment"],
    ["2ª parcela", "2nd installment"],
    ["jovem aprendiz", "young apprentice"],
    ["alíquota do FGTS", "FGTS rate"],
    ["trabalho prestado entre", "work performed between"],
    ["tabela do INSS", "INSS table"],
    ["teto do salário de contribuição", "contribution salary ceiling"],
    ["alíquotas do INSS", "INSS rates"],
    ["base de cálculo", "calculation base"],
    ["Imposto de Renda", "Income Tax"],
    ["IRRF", "IRRF (Withholding Tax)"],
    ["pedido de demissão", "resignation request"],
    ["aviso prévio", "notice period / prior notice"],
    ["aviso prévio indenizado", "indemnified prior notice"],
    ["aviso prévio trabalhado", "worked prior notice"],
    ["estabilidade provisória", "provisional stability"],
    ["gestante", "pregnant employee"],
    ["desde a confirmação da gravidez", "from pregnancy confirmation"],
    ["até 5 meses após o parto", "until 5 months after childbirth"],
    ["acidente de trabalho", "workplace accident"],
    ["CIPA", "CIPA (Internal Accident Prevention Commission)"],
    ["membro eleito", "elected member"],
    ["membro indicado", "appointed member"],
    ["trabalho intermitente", "intermittent work"],
    ["contrato de experiência", "probationary contract"],
    ["limite de dias", "day limit"],
    ["horas extras", "overtime hours"],
    ["banco de horas", "hours bank"],
    ["acordo individual escrito", "written individual agreement"],
    ["acordo coletivo", "collective agreement"],
    ["convenção coletiva", "collective bargaining agreement"],
    ["intervalo intrajornada", "meal/rest break (intrajornada)"],
    ["intervalo interjornada", "inter-workday rest break (interjornada)"],
    ["mínimo de 11 horas", "minimum of 11 hours"],
    ["mínimo de 1 hora", "minimum of 1 hour"],
    ["controle de ponto", "time-tracking / clock-in"],
    ["obrigatório para estabelecimentos com mais de", "mandatory for establishments with more than"],
    ["20 trabalhadores", "20 workers"],
    ["atestado médico", "medical certificate / doctor note"],
    ["justificar a ausência", "excuse the absence"],
    ["prazo de entrega", "submission deadline"],
    ["abono de faltas", "absence excuses / abono"],
    ["licença-maternidade", "maternity leave"],
    ["120 dias", "120 days"],
    ["licença-paternidade", "paternity leave"],
    ["5 dias", "5 days"],
    ["licença nojo", "bereavement leave (licença nojo)"],
    ["falecimento de cônjuge", "death of spouse"],
    ["licença gala", "marriage leave (licença gala)"],
    ["casamento do empregado", "employee marriage"],
    ["3 dias consecutivos", "3 consecutive days"],
    ["vale-transporte", "transportation voucher"],
    ["desconto máximo", "maximum deduction"],
    ["6% do salário-base", "6% of base salary"],
    ["salário-família", "family allowance (salário-família)"],
    ["filho com até", "child up to"],
    ["14 anos de idade", "14 years of age"],
    ["equiparar salários", "equalize salaries / equal pay"],
    ["mesma produtividade", "same productivity"],
    ["mesma perfeição técnica", "same technical perfection"],
    ["diferença de tempo de serviço", "service time difference"],
    ["não superior a 2 anos", "not exceeding 2 years"],
    ["desídia", "desídia (negligence / slackness)"],
    ["embriaguez em serviço", "drunkenness on duty"],
    ["ato de improbidade", "act of dishonesty / improbidade"],
    ["incontinência de conduta", "incontinence of conduct"],
    ["mau procedimento", "bad behavior / mau procedimento"],
    ["ofensas físicas", "physical assaults"],
    ["abandono de emprego", "job abandonment"],
    ["ausência injustificada por mais de", "unexcused absence for more than"],
    ["30 dias", "30 days"],
    ["rescisão indireta", "indirect resignation / constructive dismissal"],
    ["falta grave do empregador", "severe employer default"],
    ["culpa recíproca", "reciprocal fault"],
    ["ambas as partes", "both parties"],
    ["cometem falta grave", "commit a serious default"],
    ["acordo comum", "mutual agreement (Art. 484-A)"],
    ["demissão por acordo", "termination by mutual agreement"],
    ["multa do FGTS", "FGTS fine"],
    ["reduzida para 20%", "reduced to 20%"],
    ["reduzida pela metade", "reduced by half / halved"],
    ["saque do FGTS", "FGTS withdrawal"],
    ["limitado a 80%", "limited to 80%"],
    ["seguro-desemprego", "unemployment insurance"],
    ["não tem direito", "not entitled / no right"],
    ["metade do aviso prévio", "half of notice period"],
    ["férias vencidas", "overdue/expired vacations"],
    ["férias proporcionais", "proportional vacations"],
    ["13º proporcional", "proportional 13th salary"],
    ["saldo de salário", "salary balance"],
    ["empregado doméstico", "domestic worker"],
    ["trabalho temporário", "temporary work"],
    ["estagiário", "intern"],
    ["não rege pela CLT", "not governed by CLT"],
    ["lei própria", "own federal law"],
    ["recesso remunerado", "paid recess / recess"],
    ["vale-refeição", "meal voucher"],
    ["vale-alimentação", "grocery voucher"],
    ["patrono", "employer"],
    ["empregador", "employer"],
    ["trabalhador", "worker"],
    ["colaborador", "employee / worker"],
    ["convenção coletiva de trabalho", "collective bargaining agreement (CCT)"],
    ["acordo coletivo de trabalho", "collective agreement (ACT)"],
    ["Consolidação das Leis do Trabalho", "Consolidation of Labor Laws (CLT)"],
    ["Ministério do Trabalho", "Ministry of Labor"],
    ["Justiça do Trabalho", "Labor Court / Justice"],
    ["SAQUE LIBERADO — Direito reconhecido", "WITHDRAWAL RELEASED — Right recognized"],
    ["SAQUE BLOQUEADO — Direito negado", "WITHDRAWAL BLOCKED — Benefit denied"],
    ["SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)", "PARTIAL WITHDRAWAL (80%) — Mutual agreement (Art. 484-A)"],
    ["✅ SAQUE LIBERADO", "✅ WITHDRAWAL RELEASED"],
    ["❌ SAQUE BLOQUEADO", "❌ WITHDRAWAL BLOCKED"],
    ["⚠️ SAQUE PARCIAL", "⚠️ PARTIAL WITHDRAWAL"],
    ["Ajustar Lançamento", "Adjust Payroll Entry"],
    ["Apenas Explicar", "Just Explain Laws"],
    ["Retificar Folha", "Rectify Payroll"],
    ["Abonar Falta", "Excuse Absence"],
    ["Simulado de Ponto", "Time Card Sheet"],
    ["Ficha Cadastral do Empregado", "Employee Registry Card"],
    ["Ação Obrigatória do Operador", "Mandatory Action for Clerk"],
    ["Transmitir Evento", "Transmit Entry to e-Social"],
    ["Garantido", "Guaranteed"],
    ["Não garantido", "Not guaranteed"],
    ["Membro Familiar", "Family Member"],
    ["Atestado Médico", "Medical Certificate"],
    ["Horas Extras", "Overtime Hours"],
    ["Atrasado", "Late Clock-In"],
    ["Desconto", "Deduction"],
    ["DSR", "Paid Weekly Rest (DSR)"],
    ["Falta Justificada", "Excused Absence"],
    ["Falta", "Absence"],
    ["Abonado", "Excused"],
    ["Holerite", "Paycheck Pay-Slip"],
    ["TRCT", "Resignation Severance Sheet (TRCT)"],
    ["Demissão", "Dismissal / Resignation"],
    ["Justa Causa", "Just Cause"],
    ["Dispensa", "Layoff / Resignation"],
    ["Acordo Mútuo", "Mutual Consent"],
    ["Doença Grave", "Critical Illness"],
    ["Aposentadoria", "Retirement"],
    ["Experiência", "Probationary Contract"],
    ["Férias", "Vacation"],
    ["Sem Justa Causa", "Without Just Cause"],
    ["Pedido de Demissão", "Employee Resignation Request"],
  ];

  for (const [pt, en] of terms) {
    translated = translated.split(pt).join(en);
  }

  return translated;
}

export function translateChallenge(challenge: any, lang: "pt" | "en"): any {
  if (lang === "pt" || !challenge) return challenge;

  // 1. Initial cloned structure
  const translated = { ...challenge };

  // 2. Overlay static translated texts if available in CHALLENGE_TRANSLATIONS dictionary (Phase 0/some parts)
  const translation = CHALLENGE_TRANSLATIONS[challenge.id];
  if (translation) {
    translated.titulo = translation.titulo;
    translated.queixa = translation.queixa;
    translated.focoTecnico = translation.focoTecnico;
    if (challenge.opcoes && translation.opcoes) {
      translated.opcoes = challenge.opcoes.map((opt: any, index: number) => ({
        ...opt,
        texto: translation.opcoes[index] || opt.texto
      }));
    }
  } else {
    // 3. Dynamic glossary & automated translation overlays for title, focus, and complaint
    translated.titulo = ALL_CHALLENGE_TITLES_EN[challenge.id] || translateTextToEnglish(challenge.titulo);
    translated.queixa = ALL_CHALLENGE_QUEIXAS_EN[challenge.id] || translateTextToEnglish(challenge.queixa);
    translated.focoTecnico = ALL_TECHNICAL_FOCUSES_EN[challenge.focoTecnico] || translateTextToEnglish(challenge.focoTecnico);
    
    if (challenge.opcoes) {
      translated.opcoes = challenge.opcoes.map((opt: any) => ({
        ...opt,
        texto: translateTextToEnglish(opt.texto)
      }));
    }
  }

  // 4. Translate legal grounds (artigoLegal) & compliance justifications if present
  if (translated.gabarito) {
    translated.gabarito = { ...translated.gabarito };
    if (translated.gabarito.artigoLegal) {
      translated.gabarito.artigoLegal = translateTextToEnglish(translated.gabarito.artigoLegal);
    }
    if (translated.gabarito.valoresCorretos) {
      translated.gabarito.valoresCorretos = { ...translated.gabarito.valoresCorretos };
      if (translated.gabarito.valoresCorretos.justificativa) {
        translated.gabarito.valoresCorretos.justificativa = translateTextToEnglish(translated.gabarito.valoresCorretos.justificativa);
      }
    }
  }

  return translated;
}

